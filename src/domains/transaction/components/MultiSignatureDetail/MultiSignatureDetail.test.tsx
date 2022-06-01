import { Signatories } from "@payvo/sdk";
import { Contracts, DTO } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect } from "react";
import { Route } from "react-router-dom";

import { MultiSignatureDetail } from "./MultiSignatureDetail";
import { LedgerProvider, minVersionList, useLedgerContext } from "@/app/contexts";
import { translations } from "@/domains/transaction/i18n";
import MultisignatureRegistrationFixture from "@/tests/fixtures/coins/ark/devnet/transactions/multisignature-registration.json";
import {
	env,
	getDefaultProfileId,
	getDefaultWalletMnemonic,
	render,
	screen,
	syncDelegates,
	waitFor,
	mockNanoSTransport,
	mockNanoXTransport,
} from "@/utils/testing-library";

const passphrase = getDefaultWalletMnemonic();

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let getVersionSpy: jest.SpyInstance;

const fixtures: Record<string, any> = {
	ipfs: undefined,
	multiPayment: undefined,
	multiSignature: undefined,
	transfer: undefined,
	unvote: undefined,
	vote: undefined,
};

const mockPendingTransfers = (wallet: Contracts.IReadWriteWallet) => {
	jest.spyOn(wallet.transaction(), "signed").mockReturnValue({
		[fixtures.transfer.id()]: fixtures.transfer,
	});

	jest.spyOn(wallet.transaction(), "transaction").mockReturnValue(fixtures.transfer);
};

