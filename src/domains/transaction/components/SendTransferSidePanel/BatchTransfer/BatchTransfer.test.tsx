import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import { SendTransferSidePanel } from "@/domains/transaction/components/SendTransferSidePanel/SendTransferSidePanel";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	waitFor,
	within,
	getDefaultWalletMnemonic,
} from "@/utils/testing-library";
import * as ReactRouter from "react-router";
import { WalletTokenDTO } from "@/app/lib/profiles/wallet-token.dto";
import { TokenDTO } from "@/app/lib/profiles/token.dto";
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { WalletTokenCollection } from "@/app/lib/mainsail/wallet-token.collection";
import Fixtures from "@/tests/fixtures/coins/mainsail/devnet/tokens.json";
import { expect } from "vitest";
import { requestMock, server } from "@/tests/mocks/server";
import { SignedTransactionData } from "@/app/lib/mainsail/signed-transaction.dto";
import { ExtendedSignedTransactionData } from "@/app/lib/profiles/signed-transaction.dto";
import { http, HttpResponse } from "msw";
import { numberToHex, parseUnits } from "viem";

const formStepID = "SendTransfer__form-step";
const reviewStepID = "BatchTransfer__review-step";
const approveStepID = "BatchTransfer__approve-step";
const confirmTransferStepID = "BatchTransfer__confirm-transfer-step";
const recipientAddButton = "AddRecipient__add-button";

const passphrase = getDefaultWalletMnemonic();
const selectedAsset = "0xdeb478251073157e400c3d8d2ed92a85c958f9fa";
let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

const selectNthSenderAddress = async (index = 0) => {
	const container = screen.getByTestId("sender-address");
	await userEvent.click(within(container).getByTestId("SelectDropdown__input"));

	const elementTestId = `SelectDropdown__option--${index}`;

	await waitFor(() => {
		expect(screen.getByTestId(elementTestId)).toBeInTheDocument();
	});

	await userEvent.click(screen.getByTestId(elementTestId));
};

const addRecipient = async (recipientAddress: string, amount: string) => {
	await userEvent.clear(screen.getAllByTestId("SelectDropdown__input")[1]);
	await userEvent.type(screen.getAllByTestId("SelectDropdown__input")[1], recipientAddress);
	await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
	await userEvent.type(screen.getByTestId("AddRecipient__amount"), amount);

	await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue(amount));
	await waitFor(() => expect(screen.getByTestId(recipientAddButton)).toBeEnabled());
	await userEvent.click(screen.getByTestId(recipientAddButton));
};

const fillMnemonic = async () => {
	await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
	await userEvent.paste(passphrase);
	await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));
};

const selectFirstSenderAddress = async () => selectNthSenderAddress(0);

const continueButton = () => screen.getByTestId("SendTransfer__continue-button");
const batchTransferContinueButton = () => screen.getByTestId("BatchTransfer__continue-button");
const backButton = () => screen.getByTestId("BatchTransfer__back-button");

const fillFormStep = async (): Promise<void> => {
	await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

	await selectFirstSenderAddress();

	await userEvent.click(screen.getByText(transactionTranslations.MULTIPLE));

	await expect(screen.findByTestId(recipientAddButton)).resolves.toBeVisible();

	await addRecipient(profile.wallets().first().address(), "1");

	await waitFor(() => expect(screen.getAllByTestId("AddRecipientItem")).toHaveLength(1));

	await addRecipient(profile.wallets().last().address(), "1");

	await waitFor(() => expect(screen.getAllByTestId("AddRecipientItem")).toHaveLength(2));
};
const mockAllowanceCall = (once = true, amount = "250") => {
	server.use(
		http.post(
			"https://dwallets-evm.mainsailhq.com/evm/api",
			async () =>
				HttpResponse.json({
					id: 1,
					jsonrpc: "2.0",
					result: numberToHex(parseUnits(amount, 18), { size: 32 }),
				}),
			{ once },
		),
	);
};

