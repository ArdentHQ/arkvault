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
	within,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";

import unvoteFixture from "@/tests/fixtures/coins/ark/devnet/transactions/unvote.json";
import voteFixture from "@/tests/fixtures/coins/ark/devnet/transactions/vote.json";
import { DateTime } from "@ardenthq/sdk-intl";
import { BigNumber } from "@ardenthq/sdk-helpers";

const fixtureProfileId = getDefaultProfileId();

const createVoteTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	// @ts-ignore
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => voteFixture.data.amount / 1e8,
		blockId: () => "1",
		convertedAmount: () => BigNumber.make(10),
		data: () => ({ data: () => voteFixture.data }),
		explorerLink: () => `https://test.arkscan.io/transaction/${voteFixture.data.id}`,
		explorerLinkForBlock: () => `https://test.arkscan.io/block/${voteFixture.data.id}`,
		fee: () => voteFixture.data.fee / 1e8,
		id: () => voteFixture.data.id,
		isConfirmed: () => true,
		isDelegateRegistration: () => false,
		isDelegateResignation: () => false,
		isIpfs: () => false,
		isMultiPayment: () => false,
		isMultiSignatureRegistration: () => false,
		isSent: () => true,
		isTransfer: () => false,
		isUnvote: () => false,
		isVote: () => true,
		isVoteCombination: () => false,
		memo: () => null,
		recipient: () => voteFixture.data.recipient,
		sender: () => voteFixture.data.sender,
		timestamp: () => DateTime.make(),
		type: () => "vote",
		usesMultiSignature: () => false,
		wallet: () => wallet,
	});

const passphrase = getDefaultWalletMnemonic();
let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

const continueButton = () => screen.getByTestId("StepNavigation__continue-button");
const sendButton = () => screen.getByTestId("StepNavigation__send-button");

const reviewStepID = "SendVote__review-step";
const formStepID = "SendVote__form-step";

describe("SendVote", () => {
	let resetProfileNetworksMock: () => void;

	beforeAll(async () => {
		vi.useFakeTimers({
			shouldAdvanceTime: true,
			toFake: ["setInterval", "clearInterval"],
		});

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

		vi.useFakeTimers({ shouldAdvanceTime: true });
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		vi.useRealTimers();
		resetProfileNetworksMock();
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	it.each(["with keyboard", "without keyboard"])("should send a vote transaction %s", async (inputMethod) => {
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;
		const parameters = new URLSearchParams(`?walletId=${wallet.id()}&nethash=${wallet.network().meta().nethash}`);
		const walletVoteSyncMock = vi.spyOn(wallet.synchroniser(), "votes").mockResolvedValue(undefined);

		const mnemonicMock = vi
			.spyOn(wallet.coin().address(), "fromMnemonic")
			.mockResolvedValue({ address: wallet.address() });

		const votes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[0].address,
			},
		];

		appendParameters(parameters, "vote", votes);

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

		// Fee
		await waitFor(() => {
			expect(screen.getAllByRole("radio")[1]).toBeChecked();
		});

		await userEvent.click(within(screen.getAllByTestId("InputFee")[0]).getAllByRole("radio")[2]);

		expect(screen.getAllByRole("radio")[2]).toBeChecked();

		// remove focus from fee button
		await userEvent.click(document.body);

		await waitFor(() => expect(continueButton()).not.toBeDisabled(), { timeout: 3000 });

		if (inputMethod === "with keyboard") {
			await userEvent.keyboard("{enter}");
		} else {
			await userEvent.click(continueButton());
		}

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		if (inputMethod === "with keyboard") {
			await userEvent.keyboard("{enter}");
		} else {
			await userEvent.click(continueButton());
		}

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

		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		await userEvent.type(passwordInput, passphrase);

		await waitFor(() => {
			expect(passwordInput).toHaveValue(passphrase);
		});

		act(() => {
			vi.advanceTimersByTime(1000);
		});

		await waitFor(() => expect(sendButton()).not.toBeDisabled());

		await act(async () => {
			if (inputMethod === "with keyboard") {
				await userEvent.keyboard("{enter}");
			} else {
				await userEvent.click(sendButton());
			}
		});

		await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

		await act(() => vi.runOnlyPendingTimers());

		await expect(screen.findByText("Unvote")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		walletVoteSyncMock.mockRestore();
		mnemonicMock.mockRestore();
	});
});
