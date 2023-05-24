/* eslint-disable testing-library/no-node-access */
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { PendingTransaction } from "./PendingTransactionsTable.contracts";
import { buildTranslations } from "@/app/i18n/helpers";
import { PendingTransactions } from "@/domains/transaction/components/TransactionTable/PendingTransactionsTable";
import * as themeUtils from "@/utils/theme";
import {
	env,
	getDefaultProfileId,
	getDefaultWalletMnemonic,
	render,
	screen,
	waitFor,
	renderResponsive,
	within,
} from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";

import transactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions.json";

const translations = buildTranslations();
const submitButton = () => screen.getByTestId("DeleteResource__submit-button");
const cancelButton = () => screen.getByTestId("DeleteResource__cancel-button");

describe("Signed Transaction Table", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	const fixtures: Record<string, any> = {
		ipfs: undefined,
		multiPayment: undefined,
		multiSignature: undefined,
		transfer: undefined,
		unvote: undefined,
		vote: undefined,
	};

	const mockPendingTransfers = (wallet: Contracts.IReadWriteWallet) => {
		vi.spyOn(wallet.transaction(), "signed").mockReturnValue({
			[fixtures.transfer.id()]: fixtures.transfer,
		});
		vi.spyOn(wallet.transaction(), "canBeSigned").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "hasBeenSigned").mockReturnValue(true);
		vi.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(true);
		vi.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(true);
		vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(fixtures.transfer);
	};

	const mockMultisignatures = (wallet: Contracts.IReadWriteWallet) => {
		vi.spyOn(wallet.transaction(), "signed").mockReturnValue({
			[fixtures.transfer.id()]: fixtures.transfer,
		});
		vi.spyOn(wallet.transaction(), "canBeSigned").mockReturnValue(true);
		vi.spyOn(wallet.transaction(), "hasBeenSigned").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(true);
		vi.spyOn(wallet.transaction(), "transaction").mockImplementation(fixtures.transfer);
	};

	let pendingTransactions: PendingTransaction[];
	let pendingMultisignatureTransactions: PendingTransaction[];
	let pendingVoteTransactions: PendingTransaction[];
	let pendingUnvoteTransactions: PendingTransaction[];

	beforeAll(() => {
		pendingTransactions = [];
		pendingMultisignatureTransactions = [];
		pendingVoteTransactions = [];
		pendingUnvoteTransactions = [];

		profile = env.profiles().findById(getDefaultProfileId());

		wallet = profile.wallets().first();
	});

	beforeEach(async () => {
		server.use(
			requestMock("https://ark-test.arkvault.io/api/transactions", {
				data: [
					{
						...transactionsFixture.data[0],
						confirmations: 0,
					},
					transactionsFixture.data[1],
				],
				meta: transactionsFixture.meta,
			}),
			requestMock(
				"https://ark-test-musig.arkvault.io",
				{
					result: {
						id: "03df6cd794a7d404db4f1b25816d8976d0e72c5177d17ac9b19a92703b62cdbbbc",
					},
				},
				{ method: "post" },
			),
		);

		profile = env.profiles().findById(getDefaultProfileId());

		wallet = profile.wallets().first();

		await profile.sync();

		fixtures.transfer = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.transfer({
					data: {
						amount: 1,
						to: wallet.address(),
					},
					fee: 0.1,
					nonce: "1",
					signatory: await wallet
						.coin()
						.signatory()
						.multiSignature({
							min: 2,
							publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
						}),
				}),
			wallet,
		);

		pendingTransactions = [
			{
				hasBeenSigned: false,
				isAwaitingConfirmation: true,
				isAwaitingOtherSignatures: true,
				isAwaitingOurSignature: true,
				isPendingTransfer: true,
				transaction: fixtures.transfer,
			},
		];

		fixtures.multiSignature = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.multiSignature({
					data: {
						min: 2,
						publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
						senderPublicKey: wallet.publicKey()!,
					},
					fee: 0.1,
					nonce: "1",
					signatory: await wallet
						.coin()
						.signatory()
						.multiSignature({
							min: 2,
							publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
						}),
				}),
			wallet,
		);

		pendingMultisignatureTransactions = [
			{
				hasBeenSigned: false,
				isAwaitingConfirmation: true,
				isAwaitingOtherSignatures: true,
				isAwaitingOurSignature: true,
				isPendingTransfer: false,
				transaction: fixtures.multiSignature,
			},
		];

		fixtures.multiPayment = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.multiPayment({
					data: {
						payments: [
							{
								amount: 1,
								to: wallet.address(),
							},
							{
								amount: 1,
								to: wallet.address(),
							},
						],
					},
					fee: 0.1,
					nonce: "1",
					signatory: await wallet
						.coin()
						.signatory()
						.multiSignature({
							min: 2,
							publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
						}),
				}),
			wallet,
		);

		fixtures.vote = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.vote({
					data: {
						unvotes: [],
						votes: [
							{
								amount: 0,
								id: "034151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192",
							},
						],
					},
					fee: 0.1,
					nonce: "1",
					signatory: await wallet
						.coin()
						.signatory()
						.multiSignature({
							min: 2,
							publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
						}),
				}),
			wallet,
		);

		pendingVoteTransactions = [
			{
				hasBeenSigned: false,
				isAwaitingConfirmation: true,
				isAwaitingOtherSignatures: true,
				isAwaitingOurSignature: true,
				isPendingTransfer: true,
				transaction: fixtures.vote,
			},
		];

		fixtures.unvote = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.vote({
					data: {
						unvotes: [
							{
								amount: 0,
								id: "034151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192",
							},
						],
						votes: [],
					},
					fee: 0.1,
					nonce: "1",
					signatory: await wallet
						.coin()
						.signatory()
						.multiSignature({
							min: 2,
							publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
						}),
				}),
			wallet,
		);

		pendingUnvoteTransactions = [
			{
				hasBeenSigned: false,
				isAwaitingConfirmation: true,
				isAwaitingOtherSignatures: true,
				isAwaitingOurSignature: true,
				isPendingTransfer: true,
				transaction: fixtures.unvote,
			},
		];

		fixtures.ipfs = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.ipfs({
					data: {
						hash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
					},
					fee: 0.1,
					nonce: "1",
					signatory: await wallet
						.coin()
						.signatory()
						.multiSignature({
							min: 2,
							publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
						}),
				}),
			wallet,
		);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it.each([true, false])("should render pending transfers when isCompact = %s", (isCompact: boolean) => {
		mockPendingTransfers(wallet);

		const { asFragment } = render(
			<PendingTransactions wallet={wallet} pendingTransactions={pendingTransactions} isCompact={isCompact} />,
		);

		expect(asFragment()).toMatchSnapshot();

		vi.restoreAllMocks();
	});

	it("should render pending transfers on mobile", () => {
		mockPendingTransfers(wallet);

		const { asFragment } = renderResponsive(
			<PendingTransactions wallet={wallet} pendingTransactions={pendingTransactions} />,
			"xs",
		);

		expect(asFragment()).toMatchSnapshot();

		vi.restoreAllMocks();
	});

	it("should handle click on pending transfer row", async () => {
		const onClick = vi.fn();
		mockPendingTransfers(wallet);

		render(
			<PendingTransactions
				isCompact={false}
				wallet={wallet}
				onPendingTransactionClick={onClick}
				pendingTransactions={pendingTransactions}
			/>,
		);

		userEvent.click(screen.getAllByTestId("TableRow")[0]);

		await waitFor(() => expect(onClick).toHaveBeenCalledWith(expect.any(DTO.ExtendedSignedTransactionData)));

		vi.restoreAllMocks();
	});

	it("should handle click on pending transfer row on mobile", async () => {
		const onClick = vi.fn();
		mockPendingTransfers(wallet);

		renderResponsive(
			<PendingTransactions
				isCompact={false}
				wallet={wallet}
				onPendingTransactionClick={onClick}
				pendingTransactions={pendingTransactions}
			/>,
			"xs",
		);

		userEvent.click(screen.getAllByTestId("TableRow__mobile")[0]);

		await waitFor(() => expect(onClick).toHaveBeenCalledWith(expect.any(DTO.ExtendedSignedTransactionData)));

		vi.restoreAllMocks();
	});

	it("should render signed transactions", async () => {
		mockPendingTransfers(wallet);
		const canBeBroadcastedMock = vi.spyOn(wallet.transaction(), "canBeBroadcasted").mockReturnValue(true);
		const canBeSignedMock = vi.spyOn(wallet.transaction(), "canBeSigned").mockReturnValue(false);

		render(
			<PendingTransactions
				isCompact={false}
				wallet={wallet}
				pendingTransactions={pendingMultisignatureTransactions}
			/>,
		);

		await waitFor(() => expect(screen.getAllByTestId("TransactionRowRecipientLabel")).toHaveLength(1));

		expect(screen.getAllByTestId("TransactionRowRecipientLabel")[0]).toHaveTextContent(
			translations.TRANSACTION.TRANSACTION_TYPES.MULTI_SIGNATURE,
		);

		canBeSignedMock.mockReset();
		canBeBroadcastedMock.mockRestore();
	});

	it("should render ready to broadcast transactions", () => {
		mockMultisignatures(wallet);
		vi.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(true);
		vi.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(false);
		vi.spyOn(wallet.coin().multiSignature(), "remainingSignatureCount").mockReturnValue(0);

		const { asFragment } = render(
			<PendingTransactions
				isCompact={false}
				wallet={wallet}
				pendingTransactions={pendingMultisignatureTransactions}
			/>,
		);

		expect(document.querySelector("svg#double-arrow-right")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render signed transactions and handle exception", () => {
		mockMultisignatures(wallet);
		vi.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(true);

		vi.spyOn(wallet.transaction(), "canBeSigned").mockImplementation(() => {
			throw new Error("error");
		});

		const { asFragment } = render(
			<PendingTransactions
				isCompact={false}
				wallet={wallet}
				pendingTransactions={pendingMultisignatureTransactions}
			/>,
		);

		expect(document.querySelector("svg#pencil")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();

		vi.restoreAllMocks();
	});

	it("should show as awaiting confirmations", () => {
		vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(fixtures.transfer);

		const { asFragment } = render(
			<PendingTransactions isCompact={false} wallet={wallet} pendingTransactions={pendingTransactions} />,
		);

		expect(document.querySelector("svg#clock")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();

		vi.restoreAllMocks();
	});

	it("should show as awaiting confirmations on mobile", async () => {
		vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(fixtures.transfer);

		const { asFragment } = renderResponsive(
			<PendingTransactions isCompact={false} wallet={wallet} pendingTransactions={pendingTransactions} />,
			"xs",
		);

		await expect(screen.findByText("Waiting...")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		vi.restoreAllMocks();
	});

	describe.each(["xs", "xl"])("should render different status", (screenSize) => {
		it("should show as awaiting the wallet signature", () => {
			mockMultisignatures(wallet);
			vi.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(true);

			const { asFragment } = renderResponsive(
				<PendingTransactions
					isCompact={false}
					wallet={wallet}
					pendingTransactions={pendingMultisignatureTransactions}
				/>,
				screenSize,
			);

			expect(document.querySelectorAll("svg#pencil")).toHaveLength(2);

			expect(asFragment()).toMatchSnapshot();

			vi.restoreAllMocks();
		});

		it("should show as multiSignature ready", async () => {
			mockMultisignatures(wallet);
			vi.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(false);
			vi.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(false);

			const { asFragment } = renderResponsive(
				<PendingTransactions
					isCompact={false}
					wallet={wallet}
					pendingTransactions={pendingMultisignatureTransactions}
				/>,
				screenSize,
			);

			await waitFor(() =>
				expect(screen.getByTestId("TransactionRowRecipientLabel")).toHaveTextContent(
					translations.TRANSACTION.TRANSACTION_TYPES.MULTI_SIGNATURE,
				),
			);

			expect(asFragment()).toMatchSnapshot();

			vi.restoreAllMocks();
		});

		it("should show unconfirmed multiSignature transactions", async () => {
			vi.restoreAllMocks();

			mockMultisignatures(wallet);
			vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(fixtures.transfer);
			vi.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(false);
			vi.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(false);
			vi.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(true);

			const { asFragment } = renderResponsive(
				<PendingTransactions
					isCompact={false}
					wallet={wallet}
					pendingTransactions={pendingMultisignatureTransactions}
				/>,
				screenSize,
			);

			// eslint-disable-next-line sonarjs/no-identical-functions
			await waitFor(() =>
				expect(screen.getByTestId("TransactionRowRecipientLabel")).toHaveTextContent(
					translations.TRANSACTION.TRANSACTION_TYPES.MULTI_SIGNATURE,
				),
			);

			expect(asFragment()).toMatchSnapshot();

			vi.restoreAllMocks();
		});

		it("should show as awaiting other wallets signatures", () => {
			mockMultisignatures(wallet);
			const isAwaitingOurSignatureMock = vi
				.spyOn(wallet.transaction(), "isAwaitingOtherSignatures")
				.mockImplementation(() => true);
			const remainingSignatureCountMock = vi
				.spyOn(wallet.coin().multiSignature(), "remainingSignatureCount")
				.mockImplementation(() => 3);

			const canBeSignedMock = vi.spyOn(wallet.transaction(), "canBeSigned").mockReturnValue(false);

			vi.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(false);
			const { asFragment } = renderResponsive(
				<PendingTransactions
					isCompact={false}
					wallet={wallet}
					pendingTransactions={pendingMultisignatureTransactions}
				/>,
				screenSize,
			);

			expect(document.querySelector("svg#clock-pencil")).toBeInTheDocument();

			expect(asFragment()).toMatchSnapshot();

			isAwaitingOurSignatureMock.mockRestore();
			remainingSignatureCountMock.mockRestore();
			canBeSignedMock.mockRestore();
			vi.restoreAllMocks();
		});

		it("should show as final signature", () => {
			mockMultisignatures(wallet);
			vi.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(false);
			vi.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(false);

			const canBeSignedMock = vi.spyOn(wallet.transaction(), "canBeSigned").mockReturnValue(true);
			const { asFragment } = renderResponsive(
				<PendingTransactions
					isCompact={false}
					wallet={wallet}
					pendingTransactions={pendingMultisignatureTransactions}
				/>,
				screenSize,
			);

			expect(document.querySelector("svg#circle-check-mark-pencil")).toBeInTheDocument();

			expect(asFragment()).toMatchSnapshot();

			canBeSignedMock.mockRestore();
			vi.restoreAllMocks();
		});

		it("should show as vote", () => {
			mockMultisignatures(wallet);
			const isVoteMock = vi.spyOn(fixtures.transfer, "type").mockReturnValue("vote");

			const canBeSignedMock = vi.spyOn(wallet.transaction(), "canBeSigned").mockReturnValue(true);
			const { asFragment } = renderResponsive(
				<PendingTransactions isCompact={false} wallet={wallet} pendingTransactions={pendingVoteTransactions} />,
				screenSize,
			);

			expect(asFragment()).toMatchSnapshot();

			isVoteMock.mockRestore();
			canBeSignedMock.mockRestore();
			vi.restoreAllMocks();
		});

		it("should show as unvote", () => {
			mockPendingTransfers(wallet);
			const isUnvoteMock = vi.spyOn(fixtures.transfer, "type").mockReturnValue("unvote");

			const canBeSignedMock = vi.spyOn(wallet.transaction(), "canBeSigned").mockReturnValue(true);
			const { asFragment } = renderResponsive(
				<PendingTransactions
					isCompact={false}
					wallet={wallet}
					pendingTransactions={pendingUnvoteTransactions}
				/>,
				screenSize,
			);

			expect(asFragment()).toMatchSnapshot();

			isUnvoteMock.mockRestore();
			canBeSignedMock.mockRestore();
			vi.restoreAllMocks();
		});
	});

	it.each([true, false])("should show the sign button with isCompact = %s", (isCompact: boolean) => {
		mockPendingTransfers(wallet);
		const onClick = vi.fn();
		const canBeBroadcastedMock = vi.spyOn(wallet.transaction(), "canBeBroadcasted").mockReturnValue(false);
		const awaitingMock = vi.spyOn(wallet.transaction(), "canBeSigned").mockReturnValue(true);

		const { asFragment } = render(
			<PendingTransactions
				wallet={wallet}
				onClick={onClick}
				pendingTransactions={pendingMultisignatureTransactions}
				isCompact={isCompact}
			/>,
		);

		userEvent.click(screen.getAllByTestId("TransactionRow__sign")[0]);

		expect(onClick).toHaveBeenCalledWith(expect.any(DTO.ExtendedSignedTransactionData));
		expect(asFragment()).toMatchSnapshot();

		awaitingMock.mockReset();
		canBeBroadcastedMock.mockReset();
		vi.restoreAllMocks();
	});

	it.each(["light", "dark"])("should set %s shadow color on mouse events", async (theme) => {
		mockMultisignatures(wallet);
		vi.spyOn(themeUtils, "shouldUseDarkColors").mockImplementation(() => theme === "dark");

		const canBeSignedMock = vi.spyOn(wallet.transaction(), "canBeSigned").mockReturnValue(true);
		render(<PendingTransactions isCompact={false} wallet={wallet} pendingTransactions={pendingTransactions} />);
		userEvent.hover(screen.getAllByRole("row")[1]);

		await waitFor(() => expect(screen.getAllByRole("row")[1]).toBeInTheDocument());

		userEvent.unhover(screen.getAllByRole("row")[1]);

		await waitFor(() => expect(screen.getAllByRole("row")[1]).toBeInTheDocument());
		canBeSignedMock.mockRestore();
		vi.restoreAllMocks();
	});

	it("should remove pending multisignature", async () => {
		mockPendingTransfers(wallet);
		const onRemove = vi.fn();
		const isMultiSignatureReadyMock = vi
			.spyOn(wallet.coin().multiSignature(), "isMultiSignatureReady")
			.mockReturnValue(true);
		const canBeSignedMock = vi.spyOn(wallet.transaction(), "canBeSigned").mockReturnValue(false);

		render(
			<PendingTransactions
				isCompact={false}
				wallet={wallet}
				pendingTransactions={pendingMultisignatureTransactions}
				onRemove={onRemove}
			/>,
		);

		await waitFor(() => expect(screen.getAllByTestId("TransactionRowRecipientLabel")).toHaveLength(1));

		expect(screen.getAllByTestId("TransactionRowRecipientLabel")[0]).toHaveTextContent(
			translations.TRANSACTION.TRANSACTION_TYPES.MULTI_SIGNATURE,
		);

		userEvent.click(screen.getAllByTestId("TableRemoveButton")[0]);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		expect(submitButton()).toBeInTheDocument();
		expect(cancelButton()).toBeInTheDocument();

		expect(submitButton()).toBeDisabled();

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), getDefaultWalletMnemonic());

		await waitFor(() => {
			expect(submitButton()).toBeEnabled();
		});

		userEvent.click(submitButton());

		await waitFor(() => expect(onRemove).toHaveBeenCalledWith(expect.any(DTO.ExtendedSignedTransactionData)));

		canBeSignedMock.mockReset();
		isMultiSignatureReadyMock.mockRestore();
	});

	it("should remove pending multisignature in mobile", async () => {
		mockPendingTransfers(wallet);
		const onRemove = vi.fn();
		const isMultiSignatureReadyMock = vi
			.spyOn(wallet.coin().multiSignature(), "isMultiSignatureReady")
			.mockReturnValue(true);
		const canBeSignedMock = vi.spyOn(wallet.transaction(), "canBeSigned").mockReturnValue(false);

		renderResponsive(
			<PendingTransactions
				isCompact={false}
				wallet={wallet}
				pendingTransactions={pendingMultisignatureTransactions}
				onRemove={onRemove}
			/>,
			"xs",
		);

		await waitFor(() => expect(screen.getAllByTestId("TransactionRowRecipientLabel")).toHaveLength(1));

		expect(screen.getAllByTestId("TransactionRowRecipientLabel")[0]).toHaveTextContent(
			translations.TRANSACTION.TRANSACTION_TYPES.MULTI_SIGNATURE,
		);

		userEvent.click(screen.getByTestId("SignedTransactionRowMobile--remove"));

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		expect(submitButton()).toBeInTheDocument();
		expect(cancelButton()).toBeInTheDocument();

		expect(submitButton()).toBeDisabled();

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), getDefaultWalletMnemonic());

		await waitFor(() => {
			expect(submitButton()).toBeEnabled();
		});

		userEvent.click(submitButton());

		await waitFor(() => expect(onRemove).toHaveBeenCalledWith(expect.any(DTO.ExtendedSignedTransactionData)));

		canBeSignedMock.mockReset();
		isMultiSignatureReadyMock.mockRestore();
	});

	it("should open and close removal confirmation of pending transaction", async () => {
		mockPendingTransfers(wallet);
		const onRemove = vi.fn();
		const isMultiSignatureReadyMock = vi
			.spyOn(wallet.coin().multiSignature(), "isMultiSignatureReady")
			.mockReturnValue(true);
		const canBeSignedMock = vi.spyOn(wallet.transaction(), "canBeSigned").mockReturnValue(false);

		render(
			<PendingTransactions
				isCompact={false}
				wallet={wallet}
				pendingTransactions={pendingMultisignatureTransactions}
				onRemove={onRemove}
			/>,
		);

		await waitFor(() => expect(screen.getAllByTestId("TransactionRowRecipientLabel")).toHaveLength(1));

		expect(screen.getAllByTestId("TransactionRowRecipientLabel")[0]).toHaveTextContent(
			translations.TRANSACTION.TRANSACTION_TYPES.MULTI_SIGNATURE,
		);

		userEvent.click(screen.getAllByTestId("TableRemoveButton")[0]);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		expect(cancelButton()).toBeInTheDocument();

		userEvent.click(cancelButton());

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		canBeSignedMock.mockReset();
		isMultiSignatureReadyMock.mockRestore();
	});

	it("should open and close removal confirmation from the responsive dropdown", async () => {
		mockPendingTransfers(wallet);
		const onRemove = vi.fn();
		const isMultiSignatureReadyMock = vi
			.spyOn(wallet.coin().multiSignature(), "isMultiSignatureReady")
			.mockReturnValue(true);
		const canBeSignedMock = vi.spyOn(wallet.transaction(), "canBeSigned").mockReturnValue(false);

		renderResponsive(
			<PendingTransactions
				isCompact={false}
				wallet={wallet}
				pendingTransactions={pendingMultisignatureTransactions}
				onRemove={onRemove}
			/>,
			"md",
		);

		await waitFor(() => expect(screen.getAllByTestId("TransactionRowRecipientLabel")).toHaveLength(1));

		const dropdown = within(screen.getByTestId("SignedTransactionRow--dropdown")).getByTestId("dropdown__toggle");

		userEvent.click(dropdown);

		expect(screen.getByTestId("dropdown__option--0")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("dropdown__option--0"));

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		expect(cancelButton()).toBeInTheDocument();

		userEvent.click(cancelButton());

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		canBeSignedMock.mockReset();
		isMultiSignatureReadyMock.mockRestore();
	});

	it("should call the onSign method from the responsive dropdown", async () => {
		mockPendingTransfers(wallet);
		const onSign = vi.fn();
		const isMultiSignatureReadyMock = vi
			.spyOn(wallet.coin().multiSignature(), "isMultiSignatureReady")
			.mockReturnValue(true);
		const canBeSignedMock = vi.spyOn(wallet.transaction(), "canBeSigned").mockReturnValue(true);

		renderResponsive(
			<PendingTransactions
				isCompact={false}
				wallet={wallet}
				pendingTransactions={pendingMultisignatureTransactions}
				onClick={onSign}
			/>,
			"md",
		);

		await waitFor(() => expect(screen.getAllByTestId("TransactionRowRecipientLabel")).toHaveLength(1));

		const dropdown = within(screen.getByTestId("SignedTransactionRow--dropdown")).getByTestId("dropdown__toggle");

		userEvent.click(dropdown);

		expect(screen.getByTestId("dropdown__option--0")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("dropdown__option--0"));

		expect(onSign).toHaveBeenCalledTimes(1);

		onSign.mockReset();

		canBeSignedMock.mockReset();

		isMultiSignatureReadyMock.mockRestore();
	});

	it("should handle the sign button on mobile", async () => {
		mockPendingTransfers(wallet);
		const onSign = vi.fn();
		const isMultiSignatureReadyMock = vi
			.spyOn(wallet.coin().multiSignature(), "isMultiSignatureReady")
			.mockReturnValue(true);
		const canBeSignedMock = vi.spyOn(wallet.transaction(), "canBeSigned").mockReturnValue(true);

		renderResponsive(
			<PendingTransactions
				isCompact={false}
				wallet={wallet}
				pendingTransactions={pendingMultisignatureTransactions}
				onClick={onSign}
			/>,
			"xs",
		);

		await waitFor(() => expect(screen.getAllByTestId("TransactionRowRecipientLabel")).toHaveLength(1));

		const button = screen.getByTestId("TransactionRow__sign");

		userEvent.click(button);

		// 2 because its also called when the row is clicked
		expect(onSign).toHaveBeenCalledTimes(2);

		onSign.mockReset();

		canBeSignedMock.mockReset();

		isMultiSignatureReadyMock.mockRestore();
	});
});