describe("#BatchTransfer", () => {
	beforeAll(async () => {
		vi.spyOn(ReactRouter, "useSearchParams").mockReturnValue([new URLSearchParams(), vi.fn()]);

		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		const fixtureData = Fixtures.ByContractAddress.data;
		const walletTokenData = Fixtures.ByWalletAddress.data[0];

		profile
			.wallets()
			.first()
			.tokens()
			.create({
				token: new TokenDTO(fixtureData),
				walletToken: new WalletTokenDTO(walletTokenData),
			});

		const tokensCollection = new WalletTokenCollection(
			[
				new WalletToken({
					network: profile.activeNetwork(),
					profile,
					token: new TokenDTO(fixtureData),
					walletToken: new WalletTokenDTO(walletTokenData),
				}),
			],
			{
				last: undefined,
				next: 0,
				prev: undefined,
				self: undefined,
			},
		);

		vi.spyOn(profile.tokens(), "selected").mockReturnValue(tokensCollection);
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	it("should send batch transfer transaction", { timeout: 8000 }, async () => {
		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} tokenContractAddress={selectedAsset} />, {
			route: `/profiles/${getDefaultProfileId()}/dashboard`,
		});

		await fillFormStep();

		// Navigate to review step
		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Navigate to approve contract step
		await waitFor(() => expect(batchTransferContinueButton()).toBeEnabled());
		await userEvent.click(batchTransferContinueButton());
		await expect(screen.findByTestId(approveStepID)).resolves.toBeVisible();

		await fillMnemonic();

		// Mock requests and methods
		const approveTxData = approveTransactionData(wallet);

		let signedTx = new ExtendedSignedTransactionData(
			new SignedTransactionData().configure(approveTxData.signed),
			wallet,
		);

		let transactionMock = vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(signedTx);

		let hash = signedTx.hash();

		server.use(
			requestMock(`https://dwallets-evm.mainsailhq.com/api/transactions/${hash}`, approveTxData.confirmed),
		);

		let signMock = vi.spyOn(wallet.transaction(), "signApproveContract").mockReturnValue(Promise.resolve(hash));

		let broadcastMock = vi
			.spyOn(wallet.transaction(), "broadcast")
			.mockResolvedValue({ accepted: [hash], errors: {}, rejected: [] });

		// Send approve contract transaction
		await waitFor(() => expect(batchTransferContinueButton()).toBeEnabled());
		await userEvent.click(batchTransferContinueButton());

		await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();

		// Navigate to confirm transfer step
		await waitFor(() => expect(batchTransferContinueButton()).toBeEnabled());
		await userEvent.click(batchTransferContinueButton());

		await expect(screen.findByTestId(confirmTransferStepID)).resolves.toBeVisible();

		await fillMnemonic();

		await waitFor(() => expect(batchTransferContinueButton()).toBeEnabled());

		// Mock requests and methods
		const batchTransferTxData = batchTransferTransactionData(wallet);

		signedTx = new ExtendedSignedTransactionData(
			new SignedTransactionData().configure(batchTransferTxData.signed),
			wallet,
		);

		transactionMock = vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(signedTx);

		hash = signedTx.hash();

		server.use(
			requestMock(`https://dwallets-evm.mainsailhq.com/api/transactions/${hash}`, batchTransferTxData.confirmed),
		);

		signMock = vi.spyOn(wallet.transaction(), "signMultiPayment").mockReturnValue(Promise.resolve(hash));

		broadcastMock = vi
			.spyOn(wallet.transaction(), "broadcast")
			.mockResolvedValue({ accepted: [hash], errors: {}, rejected: [] });

		// Send batch transfer transaction
		await userEvent.click(batchTransferContinueButton());

		await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});

	it("should send batch transfer transaction without contract approval", { timeout: 8000 }, async () => {
		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} tokenContractAddress={selectedAsset} />, {
			route: `/profiles/${getDefaultProfileId()}/dashboard`,
		});

		await fillFormStep();

		mockAllowanceCall();

		// Navigate to review step
		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Navigate to confirm transfer step
		await waitFor(() => expect(batchTransferContinueButton()).toBeEnabled());
		await userEvent.click(batchTransferContinueButton());

		await fillMnemonic();

		await waitFor(() => expect(batchTransferContinueButton()).toBeEnabled());

		// Mock requests and methods
		const batchTransferTxData = batchTransferTransactionData(wallet);

		const signedTx = new ExtendedSignedTransactionData(
			new SignedTransactionData().configure(batchTransferTxData.signed),
			wallet,
		);

		const transactionMock = vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(signedTx);

		const hash = signedTx.hash();

		server.use(
			requestMock(`https://dwallets-evm.mainsailhq.com/api/transactions/${hash}`, batchTransferTxData.confirmed),
		);

		const signMock = vi.spyOn(wallet.transaction(), "signMultiPayment").mockReturnValue(Promise.resolve(hash));

		const broadcastMock = vi
			.spyOn(wallet.transaction(), "broadcast")
			.mockResolvedValue({ accepted: [hash], errors: {}, rejected: [] });

		// Send batch transfer transaction
		await userEvent.click(batchTransferContinueButton());

		await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});

	it("should display error when sending contract approval transaction fails", async () => {
		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} tokenContractAddress={selectedAsset} />, {
			route: `/profiles/${getDefaultProfileId()}/dashboard`,
		});

		await fillFormStep();

		// Navigate to review step
		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Navigate to approve contract step
		await waitFor(() => expect(batchTransferContinueButton()).toBeEnabled());
		await userEvent.click(batchTransferContinueButton());
		await expect(screen.findByTestId(approveStepID)).resolves.toBeVisible();

		await fillMnemonic();

		const signMock = vi.spyOn(wallet.transaction(), "signApproveContract").mockImplementation(() => {
			throw new Error("error");
		});

		// Try to send approve contract transaction
		await waitFor(() => expect(batchTransferContinueButton()).toBeEnabled());
		await userEvent.click(batchTransferContinueButton());

		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();
		signMock.mockRestore();
	});

	it("should navigate back properly", async () => {
		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} tokenContractAddress={selectedAsset} />, {
			route: `/profiles/${getDefaultProfileId()}/dashboard`,
		});

		await fillFormStep();

		mockAllowanceCall(false);

		// Navigate to review step
		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Navigate to confirm step
		await waitFor(() => expect(batchTransferContinueButton()).toBeEnabled());
		await userEvent.click(batchTransferContinueButton());
		await expect(screen.findByTestId(confirmTransferStepID)).resolves.toBeVisible();

		// Should go back to review step when active tab is Confirm Transfer step
		await userEvent.click(backButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Should go back to form step when active tab is Review step
		await userEvent.click(backButton());
		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		// Add a new recipient
		await expect(screen.findByTestId(recipientAddButton)).resolves.toBeVisible();
		await addRecipient(profile.wallets().first().address(), "3");
		await waitFor(() => expect(screen.getAllByTestId("AddRecipientItem")).toHaveLength(3));

		mockAllowanceCall(false, "0");

		// Navigate to review step
		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Navigate to approve step
		await waitFor(() => expect(batchTransferContinueButton()).toBeEnabled());
		await userEvent.click(batchTransferContinueButton());
		await expect(screen.findByTestId(approveStepID)).resolves.toBeVisible();

		// Should go back to previous step - activeTab - 1
		await userEvent.click(backButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();
	});
});