describe("MultiSignatureDetail", () => {
	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		await syncDelegates(profile);

		wallet = profile.wallets().first();

		getVersionSpy = jest
			.spyOn(wallet.coin().ledger(), "getVersion")
			.mockResolvedValue(minVersionList[wallet.network().coin()]);

		await wallet.synchroniser().identity();

		fixtures.transfer = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.transfer({
					data: {
						amount: 1,
						to: wallet.address(),
					},
					fee: 1,
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
					fee: 1,
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
								amount: 2,
								to: wallet.address(),
							},
						],
					},
					fee: 1,
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
					fee: 1,
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
					fee: 1,
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

		fixtures.ipfs = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.ipfs({
					data: {
						hash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
					},
					fee: 1,
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

		jest.spyOn(wallet.transaction(), "sync").mockResolvedValue(void 0);
	});

	afterAll(() => {
		getVersionSpy.mockRestore();
	});

	const MultisignatureDetailWrapper = () => {
		const { listenDevice } = useLedgerContext();

		useEffect(() => {
			listenDevice();
		}, []);

		return <MultiSignatureDetail profile={profile} transaction={fixtures.multiSignature} wallet={wallet} isOpen />;
	};

	it("should render summary step for transfer", async () => {
		mockPendingTransfers(wallet);
		jest.spyOn(wallet.transaction(), "canBeBroadcasted").mockImplementation(() => false);
		jest.spyOn(wallet.transaction(), "canBeSigned").mockImplementation(() => false);
		jest.spyOn(wallet.transaction(), "isAwaitingSignatureByPublicKey").mockImplementation(() => false);

		const { container } = render(
			<Route path="/profiles/:profileId">
				<LedgerProvider>
					<MultiSignatureDetail profile={profile} transaction={fixtures.transfer} wallet={wallet} isOpen />
				</LedgerProvider>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await waitFor(() => expect(screen.getByText(translations.TRANSACTION_TYPES.TRANSFER)));

		expect(container).toMatchSnapshot();
	});

	it("should render summary step and handle exception", async () => {
		mockPendingTransfers(wallet);
		jest.spyOn(wallet.transaction(), "canBeBroadcasted").mockImplementation(() => false);
		jest.spyOn(wallet.transaction(), "canBeSigned").mockImplementation(() => {
			throw new Error("error");
		});

		jest.spyOn(wallet.transaction(), "isAwaitingSignatureByPublicKey").mockImplementation(() => false);

		const { container } = render(
			<Route path="/profiles/:profileId">
				<LedgerProvider>
					<MultiSignatureDetail profile={profile} transaction={fixtures.transfer} wallet={wallet} isOpen />
				</LedgerProvider>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await waitFor(() => expect(screen.getByText(translations.TRANSACTION_TYPES.TRANSFER)));

		expect(container).toMatchSnapshot();
	});

	it("should render summary step for multi payment", async () => {
		mockPendingTransfers(wallet);
		jest.spyOn(wallet.transaction(), "canBeBroadcasted").mockImplementation(() => false);
		jest.spyOn(wallet.transaction(), "canBeSigned").mockImplementation(() => false);
		jest.spyOn(wallet.transaction(), "isAwaitingSignatureByPublicKey").mockImplementation(() => false);

		const { container } = render(
			<Route path="/profiles/:profileId">
				<LedgerProvider>
					<MultiSignatureDetail
						profile={profile}
						transaction={fixtures.multiPayment}
						wallet={wallet}
						isOpen
					/>
				</LedgerProvider>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await waitFor(() => expect(screen.getByText(translations.TRANSACTION_TYPES.MULTI_PAYMENT)));

		expect(container).toMatchSnapshot();
	});

	it("should render summary step for multi signature", async () => {
		mockPendingTransfers(wallet);
		jest.spyOn(wallet.transaction(), "canBeBroadcasted").mockImplementation(() => false);
		jest.spyOn(wallet.transaction(), "canBeSigned").mockImplementation(() => false);
		jest.spyOn(wallet.transaction(), "isAwaitingSignatureByPublicKey").mockImplementation(() => false);

		const { container } = render(
			<Route path="/profiles/:profileId">
				<LedgerProvider>
					<MultiSignatureDetail
						profile={profile}
						transaction={fixtures.multiSignature}
						wallet={wallet}
						isOpen
					/>
				</LedgerProvider>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await waitFor(() => expect(screen.getByText(translations.TRANSACTION_TYPES.MULTI_SIGNATURE)));

		expect(container).toMatchSnapshot();
	});

	it("should render summary step for vote", async () => {
		mockPendingTransfers(wallet);
		jest.spyOn(wallet.transaction(), "canBeBroadcasted").mockImplementation(() => false);
		jest.spyOn(wallet.transaction(), "canBeSigned").mockImplementation(() => false);
		jest.spyOn(wallet.transaction(), "isAwaitingSignatureByPublicKey").mockImplementation(() => false);
		jest.spyOn(fixtures.vote, "type").mockReturnValue("vote");

		const { container } = render(
			<Route path="/profiles/:profileId">
				<LedgerProvider>
					<MultiSignatureDetail profile={profile} transaction={fixtures.vote} wallet={wallet} isOpen />
				</LedgerProvider>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await waitFor(() =>
			expect(screen.getByTestId("header__title")).toHaveTextContent(translations.TRANSACTION_TYPES.VOTE),
		);

		expect(container).toMatchSnapshot();
	});

	it("should render summary step for unvote", async () => {
		mockPendingTransfers(wallet);
		jest.spyOn(wallet.transaction(), "canBeBroadcasted").mockImplementation(() => false);
		jest.spyOn(wallet.transaction(), "canBeSigned").mockImplementation(() => false);
		jest.spyOn(wallet.transaction(), "isAwaitingSignatureByPublicKey").mockImplementation(() => false);
		jest.spyOn(fixtures.unvote, "type").mockReturnValue("unvote");

		const { container } = render(
			<Route path="/profiles/:profileId">
				<LedgerProvider>
					<MultiSignatureDetail profile={profile} transaction={fixtures.unvote} wallet={wallet} isOpen />
				</LedgerProvider>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await waitFor(() =>
			expect(screen.getByTestId("header__title")).toHaveTextContent(translations.TRANSACTION_TYPES.UNVOTE),
		);

		expect(container).toMatchSnapshot();
	});

	it("should render summary step for ipfs", async () => {
		mockPendingTransfers(wallet);
		jest.spyOn(wallet.transaction(), "canBeBroadcasted").mockImplementation(() => false);
		jest.spyOn(wallet.transaction(), "canBeSigned").mockImplementation(() => false);
		jest.spyOn(wallet.transaction(), "isAwaitingSignatureByPublicKey").mockImplementation(() => false);

		const { container } = render(
			<Route path="/profiles/:profileId">
				<LedgerProvider>
					<MultiSignatureDetail profile={profile} transaction={fixtures.ipfs} wallet={wallet} isOpen />
				</LedgerProvider>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);
		await waitFor(() =>
			expect(screen.getByTestId("header__title")).toHaveTextContent(translations.TRANSACTION_TYPES.IPFS),
		);

		expect(container).toMatchSnapshot();
	});

	it("should show send button when able to add final signature and broadcast", async () => {
		mockPendingTransfers(wallet);
		jest.spyOn(wallet.transaction(), "canBeBroadcasted").mockImplementation(() => true);
		jest.spyOn(wallet.transaction(), "canBeSigned").mockImplementation(() => true);
		jest.spyOn(wallet.coin().multiSignature(), "isMultiSignatureReady").mockReturnValue(true);

		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [fixtures.transfer.id()],
			errors: {},
			rejected: [],
		});

		const { container } = render(
			<Route path="/profiles/:profileId">
				<LedgerProvider>
					<MultiSignatureDetail profile={profile} transaction={fixtures.transfer} wallet={wallet} isOpen />
				</LedgerProvider>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await waitFor(() => expect(screen.getByTestId("MultiSignatureDetail__broadcast")));

		expect(container).toMatchSnapshot();

		userEvent.click(screen.getByTestId("MultiSignatureDetail__broadcast"));

		await waitFor(() => expect(broadcastMock).toHaveBeenCalledWith(fixtures.transfer.id()));

		await expect(screen.findByText(translations.SUCCESS.TITLE)).resolves.toBeVisible();

		broadcastMock.mockRestore();
	});

	it("should not broadcast if wallet is not ready to do so", async () => {
		mockPendingTransfers(wallet);
		jest.spyOn(wallet.transaction(), "canBeBroadcasted").mockImplementation(() => true);
		jest.spyOn(wallet.transaction(), "canBeSigned").mockImplementation(() => true);
		jest.spyOn(wallet.coin().multiSignature(), "isMultiSignatureReady").mockReturnValue(true);

		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast");

		const { container } = render(
			<Route path="/profiles/:profileId">
				<LedgerProvider>
					<MultiSignatureDetail profile={profile} transaction={fixtures.transfer} wallet={wallet} isOpen />
				</LedgerProvider>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await waitFor(() => expect(screen.getByTestId("MultiSignatureDetail__broadcast")));

		expect(container).toMatchSnapshot();

		jest.spyOn(wallet.transaction(), "canBeBroadcasted").mockReturnValue(false);

		userEvent.click(screen.getByTestId("MultiSignatureDetail__broadcast"));

		await waitFor(() => expect(broadcastMock).not.toHaveBeenCalled());

		broadcastMock.mockRestore();
	});

	it("should not show send button when waiting for confirmations", async () => {
		mockPendingTransfers(wallet);
		jest.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockImplementationOnce(() => true);
		jest.spyOn(wallet.transaction(), "canBeBroadcasted").mockImplementation(() => false);
		jest.spyOn(wallet.transaction(), "canBeSigned").mockImplementation(() => false);
		jest.spyOn(wallet.coin().multiSignature(), "isMultiSignatureReady").mockReturnValue(true);

		const { container } = render(
			<Route path="/profiles/:profileId">
				<LedgerProvider>
					<MultiSignatureDetail profile={profile} transaction={fixtures.transfer} wallet={wallet} isOpen />
				</LedgerProvider>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await waitFor(() => expect(screen.queryByTestId("MultiSignatureDetail__broadcast")).not.toBeInTheDocument());

		expect(container).toMatchSnapshot();
	});

	it("should fail to broadcast transaction and show error step", async () => {
		mockPendingTransfers(wallet);
		jest.spyOn(wallet.transaction(), "canBeBroadcasted").mockImplementation(() => true);
		jest.spyOn(wallet.transaction(), "canBeSigned").mockImplementation(() => true);
		jest.spyOn(wallet.coin().multiSignature(), "isMultiSignatureReady").mockReturnValue(true);

		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockRejectedValue(new Error("Failed"));

		const { container } = render(
			<Route path="/profiles/:profileId">
				<LedgerProvider>
					<MultiSignatureDetail profile={profile} transaction={fixtures.transfer} wallet={wallet} isOpen />
				</LedgerProvider>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await waitFor(() => expect(screen.getByTestId("MultiSignatureDetail__broadcast")));

		expect(container).toMatchSnapshot();

		userEvent.click(screen.getByTestId("MultiSignatureDetail__broadcast"));

		await waitFor(() => expect(screen.getByTestId("ErrorStep")));
		await waitFor(() => expect(broadcastMock).toHaveBeenCalledWith(fixtures.transfer.id()));
		broadcastMock.mockRestore();
	});

	it("should show sign button when able to sign", async () => {
		mockPendingTransfers(wallet);
		jest.spyOn(wallet.transaction(), "canBeBroadcasted").mockImplementation(() => false);
		jest.spyOn(wallet.transaction(), "canBeSigned").mockImplementation(() => true);

		const { container } = render(
			<Route path="/profiles/:profileId">
				<LedgerProvider>
					<MultiSignatureDetail profile={profile} transaction={fixtures.transfer} wallet={wallet} isOpen />
				</LedgerProvider>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await waitFor(() => expect(screen.getByTestId("Paginator__sign")));

		userEvent.click(screen.getByTestId("Paginator__sign"));

		await waitFor(() => expect(screen.getByTestId("AuthenticationStep")));

		userEvent.click(screen.getByTestId("Paginator__back"));

		await waitFor(() => expect(screen.getByTestId("Paginator__sign")));

		expect(container).toMatchSnapshot();
	});

	it("should emit close when click on cancel button", async () => {
		mockPendingTransfers(wallet);
		jest.spyOn(wallet.transaction(), "canBeBroadcasted").mockImplementation(() => true);
		jest.spyOn(wallet.transaction(), "canBeSigned").mockImplementation(() => true);

		const onClose = jest.fn();
		render(
			<Route path="/profiles/:profileId">
				<LedgerProvider>
					<MultiSignatureDetail
						profile={profile}
						transaction={fixtures.transfer}
						wallet={wallet}
						isOpen
						onClose={onClose}
					/>
				</LedgerProvider>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await waitFor(() => expect(screen.getByTestId("Paginator__cancel")));

		userEvent.click(screen.getByTestId("Paginator__cancel"));

		expect(onClose).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should go to authentication step with sign button", async () => {
		mockPendingTransfers(wallet);
		jest.spyOn(wallet.transaction(), "canBeSigned").mockImplementation(() => true);

		render(
			<Route path="/profiles/:profileId">
				<LedgerProvider>
					<MultiSignatureDetail profile={profile} transaction={fixtures.transfer} wallet={wallet} isOpen />
				</LedgerProvider>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await waitFor(() => expect(screen.getByTestId("Paginator__sign")));

		userEvent.click(screen.getByTestId("Paginator__sign"));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();
	});

	it("should sign transaction and broadcast in one action", async () => {
		mockPendingTransfers(wallet);
		jest.spyOn(wallet, "actsWithMnemonic").mockImplementation(() => true);
		jest.spyOn(wallet.transaction(), "canBeBroadcasted").mockImplementation(() => false);
		jest.spyOn(wallet.transaction(), "canBeSigned").mockImplementation(() => true);
		jest.spyOn(wallet.transaction(), "sync").mockResolvedValue(void 0);
		jest.spyOn(wallet.transaction(), "transaction").mockReturnValue(fixtures.transfer);

		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast");
		const addSignatureMock = jest.spyOn(wallet.transaction(), "addSignature").mockResolvedValue(void 0);

		render(
			<Route path="/profiles/:profileId">
				<LedgerProvider>
					<MultiSignatureDetail profile={profile} transaction={fixtures.transfer} wallet={wallet} isOpen />
				</LedgerProvider>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await waitFor(() => expect(screen.getByTestId("Paginator__sign")));

		userEvent.click(screen.getByTestId("Paginator__sign"));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		jest.spyOn(wallet.transaction(), "canBeBroadcasted").mockImplementation(() => true);

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);

		await waitFor(() => expect(screen.getByTestId("Paginator__continue")).not.toBeDisabled(), { timeout: 1000 });

		userEvent.click(screen.getByTestId("Paginator__continue"));

		await waitFor(() =>
			expect(addSignatureMock).toHaveBeenCalledWith(fixtures.transfer.id(), expect.any(Signatories.Signatory)),
		);
		await waitFor(() => expect(broadcastMock).toHaveBeenCalledWith(fixtures.transfer.id()));

		jest.restoreAllMocks();
	});

	it("should sign transaction after authentication page", async () => {
		mockPendingTransfers(wallet);
		jest.spyOn(wallet, "actsWithMnemonic").mockImplementation(() => true);
		jest.spyOn(wallet.transaction(), "canBeBroadcasted").mockImplementation(() => false);
		jest.spyOn(wallet.transaction(), "canBeSigned").mockImplementation(() => true);
		jest.spyOn(wallet.transaction(), "sync").mockResolvedValue(void 0);
		jest.spyOn(wallet.transaction(), "transaction").mockReturnValue(fixtures.transfer);

		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast");
		const addSignatureMock = jest.spyOn(wallet.transaction(), "addSignature").mockResolvedValue(void 0);

		const { container } = render(
			<Route path="/profiles/:profileId">
				<LedgerProvider>
					<MultiSignatureDetail profile={profile} transaction={fixtures.transfer} wallet={wallet} isOpen />
				</LedgerProvider>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await waitFor(() => expect(screen.getByTestId("Paginator__sign")));

		userEvent.click(screen.getByTestId("Paginator__sign"));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);

		await waitFor(() => expect(screen.getByTestId("Paginator__continue")).not.toBeDisabled(), { timeout: 1000 });

		userEvent.click(screen.getByTestId("Paginator__continue"));

		await waitFor(() =>
			expect(addSignatureMock).toHaveBeenCalledWith(fixtures.transfer.id(), expect.any(Signatories.Signatory)),
		);
		await waitFor(() => expect(broadcastMock).not.toHaveBeenCalled());

		await expect(screen.findByText(translations.TRANSACTION_SIGNED)).resolves.toBeVisible();

		expect(container).toMatchSnapshot();
	});

	it("should submit transaction signing using keyboards enter key", async () => {
		mockPendingTransfers(wallet);
		jest.spyOn(wallet, "actsWithMnemonic").mockImplementation(() => true);
		jest.spyOn(wallet.transaction(), "canBeBroadcasted").mockImplementation(() => false);
		jest.spyOn(wallet.transaction(), "canBeSigned").mockImplementation(() => true);
		jest.spyOn(wallet.transaction(), "sync").mockResolvedValue(void 0);
		jest.spyOn(wallet.transaction(), "transaction").mockReturnValue(fixtures.transfer);

		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast");
		const addSignatureMock = jest.spyOn(wallet.transaction(), "addSignature").mockResolvedValue(void 0);

		const { container } = render(
			<Route path="/profiles/:profileId">
				<LedgerProvider>
					<MultiSignatureDetail profile={profile} transaction={fixtures.transfer} wallet={wallet} isOpen />
				</LedgerProvider>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await waitFor(() => expect(screen.getByTestId("Paginator__sign")));

		userEvent.click(screen.getByTestId("Paginator__sign"));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);

		await waitFor(() => expect(screen.getByTestId("Paginator__continue")).not.toBeDisabled(), { timeout: 1000 });

		userEvent.keyboard("{enter}");

		await waitFor(() =>
			expect(addSignatureMock).toHaveBeenCalledWith(fixtures.transfer.id(), expect.any(Signatories.Signatory)),
		);
		await waitFor(() => expect(broadcastMock).not.toHaveBeenCalled());

		await expect(screen.findByText(translations.TRANSACTION_SIGNED)).resolves.toBeVisible();

		expect(container).toMatchSnapshot();
	});

	it("should fail to sign transaction after authentication page", async () => {
		mockPendingTransfers(wallet);
		jest.spyOn(wallet, "actsWithMnemonic").mockImplementation(() => true);
		jest.spyOn(wallet.transaction(), "canBeBroadcasted").mockImplementation(() => false);
		jest.spyOn(wallet.transaction(), "canBeSigned").mockImplementation(() => true);
		jest.spyOn(wallet.transaction(), "sync").mockResolvedValue(void 0);

		const addSignatureMock = jest
			.spyOn(wallet.transaction(), "addSignature")
			.mockRejectedValue(new Error("Failed"));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast");

		render(
			<Route path="/profiles/:profileId">
				<LedgerProvider>
					<MultiSignatureDetail profile={profile} transaction={fixtures.transfer} wallet={wallet} isOpen />
				</LedgerProvider>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await waitFor(() => expect(screen.getByTestId("Paginator__sign")));

		userEvent.click(screen.getByTestId("Paginator__sign"));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);

		await waitFor(() => expect(screen.getByTestId("Paginator__continue")).not.toBeDisabled(), { timeout: 1000 });

		userEvent.click(screen.getByTestId("Paginator__continue"));

		await waitFor(() =>
			expect(addSignatureMock).toHaveBeenCalledWith(fixtures.transfer.id(), expect.any(Signatories.Signatory)),
		);
		await waitFor(() => expect(broadcastMock).not.toHaveBeenCalledWith(fixtures.transfer.id()));

		jest.restoreAllMocks();
	});

	it("should add final signature and broadcast transaction", async () => {
		mockPendingTransfers(wallet);
		jest.spyOn(wallet, "actsWithMnemonic").mockImplementation(() => true);
		jest.spyOn(wallet.transaction(), "canBeBroadcasted").mockImplementation(() => false);
		jest.spyOn(wallet.transaction(), "canBeSigned").mockImplementation(() => true);
		jest.spyOn(wallet.transaction(), "sync").mockResolvedValue(void 0);

		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [fixtures.transfer.id()],
			errors: {},
			rejected: [],
		});

		const addSignatureMock = jest.spyOn(wallet.transaction(), "addSignature").mockResolvedValue(void 0);

		render(
			<Route path="/profiles/:profileId">
				<LedgerProvider>
					<MultiSignatureDetail profile={profile} transaction={fixtures.transfer} wallet={wallet} isOpen />
				</LedgerProvider>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await waitFor(() => expect(screen.getByTestId("Paginator__sign")));

		userEvent.click(screen.getByTestId("Paginator__sign"));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);

		await waitFor(() => expect(screen.getByTestId("Paginator__continue")).not.toBeDisabled(), { timeout: 1000 });

		userEvent.click(screen.getByTestId("Paginator__continue"));

		await waitFor(() =>
			expect(addSignatureMock).toHaveBeenCalledWith(fixtures.transfer.id(), expect.any(Signatories.Signatory)),
		);
		await waitFor(() => expect(broadcastMock).not.toHaveBeenCalled());

		jest.restoreAllMocks();
	});

	it("should sign transaction with a ledger wallet", async () => {
		mockPendingTransfers(wallet);
		jest.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(true);

		jest.spyOn(wallet, "actsWithMnemonic").mockImplementation(() => true);
		jest.spyOn(wallet.transaction(), "canBeBroadcasted").mockImplementation(() => false);
		jest.spyOn(wallet.transaction(), "canBeSigned").mockImplementation(() => true);
		jest.spyOn(wallet.transaction(), "sync").mockResolvedValue(void 0);
		jest.spyOn(wallet.transaction(), "transaction").mockReturnValue(fixtures.transfer);

		const isNanoXMock = jest.spyOn(wallet, "isLedgerNanoX").mockReturnValue(true);
		// Ledger mocks
		const isLedgerMock = jest.spyOn(wallet, "isLedger").mockImplementation(() => true);
		jest.spyOn(wallet.coin(), "__construct").mockImplementation();

		const getPublicKeyMock = jest
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockResolvedValue("0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb");

		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [MultisignatureRegistrationFixture.data.id],
			errors: {},
			rejected: [],
		});

		const addSignatureMock = jest.spyOn(wallet.transaction(), "addSignature").mockResolvedValue(undefined);

		const addSignatureSpy = jest.spyOn(wallet.transaction(), "addSignature").mockResolvedValue(undefined);

		const nanoXTransportMock = mockNanoXTransport();

		const { container } = render(
			<Route path="/profiles/:profileId">
				<MultisignatureDetailWrapper />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await expect(screen.findByTestId("Paginator__sign")).resolves.toBeVisible();

		const address = wallet.address();
		const balance = wallet.balance();
		const derivationPath = "m/44'/1'/1'/0/0";
		const votes = wallet.voting().current();
		const publicKey = wallet.publicKey();

		const mockWalletData = jest.spyOn(wallet.data(), "get").mockImplementation((key) => {
			if (key == Contracts.WalletData.Address) {
				return address;
			}

			if (key == Contracts.WalletData.Balance) {
				return balance;
			}

			if (key == Contracts.WalletData.PublicKey) {
				return publicKey;
			}

			if (key == Contracts.WalletData.Votes) {
				return votes;
			}

			if (key === Contracts.WalletData.ImportMethod) {
				return "BIP44.DERIVATION_PATH";
			}

			if (key == Contracts.WalletData.DerivationPath) {
				return derivationPath;
			}
		});

		userEvent.click(screen.getByTestId("Paginator__sign"));

		await waitFor(() => expect(() => screen.getByTestId("Paginator__continue")), { timeout: 1000 });

		await waitFor(() =>
			expect(addSignatureMock).toHaveBeenCalledWith(
				fixtures.multiSignature.id(),
				expect.any(Signatories.Signatory),
			),
		);
		await waitFor(() => expect(broadcastMock).not.toHaveBeenCalled());

		expect(container).toMatchSnapshot();

		isLedgerMock.mockRestore();
		isNanoXMock.mockRestore();
		getPublicKeyMock.mockRestore();
		broadcastMock.mockRestore();
		addSignatureSpy.mockRestore();
		mockWalletData.mockRestore();
		nanoXTransportMock.mockRestore();
	});

	it("should show error screen for unsupported Nano S", async () => {
		mockPendingTransfers(wallet);
		const nanoSMock = mockNanoSTransport();

		jest.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(true);
		jest.spyOn(wallet, "actsWithMnemonic").mockImplementation(() => true);
		jest.spyOn(wallet.transaction(), "canBeBroadcasted").mockImplementation(() => false);
		jest.spyOn(wallet.transaction(), "canBeSigned").mockImplementation(() => true);
		jest.spyOn(wallet.transaction(), "sync").mockResolvedValue(void 0);
		jest.spyOn(wallet.transaction(), "transaction").mockReturnValue(fixtures.transfer);

		// Ledger mocks
		const isLedgerMock = jest.spyOn(wallet, "isLedger").mockImplementation(() => true);
		jest.spyOn(wallet.coin(), "__construct").mockImplementation();

		const getPublicKeyMock = jest
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockResolvedValue("0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb");

		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [MultisignatureRegistrationFixture.data.id],
			errors: {},
			rejected: [],
		});

		const addSignatureSpy = jest.spyOn(wallet.transaction(), "addSignature").mockResolvedValue(undefined);

		const { container } = render(
			<Route path="/profiles/:profileId">
				<LedgerProvider>
					<MultisignatureDetailWrapper />
				</LedgerProvider>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await waitFor(() => expect(screen.getByTestId("Paginator__sign")));

		const address = wallet.address();
		const balance = wallet.balance();
		const derivationPath = "m/44'/1'/1'/0/0";
		const votes = wallet.voting().current();
		const publicKey = wallet.publicKey();

		const mockWalletData = jest.spyOn(wallet.data(), "get").mockImplementation((key) => {
			if (key === Contracts.WalletData.Address) {
				return address;
			}

			if (key === Contracts.WalletData.Balance) {
				return balance;
			}

			if (key === Contracts.WalletData.PublicKey) {
				return publicKey;
			}

			if (key === Contracts.WalletData.Votes) {
				return votes;
			}

			if (key === Contracts.WalletData.ImportMethod) {
				return "BIP44.DERIVATION_PATH";
			}

			if (key === Contracts.WalletData.DerivationPath) {
				return derivationPath;
			}
		});

		userEvent.click(screen.getByTestId("Paginator__sign"));

		await waitFor(() => expect(screen.getByTestId("LedgerDeviceError")).toBeVisible());

		expect(container).toMatchSnapshot();

		isLedgerMock.mockRestore();
		getPublicKeyMock.mockRestore();
		broadcastMock.mockRestore();
		addSignatureSpy.mockRestore();
		mockWalletData.mockRestore();
		nanoSMock.mockReset();
	});
});
