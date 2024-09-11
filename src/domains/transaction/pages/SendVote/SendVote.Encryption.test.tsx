/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable testing-library/no-unnecessary-act */ // @TODO remove and fix test
import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Route } from "react-router-dom";

import { SendVote } from "./SendVote";
import { VoteDelegateProperties } from "@/domains/vote/components/DelegateTable/DelegateTable.contracts";
import { appendParameters } from "@/domains/vote/utils/url-parameters";
import { data as delegateData } from "@/tests/fixtures/coins/ark/devnet/delegates.json";
import unvoteFixture from "@/tests/fixtures/coins/ark/devnet/transactions/unvote.json";
import voteFixture from "@/tests/fixtures/coins/ark/devnet/transactions/vote.json";
import {
	act,
	env,
	getDefaultProfileId,
	getDefaultWalletMnemonic,
	render,
	screen,
	syncDelegates,
	syncFees,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";

const fixtureProfileId = getDefaultProfileId();

const createVoteTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	// @ts-ignore
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => voteFixture.data.amount / 1e8,
		data: () => ({ data: () => voteFixture.data }),
		explorerLink: () => `https://test.arkscan.io/transaction/${voteFixture.data.id}`,
		fee: () => voteFixture.data.fee / 1e8,
		id: () => voteFixture.data.id,
		isMultiSignatureRegistration: () => false,
		recipient: () => voteFixture.data.recipient,
		sender: () => voteFixture.data.sender,
		type: () => "vote",
		usesMultiSignature: () => false,
		isDelegateResignation: () => false,
		isDelegateRegistration: () => false,
		isIpfs: () => false,
		isVote: () => true,
		isConfirmed: () => true,
	});

const passphrase = getDefaultWalletMnemonic();
let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

const continueButton = () => screen.getByTestId("StepNavigation__continue-button");
const sendButton = () => screen.getByTestId("StepNavigation__send-button");

const reviewStepID = "SendVote__review-step";
const formStepID = "SendVote__form-step";

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

vi.mock("@/utils/debounce", () => ({
	debounceAsync: (callback: () => void) =>
		async function (...arguments_: any) {
			return new Promise((resolve) => {
				setTimeout(() => {
					resolve(callback.apply(this, arguments_));
				}, 0);
			});
		},
}));

describe("SendVote", () => {
	let resetProfileNetworksMock: () => void;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().findById("ac38fe6d-4b67-4ef1-85be-17c5f6841129");
		await wallet.synchroniser().identity();

		vi.spyOn(wallet, "isDelegate").mockImplementation(() => true);

		await syncDelegates(profile);
		await syncFees(profile);

		for (const index of [0, 1]) {
			/* eslint-disable-next-line testing-library/prefer-explicit-assert */
			env.delegates().findByAddress(wallet.coinId(), wallet.networkId(), delegateData[index].address);
		}

		vi.spyOn(wallet.synchroniser(), "votes").mockImplementation(vi.fn());
	});

	beforeEach(() => {
		server.use(
			requestMock(
				"https://ark-test.arkvault.io/api/transactions/d819c5199e323a62a4349948ff075edde91e509028329f66ec76b8518ad1e493",
				voteFixture,
			),
			requestMock(
				"https://ark-test.arkvault.io/api/transactions/32e5278cb72f24f2c04c4797dbfbffa7072f6a30e016093fdd3f7660a2ee2faf",
				unvoteFixture,
			),
			requestMock("https://ark-test-musig.arkvault.io/", { result: [] }, { method: "post" }),
		);

		vi.useFakeTimers();
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		vi.useRealTimers();
		resetProfileNetworksMock();
	});

	it("should send a vote transaction using encryption password", async () => {
		vi.useRealTimers();

		const actsWithMnemonicMock = vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);
		const actsWithWifWithEncryptionMock = vi.spyOn(wallet, "actsWithWifWithEncryption").mockReturnValue(true);
		const wifGetMock = vi.spyOn(wallet.signingKey(), "get").mockReturnValue(passphrase);

		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;
		const parameters = new URLSearchParams(`?walletId=${wallet.id()}&nethash=${wallet.network().meta().nethash}`);

		const fromMnemonicMock = vi
			.spyOn(wallet.coin().address(), "fromMnemonic")
			.mockResolvedValue({ address: wallet.address() });

		const votes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[0].address,
			},
		];

		appendParameters(parameters, "vote", votes);

		// eslint-disable-next-line sonarjs/no-identical-functions
		const { result: form } = renderHook(() =>
			useForm({
				defaultValues: {
					fee: "0.1",
				},
			}),
		);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<FormProvider {...form.current}>
					<SendVote />
				</FormProvider>
			</Route>,
			{
				route: {
					pathname: voteURL,
					search: `?${parameters}`,
				},
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await userEvent.click(continueButton());

		// AuthenticationStep
		expect(screen.getByTestId("AuthenticationStep")).toBeInTheDocument();

		const signMock = vi
			.spyOn(wallet.transaction(), "signVote")
			.mockReturnValue(Promise.resolve(voteFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [voteFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createVoteTransactionMock(wallet);

		const passwordInput = screen.getByTestId("AuthenticationStep__encryption-password");
		await userEvent.clear(passwordInput);
		await userEvent.type(passwordInput, "password");

		await waitFor(() => expect(passwordInput).toHaveValue("password"));

		await waitFor(() => expect(sendButton()).not.toBeDisabled());

		await act(async () => {
			await userEvent.click(sendButton());
		});

		await expect(screen.findByTestId("TransactionSuccessful", undefined, { timeout: 4000 })).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		actsWithMnemonicMock.mockRestore();
		actsWithWifWithEncryptionMock.mockRestore();
		wifGetMock.mockRestore();
		fromMnemonicMock.mockRestore();
	});
});