const approveTransactionData = (wallet: Contracts.IReadWriteWallet) => ({
	confirmed: {
		data: {
			blockHash: "7c29a8edbe5ef6c5dff9fa72bae66c000f1d05f271d2cc45bfd214632f5e81d8",
			confirmations: 153,
			data: "0x095ea7b30000000000000000000000005a223f4434d5bd8478100eeb3b0166a57a26350d000000000000000000000000000000000000000000000001c9f78d2893e40000",
			from: wallet.address(),
			gas: "57045",
			gasPrice: "10223606577",
			hash: "41b9d5b2a6202a41d18d52c4ff60aa02191680f9e7eb81285087a725dbb675a7",
			nonce: "143",
			receipt: {
				cumulativeGasUsed: 46964,
				gasRefunded: 0,
				gasUsed: 46964,
				status: 1,
			},
			senderPublicKey: "022a40ea35d53eedf0341ffa17574fca844d69665ce35f224e9a6b1385575044fd",
			signature:
				"848f0a23717956b46ff750969ec647b925ca103023de1cc356a67cc2d390751324dc8eaa7d64e24ef93815defce14dbf7675b5438b8dbac2287576a72f09207600",
			timestamp: "1782844670077",
			to: "0x12f6677522292654A231007C47B07971a7610908",
			tokens: [
				{
					action: "Approval",
					from: "0xA5cc0BfEB09742C5e4C610f2EBaaB82Eb142Ca10",
					index: 0,
					metadata: {
						tokenAddress: "0x12f6677522292654a231007c47b07971a7610908",
						tokenDecimals: 18,
						tokenName: "DARK20",
						tokenSymbol: "DARK20",
					},
					to: "0x5a223F4434D5Bd8478100EEb3b0166a57A26350d",
					value: "33000000000000000000",
				},
			],
			value: "0",
		},
	},
	signed: {
		data: "095ea7b30000000000000000000000005a223f4434d5bd8478100eeb3b0166a57a26350d000000000000000000000000000000000000000000000001c9f78d2893e40000",
		from: wallet.address(),
		gasLimit: "57045",
		gasPrice: "10223606577",
		hash: "41b9d5b2a6202a41d18d52c4ff60aa02191680f9e7eb81285087a725dbb675a7",
		nonce: "143",
		senderPublicKey: "022a40ea35d53eedf0341ffa17574fca844d69665ce35f224e9a6b1385575044fd",
		to: "0x12f6677522292654a231007c47b07971a7610908",
		value: "0",
	},
});

