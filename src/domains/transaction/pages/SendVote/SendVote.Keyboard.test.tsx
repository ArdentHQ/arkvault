// @TODO remove and fix test

import { FormProvider, useForm } from "react-hook-form";
import {
	act,
	env,
	getDefaultProfileId,
	getDefaultWalletMnemonic,
	mockProfileWithPublicAndTestNetworks,
	render,
	screen,
	syncValidators,
	syncFees,
	waitFor,
	within,
} from "@/utils/testing-library";
import { requestMock, server } from "@/tests/mocks/server";

import { Contracts, DTO } from "@/app/lib/profiles";
import React from "react";
import { SendVote } from "./SendVote";
import { VoteValidatorProperties } from "@/domains/vote/components/ValidatorsTable/ValidatorsTable.contracts";
import { appendParameters } from "@/domains/vote/utils/url-parameters";
import { data as validatorData } from "@/tests/fixtures/coins/mainsail/devnet/validators.json";
import { renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import transactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/transfer.json";
import { AddressService } from "@/app/lib/mainsail/address.service";
import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";

const fixtureProfileId = getDefaultProfileId();

const signedTransactionMock = {
	blockHash: () => {},
	confirmations: () => BigNumber.ZERO,
	convertedAmount: () => +transactionFixture.data.value / 1e8,
	convertedFee: () => {
		const fee = BigNumber.make(transactionFixture.data.gasPrice).times(transactionFixture.data.gas).dividedBy(1e8);
		return fee.toNumber();
	},
	convertedTotal: () => BigNumber.ZERO,
	data: () => transactionFixture.data,
	explorerLink: () => `https://test.arkscan.io/transaction/${transactionFixture.data.hash}`,
	explorerLinkForBlock: () => {},
	fee: () => BigNumber.make(transactionFixture.data.gasPrice).times(transactionFixture.data.gas),
	from: () => transactionFixture.data.from,
	gasLimit: () => transactionFixture.data.gasLimit,
	gasUsed: () => transactionFixture.data.receipt.gasUsed,
	hash: () => transactionFixture.data.hash,
	isConfirmed: () => false,
	isMultiPayment: () => false,
	isMultiSignatureRegistration: () => false,
	isReturn: () => false,
	isSecondSignature: () => false,
	isSent: () => true,
	isSuccess: () => true,
	isTransfer: () => true,
	isUnvote: () => false,
	isUpdateValidator: () => false,
	isUsernameRegistration: () => false,
	isUsernameResignation: () => false,
	isValidatorRegistration: () => false,
	isValidatorResignation: () => false,
	isVote: () => false,
	isVoteCombination: () => false,
	memo: () => transactionFixture.data.memo || undefined,
	nonce: () => BigNumber.make(transactionFixture.data.nonce),
	payments: () => [],
	recipients: () => [
		{
			address: transactionFixture.data.to,
			amount: +transactionFixture.data.value / 1e8,
		},
	],
	timestamp: () => DateTime.make(transactionFixture.data.timestamp),
	to: () => transactionFixture.data.to,
	total: () => {
		const value = BigNumber.make(transactionFixture.data.value);
		const feeVal = BigNumber.make(transactionFixture.data.gasPrice).times(transactionFixture.data.gas);
		return value.plus(feeVal);
	},
	type: () => "transfer",
	usesMultiSignature: () => false,
	value: () => +transactionFixture.data.value / 1e8,
	wallet: () => wallet,
} as DTO.ExtendedSignedTransactionData;

const createVoteTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		...signedTransactionMock,
		isTransfer: () => false,
		isVote: () => true,
		type: () => "vote",
		wallet: () => wallet,
	});

const passphrase = getDefaultWalletMnemonic();
let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

const continueButton = () => screen.getByTestId("StepNavigation__continue-button");
const sendButton = () => screen.getByTestId("StepNavigation__send-button");

const reviewStepID = "SendVote__review-step";
const authenticationStepID = "AuthenticationStep";

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

		wallet = profile.wallets().findById("ee02b13f-8dbf-4191-a9dc-08d2ab72ec28");
		await wallet.synchroniser().identity();

		vi.spyOn(wallet, "isValidator").mockImplementation(() => true);

		await syncValidators(profile);
		await syncFees(profile);

		for (const index of [0, 1]) {
			/* eslint-disable-next-line testing-library/prefer-explicit-assert */
			profile.validators().findByAddress(wallet.networkId(), validatorData[index].address);
		}

		vi.spyOn(wallet.synchroniser(), "votes").mockImplementation(vi.fn());
	});

	beforeEach(() => {
		server.use(
			requestMock(
				"https://dwallets-evm.mainsailhq.com/api/transactions/f7054cf37ce49e17cf2b06a0a868cac183bf78e2f1b4a6fe675f2412364fe0a",
				transactionFixture,
			),
			requestMock(
				"https://dwallets-evm.mainsailhq.com/api/transactions/8e4a8c3eaf2f9543a5bd61bb85ddd2205d5091597a77446c8b99692e0854b978",
				{
					data: {
						...transactionFixture.data,
						data: "3174b689",
					},
				},
			),
			requestMock("https://dwallets-evm.mainsailhq.com/api/blocks/*", { data: {} }),
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

		const mnemonicMock = vi.spyOn(AddressService.prototype, "fromMnemonic").mockReturnValue({
			address: wallet.address(),
		});

		const votes: VoteValidatorProperties[] = [
			{
				amount: 10,
				validatorAddress: validatorData[0].address,
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
			<FormProvider {...form.current}>
				<SendVote />
			</FormProvider>,
			{
				route: {
					pathname: voteURL,
					search: `?${parameters}`,
				},
			},
		);

		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(reviewStepID)).toHaveTextContent(validatorData[0].address));

		await waitFor(() => {
			expect(screen.getAllByRole("radio")[1]).toBeChecked();
		});

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

		// AuthenticationStep
		expect(screen.getByTestId(authenticationStepID)).toBeInTheDocument();

		const signMock = vi
			.spyOn(wallet.transaction(), "signVote")
			.mockReturnValue(Promise.resolve(transactionFixture.data.hash));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.hash],
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
