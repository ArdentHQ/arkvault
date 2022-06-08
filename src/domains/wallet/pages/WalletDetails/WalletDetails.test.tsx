/* eslint-disable @typescript-eslint/require-await */
import { Contracts, DTO, ReadOnlyWallet } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import nock from "nock";
import React from "react";
import { Route } from "react-router-dom";

import { WalletDetails } from "./WalletDetails";
import { LedgerProvider } from "@/app/contexts";
import { buildTranslations } from "@/app/i18n/helpers";
import { toasts } from "@/app/services";
import walletMock from "@/tests/fixtures/coins/ark/devnet/wallets/D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD.json";
import {
	defaultNetMocks,
	env,
	getDefaultProfileId,
	MNEMONICS,
	render,
	renderResponsiveWithRoute,
	RenderResult,
	screen,
	syncDelegates,
	waitFor,
	within,
} from "@/utils/testing-library";

const translations = buildTranslations();

const history = createHashHistory();
let walletUrl: string;

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let blankWallet: Contracts.IReadWriteWallet;
let unvotedWallet: Contracts.IReadWriteWallet;

let emptyProfile: Contracts.IProfile;
let wallet2: Contracts.IReadWriteWallet;

const passphrase2 = MNEMONICS[3];

const renderPage = async ({
	waitForTopSection = true,
	waitForTransactions = true,
	withProfileSynchronizer = false,
} = {}) => {
	const utils: RenderResult = render(
		<Route path="/profiles/:profileId/wallets/:walletId">
			<LedgerProvider>
				<WalletDetails />
			</LedgerProvider>
			,
		</Route>,
		{
			history,
			route: walletUrl,
			withProfileSynchronizer,
		},
	);

	if (waitForTopSection) {
		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();
	}

	if (waitForTransactions) {
		if (withProfileSynchronizer) {
			await waitFor(() =>
				expect(within(screen.getByTestId("TransactionTable")).queryAllByTestId("TableRow")).toHaveLength(1),
			);
		} else {
			await waitFor(() =>
				expect(within(screen.getByTestId("TransactionTable")).queryAllByTestId("TableRow")).not.toHaveLength(0),
			);
		}
	}

	return utils;
};