const batchTransferTransactionData = (wallet: Contracts.IReadWriteWallet) => {
	const token = {
		action: "Transfer",
		from: "0xA5cc0BfEB09742C5e4C610f2EBaaB82Eb142Ca10",
		index: 1,
		metadata: {
			tokenAddress: "0x12f6677522292654a231007c47b07971a7610908",
			tokenDecimals: 18,
			tokenName: "DARK20",
			tokenSymbol: "DARK20",
		},
		to: "0xA5cc0BfEB09742C5e4C610f2EBaaB82Eb142Ca10",
		value: "21000000000000000000",
	};

	return {
		confirmed: {
			data: {
				blockHash: "813165cf67806beee4293d57d0dcec68bb93621ae5c9be8cd78a8ff9da1a177a",
				confirmations: 28,
				data: "0x4885b25400000000000000000000000012f6677522292654a231007c47b07971a7610908000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000a5cc0bfeb09742c5e4c610f2ebaab82eb142ca10000000000000000000000000a5cc0bfeb09742c5e4c610f2ebaab82eb142ca100000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000001236efcbcbb340000000000000000000000000000000000000000000000000001236efcbcbb340000",
				from: wallet.address(),
				gas: "62563",
				gasPrice: "10224039259",
				hash: "107a275941e3c0a135ab0c38f55da1287674ef7decaaa69986a05386bfdf8f2a",
				nonce: "145",
				receipt: {
					cumulativeGasUsed: 41452,
					gasRefunded: 10363,
					gasUsed: 41452,
					status: 1,
				},
				senderPublicKey: "022a40ea35d53eedf0341ffa17574fca844d69665ce35f224e9a6b1385575044fd",
				timestamp: "1782897056325",
				to: "0x5a223F4434D5Bd8478100EEb3b0166a57A26350d",
				tokens: [token, token],
				value: "0",
			},
		},
		signed: {
			data: "4885b25400000000000000000000000012f6677522292654a231007c47b07971a7610908000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000a5cc0bfeb09742c5e4c610f2ebaab82eb142ca10000000000000000000000000a5cc0bfeb09742c5e4c610f2ebaab82eb142ca100000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000001236efcbcbb340000000000000000000000000000000000000000000000000001236efcbcbb340000",
			from: wallet.address(),
			gasLimit: "62563",
			gasPrice: "10224039259",
			hash: "107a275941e3c0a135ab0c38f55da1287674ef7decaaa69986a05386bfdf8f2a",
			nonce: "145",
			senderPublicKey: "022a40ea35d53eedf0341ffa17574fca844d69665ce35f224e9a6b1385575044fd",
			to: "0x5a223F4434D5Bd8478100EEb3b0166a57A26350d",
			tokens: [token, token],
		},
	};
};
