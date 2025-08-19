import * as useConfirmedTransactionMock from "@/domains/transaction/components/TransactionSuccessful/hooks/useConfirmedTransaction";

import { Contracts, DTO } from "@/app/lib/profiles";
import {
	env,
	getDefaultProfileId,
	getDefaultWalletMnemonic,
	mockProfileWithPublicAndTestNetworks,
	render,
	screen,
	syncFees,
	waitFor,
	within,
	getMainsailProfileId,
} from "@/utils/testing-library";
import React from "react";
import { requestMock, server } from "@/tests/mocks/server";

import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import { SendTransferSidePanel } from "./SendTransferSidePanel";
import nodeFeesFixture from "@/tests/fixtures/coins/mainsail/devnet/node-fees.json";
import transactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/transfer.json";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import transactionsFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions.json";
import userEvent from "@testing-library/user-event";

const passphrase = getDefaultWalletMnemonic();
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

const createTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(signedTransactionMock);

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let firstWalletAddress: string;
let resetProfileNetworksMock: () => void;

const selectFirstRecipient = () => userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));
const selectRecipient = () =>
	userEvent.click(within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"));

const continueButton = () => screen.getByTestId("SendTransfer__continue-button");
const sendButton = () => screen.getByTestId("SendTransfer__send-button");
const reviewStepID = "SendTransfer__review-step";
const formStepID = "SendTransfer__form-step";

// Select sender address via shared SelectAddressDropdown
const selectNthSenderAddress = async (index = 0) => {
	const container = screen.getByTestId("sender-address");
	await userEvent.click(within(container).getByTestId("SelectDropdown__input"));

	const elementTestId = `SelectDropdown__option--${index}`;

	await waitFor(() => {
		expect(screen.getByTestId(elementTestId)).toBeInTheDocument();
	});

	await userEvent.click(screen.getByTestId(elementTestId));
};

const selectFirstSenderAddress = async () => selectNthSenderAddress(0);

describe("SendTransferSidePanel", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();

		const { wallet: arkMainnetWallet } = await profile
			.walletFactory()
			.generate({ coin: "Mainsail", network: "mainsail.mainnet" });
		profile.wallets().push(arkMainnetWallet);

		firstWalletAddress = wallet.address();

		await syncFees(profile);

		server.use(
			requestMock(`https://dwallets-evm.mainsailhq.com/api/blocks*`, {
				data: {},
			}),
			requestMock(
				`https://dwallets-evm.mainsailhq.com/api/transactions/${transactionFixture.data.hash}`,
				transactionFixture,
			),
			requestMock("https://dwallets-evm.mainsailhq.com/api/transactions", transactionsFixture, {
				query: { address: wallet.address() },
			}),
			requestMock("https://ark-test-musig.arkvault.io/", { result: [] }, { method: "post" }),
			requestMock("https://ark-live.arkvault.io/api/node/fees", nodeFeesFixture),
		);
	});

	beforeEach(() => {
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
		vi.spyOn(wallet, "balance").mockReturnValue(1_000_000_000_000_000_000);

		vi.spyOn(useConfirmedTransactionMock, "useConfirmedTransaction").mockReturnValue({
			confirmations: 10,
			isConfirmed: true,
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		resetProfileNetworksMock();
	});

	it("should send a single transfer via side panel", async () => {
		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		// Select a valid sender address before proceeding
		await selectFirstSenderAddress();

		await selectRecipient();
		await expect(screen.findByTestId("Modal__inner")).resolves.toBeInTheDocument();
		await selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress));

		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled(), { interval: 5 });
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());
		await userEvent.click(document.body);

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.000126");

		expect(continueButton()).not.toBeDisabled();
		await userEvent.click(continueButton());
		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		const signMock = vi
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.hash));
		const broadcastMock = vi
			.spyOn(wallet.transaction(), "broadcast")
			.mockResolvedValue({ accepted: [transactionFixture.data.hash], errors: {}, rejected: [] });
		const transactionMock = createTransactionMock(wallet);

		await waitFor(() => expect(sendButton()).not.toBeDisabled(), { interval: 10 });
		await userEvent.click(sendButton());

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});
});