describe("WalletDetails", () => {
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
		jest.spyOn(wallet.transaction(), "canBeSigned").mockReturnValue(true);
		jest.spyOn(wallet.transaction(), "hasBeenSigned").mockReturnValue(true);
		jest.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(true);
		jest.spyOn(wallet.transaction(), "transaction").mockImplementation(() => fixtures.transfer);
	};

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().findById("ac38fe6d-4b67-4ef1-85be-17c5f6841129");
		blankWallet = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: passphrase2,
			network: "ark.devnet",
		});

		unvotedWallet = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: MNEMONICS[0],
			network: "ark.devnet",
		});

		emptyProfile = env.profiles().findById("cba050f1-880f-45f0-9af9-cfe48f406052");

		wallet2 = await emptyProfile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: MNEMONICS[1],
			network: "ark.devnet",
		});

		profile.wallets().push(blankWallet);
		profile.wallets().push(unvotedWallet);
		emptyProfile.wallets().push(wallet2);

		await syncDelegates(profile);

		nock("https://ark-test.arkvault.io")
			.get("/api/delegates")
			.query({ page: "1" })
			.reply(200, require("tests/fixtures/coins/ark/devnet/delegates.json"))
			.get(`/api/wallets/${unvotedWallet.address()}`)
			.reply(200, walletMock)
			.get(`/api/wallets/${blankWallet.address()}`)
			.reply(404, {
				error: "Not Found",
				message: "Wallet not found",
				statusCode: 404,
			})
			.get(`/api/wallets/${wallet2.address()}`)
			.reply(404, {
				error: "Not Found",
				message: "Wallet not found",
				statusCode: 404,
			})
			.get("/api/transactions")
			.query((parameters) => !!parameters.address)
			.reply(200, (url) => {
				const { meta, data } = require("tests/fixtures/coins/ark/devnet/transactions.json");
				const filteredUrl =
					"/api/transactions?page=1&limit=1&address=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD&type=0&typeGroup=1";
				if (url === filteredUrl) {
					return { data: [], meta };
				}

				return {
					data: data.slice(0, 1),
					meta,
				};
			})
			.persist();

		// Mock musig server requests
		jest.spyOn(wallet.transaction(), "sync").mockResolvedValue(void 0);
	});

	beforeEach(async () => {
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

		walletUrl = `/profiles/${profile.id()}/wallets/${wallet.id()}`;
		history.push(walletUrl);
	});

	it("should render pending multiSignatures and view details in modal", async () => {
		mockPendingTransfers(wallet);

		await renderPage();

		await expect(screen.findByTestId("PendingTransactions")).resolves.toBeVisible();

		userEvent.click(within(screen.getByTestId("PendingTransactions")).getAllByTestId("TableRow")[0]);

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("Modal__close-button"));

		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());
		jest.restoreAllMocks();
	});

	it("should render responsive", async () => {
		mockPendingTransfers(wallet);

		renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/wallets/:walletId">
				<LedgerProvider>
					<WalletDetails />
				</LedgerProvider>
				,
			</Route>,
			"xs",
			{
				history,
				route: walletUrl,
			},
		);

		await expect(screen.findByTestId("PendingTransactions")).resolves.toBeVisible();

		userEvent.click(within(screen.getByTestId("PendingTransactions")).getAllByTestId("TableRow__mobile")[0]);

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("Modal__close-button"));

		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());
		jest.restoreAllMocks();
	});

	it("should render as not compact if user uses expanded tables", async () => {
		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, true);

		mockPendingTransfers(wallet);

		await renderPage();

		await expect(screen.findByTestId("PendingTransactions")).resolves.toBeVisible();

		userEvent.click(within(screen.getByTestId("PendingTransactions")).getAllByTestId("TableRow")[0]);

		await expect(screen.findByTestId("TableRemoveButton")).resolves.toBeVisible();

		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, false);

		jest.restoreAllMocks();
	});

	it("should render as compact on md screen even if user uses expanded tables", async () => {
		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, true);

		mockPendingTransfers(wallet);

		renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/wallets/:walletId">
				<LedgerProvider>
					<WalletDetails />
				</LedgerProvider>
				,
			</Route>,
			"md",
			{
				history,
				route: walletUrl,
			},
		);

		await expect(screen.findByTestId("PendingTransactions")).resolves.toBeVisible();

		userEvent.click(within(screen.getByTestId("PendingTransactions")).getAllByTestId("TableRow")[0]);

		await expect(screen.findByTestId("TableRemoveButton--compact")).resolves.toBeVisible();

		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, false);

		jest.restoreAllMocks();
	});

	it("shows the transaction detail modal when click in a pending transfer row", async () => {
		jest.spyOn(fixtures.transfer, "usesMultiSignature").mockReturnValue(false);
		jest.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(true);

		mockPendingTransfers(wallet);

		await renderPage();

		await expect(screen.findByTestId("PendingTransactions")).resolves.toBeVisible();

		userEvent.click(within(screen.getByTestId("PendingTransactions")).getAllByTestId("TableRow")[0]);

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("Modal__close-button"));

		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());

		jest.restoreAllMocks();
	});

	it("should remove pending multisignature transactions", async () => {
		mockPendingTransfers(wallet);

		await renderPage();

		await expect(screen.findByTestId("PendingTransactions")).resolves.toBeVisible();

		userEvent.click(within(screen.getByTestId("PendingTransactions")).getAllByTestId("TableRow")[0]);

		await expect(screen.findByTestId("TableRemoveButton--compact")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("TableRemoveButton--compact"));

		await expect(
			screen.findByTestId("ConfirmRemovePendingTransaction__Transfer-Transaction"),
		).resolves.toBeVisible();

		jest.restoreAllMocks();
		defaultNetMocks();
		nock("https://ark-test-musig.arkvault.io/")
			.get("/api/wallets/DDA5nM7KEqLeTtQKv5qGgcnc6dpNBKJNTS")
			.reply(200, []);
		nock("https://ark-test-musig.arkvault.io")
			.post("/")
			.reply(200, { result: { id: "03df6cd794a7d404db4f1b25816d8976d0e72c5177d17ac9b19a92703b62cdbbbc" } });

		const toastsMock = jest.spyOn(toasts, "success");

		userEvent.click(screen.getByTestId("DeleteResource__submit-button"));

		await waitFor(() => expect(screen.queryByTestId("PendingTransactions")).not.toBeInTheDocument());

		expect(toastsMock).toHaveBeenCalledWith(translations.TRANSACTION.TRANSACTION_REMOVED);

		toastsMock.mockRestore();
	});

	it("should navigate to send transfer", async () => {
		await renderPage({ waitForTopSection: true });

		const historySpy = jest.spyOn(history, "push").mockImplementation();

		await expect(screen.findByTestId("WalletHeader__send-button")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("WalletHeader__send-button")).not.toBeDisabled());

		userEvent.click(screen.getByTestId("WalletHeader__send-button"));

		expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}/send-transfer`);

		historySpy.mockRestore();
	});

	it("should not render wallet vote when the network does not support votes", async () => {
		const networkFeatureSpy = jest.spyOn(wallet.network(), "allowsVoting").mockReturnValue(false);

		await renderPage({ waitForTopSection: false });

		await waitFor(() => {
			expect(screen.queryByTestId("WalletVote")).not.toBeInTheDocument();
		});

		networkFeatureSpy.mockRestore();
	});

	it("should render when wallet not found for votes", async () => {
		jest.spyOn(blankWallet, "isMultiSignature").mockReturnValue(false);

		walletUrl = `/profiles/${profile.id()}/wallets/${blankWallet.id()}`;
		history.push(walletUrl);

		await renderPage({ waitForTopSection: true, waitForTransactions: false });

		await expect(screen.findByText(translations.COMMON.LEARN_MORE)).resolves.toBeVisible();
	});

	it("should navigate to votes page when clicking on WalletVote button", async () => {
		await profile.sync();

		const walletSpy = jest.spyOn(wallet.voting(), "current").mockReturnValue([]);
		const historySpy = jest.spyOn(history, "push");

		await renderPage();

		await expect(screen.findByText(translations.COMMON.LEARN_MORE)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("WalletVote__button")).not.toBeDisabled());

		userEvent.click(screen.getByTestId("WalletVote__button"));

		expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}/votes`);

		walletSpy.mockRestore();
		historySpy.mockRestore();
	});

	it('should navigate to votes with "current" filter param when clicking on Multivote', async () => {
		const walletSpy = jest.spyOn(wallet.voting(), "current").mockReturnValue([
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					address: wallet.address(),
					explorerLink: "",
					publicKey: wallet.publicKey(),
					rank: 1,
					username: "arkx",
				}),
			},
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					address: wallet.address(),
					explorerLink: "",
					publicKey: wallet.publicKey(),
					rank: 2,
					username: "arky",
				}),
			},
		]);
		const maxVotesSpy = jest.spyOn(wallet.network(), "maximumVotesPerWallet").mockReturnValue(101);
		const historySpy = jest.spyOn(history, "push");

		await renderPage();

		userEvent.click(screen.getByText(translations.WALLETS.PAGE_WALLET_DETAILS.VOTES.MULTIVOTE));

		expect(historySpy).toHaveBeenCalledWith({
			pathname: `/profiles/${profile.id()}/wallets/${wallet.id()}/votes`,
			search: "?filter=current",
		});

		walletSpy.mockRestore();
		maxVotesSpy.mockRestore();
		historySpy.mockRestore();
	});

	it("should update wallet name", async () => {
		await renderPage();

		userEvent.click(screen.getAllByTestId("dropdown__toggle")[4]);

		userEvent.click(screen.getByTestId("dropdown__option--primary-0"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		const name = "Sample label name";

		userEvent.clear(screen.getByTestId("UpdateWalletName__input"));
		userEvent.paste(screen.getByTestId("UpdateWalletName__input"), name);

		await waitFor(() => expect(screen.getByTestId("UpdateWalletName__submit")).toBeEnabled());

		userEvent.click(screen.getByTestId("UpdateWalletName__submit"));

		await waitFor(() => expect(wallet.settings().get(Contracts.WalletSetting.Alias)).toBe(name));
	});

	it("should star and unstar a wallet", async () => {
		await renderPage();

		expect(wallet.isStarred()).toBe(false);

		userEvent.click(screen.getByTestId("WalletHeader__star-button"));

		await waitFor(() => expect(wallet.isStarred()).toBe(true));

		userEvent.click(screen.getByTestId("WalletHeader__star-button"));

		await waitFor(() => expect(wallet.isStarred()).toBe(false));
	});

	it("should open detail modal on transaction row click", async () => {
		await renderPage({
			waitForTopSection: true,
			waitForTransactions: true,
			withProfileSynchronizer: true,
		});

		userEvent.click(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")[0]);

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("Modal__close-button"));

		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());
	});

	it("should fetch more transactions", async () => {
		process.env.REACT_APP_IS_UNIT = "1";

		await renderPage({
			waitForTopSection: true,
			waitForTransactions: true,
			withProfileSynchronizer: true,
		});

		const fetchMoreTransactionsButton = screen.getByTestId("transactions__fetch-more-button");

		userEvent.click(fetchMoreTransactionsButton);

		await waitFor(() => {
			expect(within(screen.getAllByTestId("TransactionTable")[0]).queryAllByTestId("TableRow")).toHaveLength(2);
		});
	});

	it("should filter by type", async () => {
		process.env.REACT_APP_IS_UNIT = "1";

		await renderPage({
			waitForTopSection: true,
			waitForTransactions: true,
			withProfileSynchronizer: true,
		});

		const button = screen.getAllByRole("button", { name: /Type/ })[0];

		expect(button).not.toBeDisabled();

		userEvent.click(button);

		await expect(screen.findByTestId("dropdown__option--core-0")).resolves.toBeVisible();
		await expect(screen.findByTestId("dropdown__option--core-0")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("dropdown__option--core-0"));

		await waitFor(
			() => expect(within(screen.getByTestId("TransactionTable")).queryAllByTestId("TableRow")).toHaveLength(8),
			{ timeout: 4000 },
		);
	});

	it("should open wallet in explorer", async () => {
		const windowSpy = jest.spyOn(window, "open").mockImplementation();

		await renderPage();

		const dropdown = screen.getAllByTestId("dropdown__toggle")[4];

		expect(dropdown).toBeInTheDocument();

		userEvent.click(dropdown);

		const openWalletOption = screen.getByTestId("dropdown__option--secondary-0");

		expect(openWalletOption).toBeInTheDocument();

		userEvent.click(openWalletOption);

		expect(windowSpy).toHaveBeenCalledWith(wallet.explorerLink(), "_blank");
	});

	it("should manually sync wallet data", async () => {
		await renderPage();

		userEvent.click(screen.getByTestId("WalletHeader__refresh"));

		expect(screen.getByTestId("WalletHeader__refresh")).toHaveAttribute("aria-busy", "true");

		await waitFor(() => expect(screen.getByTestId("WalletHeader__refresh")).toHaveAttribute("aria-busy", "false"));
	});

	it("should delete wallet and clear associated transaction notifications", async () => {
		await renderPage();

		const dropdown = screen.getAllByTestId("dropdown__toggle")[4];

		expect(dropdown).toBeInTheDocument();

		userEvent.click(dropdown);

		const deleteWalletOption = screen.getByTestId("dropdown__option--secondary-1");

		expect(deleteWalletOption).toBeInTheDocument();

		userEvent.click(deleteWalletOption);

		expect(profile.wallets().count()).toBe(4);
		expect(profile.notifications().transactions().recent()).toHaveLength(2);

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("DeleteResource__submit-button"));

		await waitFor(() => expect(profile.wallets().count()).toBe(3));

		expect(profile.notifications().transactions().recent()).toHaveLength(0);
	});

	it("should not fail if the votes have not yet been synchronized", async () => {
		const newWallet = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: MNEMONICS[2],
			network: "ark.devnet",
		});

		profile.wallets().push(newWallet);

		nock("https://ark-test.arkvault.io").get(`/api/wallets/${newWallet.address()}`).reply(200, walletMock);

		await newWallet.synchroniser().identity();

		const syncVotesSpy = jest.spyOn(newWallet.synchroniser(), "votes").mockImplementation();

		walletUrl = `/profiles/${profile.id()}/wallets/${newWallet.id()}`;
		history.push(walletUrl);

		await renderPage();

		await expect(screen.findByText(translations.COMMON.LEARN_MORE)).resolves.toBeVisible();

		syncVotesSpy.mockRestore();
	});
});
