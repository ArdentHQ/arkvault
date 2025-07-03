/* eslint-disable testing-library/no-unnecessary-act */ // @TODO remove and fix test

import { Contracts, DTO, ReadOnlyWallet } from "@/app/lib/profiles";
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
} from "@/utils/testing-library";
import { requestMock, server } from "@/tests/mocks/server";
import { AddressService } from "@/app/lib/mainsail/address.service";
import React from "react";
import { SendVote } from "./SendVote";
import { VoteValidatorProperties } from "@/domains/vote/components/ValidatorsTable/ValidatorsTable.contracts";
import { appendParameters } from "@/domains/vote/utils/url-parameters";
import { data as validatorData } from "@/tests/fixtures/coins/mainsail/devnet/validators.json";
import userEvent from "@testing-library/user-event";
import transactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/transfer.json";
import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";

const fixtureProfileId = getDefaultProfileId();

const signedTransactionMock = {
	blockHash: () => {},
	confirmations: () => BigNumber.ZERO,
	convertedAmount: () => +transactionFixture.data.value / 1e8,
	convertedFee: () => {
		const fee = BigNumber.make(transactionFixture.data.gasPrice).times(transactionFixture.data.gas).divide(1e8);
		return fee.toNumber();
	},
	convertedTotal: () => BigNumber.ZERO,
	data: () => transactionFixture.data,
	explorerLink: () => `https://test.arkscan.io/transaction/${transactionFixture.data.hash}`,
	explorerLinkForBlock: () => {},
	fee: () => BigNumber.make(transactionFixture.data.gasPrice).times(transactionFixture.data.gas),
	from: () => transactionFixture.data.from,
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
	// @ts-ignore
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

const votingMockImplementation = () => [
	{
		amount: 10,
		wallet: new ReadOnlyWallet({
			address: validatorData[1].address,
			explorerLink: "",
			governanceIdentifier: "address",
			isResignedValidator: false,
			isValidator: true,
			publicKey: validatorData[1].publicKey,
			username: validatorData[1].username,
		}),
	},
];

const continueButton = () => screen.getByTestId("StepNavigation__continue-button");
const sendButton = () => screen.getByTestId("StepNavigation__send-button");

const reviewStepID = "SendVote__review-step";
const authenticationStepID = "AuthenticationStep";

describe("SendVote Combined", () => {
	let resetProfileNetworksMock: () => void;

	beforeAll(async () => {
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
	});

	beforeEach(() => {
		server.use(
			requestMock(
				"https://dwallets-evm.mainsailhq.com/api/transactions/f7054cf37ce49e17cf2b06a0a868cac183bf78e2f1b4a6fe675f2412364fe0a",
				transactionFixture,
			),
			requestMock(
				"https://dwallets-evm.mainsailhq.com/api/transactions/8e4a8c3eaf2f9543a5bd61bb85ddd2205d5091597a77446c8b99692e0854b978",
				transactionFixture,
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

	it("should send a unvote & vote transaction", async () => {
		const votesMock = vi.spyOn(wallet.voting(), "current").mockImplementation(votingMockImplementation);
		await wallet.synchroniser().votes();

		const mnemonicMock = vi.spyOn(AddressService.prototype, "fromMnemonic").mockReturnValue({
			address: wallet.address(),
		});

		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const parameters = new URLSearchParams(`?walletId=${wallet.id()}&nethash=${wallet.network().meta().nethash}`);

		const unvotes: VoteValidatorProperties[] = [
			{
				amount: 10,
				validatorAddress: validatorData[1].address,
			},
		];

		appendParameters(parameters, "unvote", unvotes);

		const votes: VoteValidatorProperties[] = [
			{
				amount: 10,
				validatorAddress: validatorData[0].address,
			},
		];

		appendParameters(parameters, "vote", votes);

		const { router } = render(<SendVote />, {
			route: {
				pathname: voteURL,
				search: `?${parameters}`,
			},
		});

		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(reviewStepID)).toHaveTextContent(validatorData[1].address));

		await waitFor(() => {
			expect(screen.getAllByRole("radio")[1]).toBeChecked();
		});

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		// AuthenticationStep
		expect(screen.getByTestId(authenticationStepID)).toBeInTheDocument();

		const signUnvoteMock = vi
			.spyOn(wallet.transaction(), "signVote")
			.mockReturnValue(Promise.resolve(transactionFixture.data.hash));
		const broadcastUnvoteMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.hash],
			errors: {},
			rejected: [],
		});
		const transactionUnvoteMock = createVoteTransactionMock(wallet);

		const signVoteMock = vi
			.spyOn(wallet.transaction(), "signVote")
			.mockReturnValue(Promise.resolve(transactionFixture.data.hash));
		const broadcastVoteMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.hash],
			errors: {},
			rejected: [],
		});
		const transactionVoteMock = createVoteTransactionMock(wallet);

		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		await userEvent.clear(passwordInput);
		await userEvent.type(passwordInput, passphrase);

		expect(passwordInput).toHaveValue(passphrase);

		await waitFor(() => expect(sendButton()).not.toBeDisabled());

		await act(async () => {
			await userEvent.click(sendButton());
		});

		act(() => {
			vi.advanceTimersByTime(1000);
		});

		setTimeout(() => {
			votesMock.mockRestore();
		}, 3000);

		act(() => {
			vi.runOnlyPendingTimers();
		});

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		// Go back to wallet
		await userEvent.click(screen.getByTestId("StepNavigation__back-to-wallet-button"));

		expect(router.state.location.pathname).toBe(`/profiles/${profile.id()}/dashboard`);

		signUnvoteMock.mockRestore();
		broadcastUnvoteMock.mockRestore();
		transactionUnvoteMock.mockRestore();

		signVoteMock.mockRestore();
		broadcastVoteMock.mockRestore();
		transactionVoteMock.mockRestore();
		mnemonicMock.mockRestore();
	});
});
