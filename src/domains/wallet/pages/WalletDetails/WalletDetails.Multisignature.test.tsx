/* eslint-disable @typescript-eslint/require-await */
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import nock from "nock";
import React from "react";
import { Route } from "react-router-dom";

import { WalletDetails } from "./WalletDetails";
import { buildTranslations } from "@/app/i18n/helpers";
import { toasts } from "@/app/services";
import walletMock from "@/tests/fixtures/coins/ark/devnet/wallets/D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD.json";
import {
	defaultNetMocks,
	env,
	getDefaultProfileId,
	render,
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

const renderPage = () =>
	render(
		<Route path="/profiles/:profileId/wallets/:walletId">
			<WalletDetails />,
		</Route>,
		{
			history,
			route: walletUrl,
		},
	);

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
		vi.spyOn(wallet.transaction(), "signed").mockReturnValue({
			[fixtures.transfer.id()]: fixtures.transfer,
		});
		vi.spyOn(wallet.transaction(), "canBeSigned").mockReturnValue(true);
		vi.spyOn(wallet.transaction(), "hasBeenSigned").mockReturnValue(true);
		vi.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(true);
		vi.spyOn(wallet.transaction(), "transaction").mockImplementation(() => fixtures.transfer);
	};

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().findById("ac38fe6d-4b67-4ef1-85be-17c5f6841129");

		await syncDelegates(profile);

		nock("https://ark-test.arkvault.io")
			.get("/api/delegates")
			.query({ page: "1" })
			.reply(200, walletMock)
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

		vi.spyOn(wallet.transaction(), "sync").mockResolvedValue(void 0);
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

		mockPendingTransfers(wallet);
	});

	it("should render pending multiSignatures and view details in modal", async () => {
		renderPage();

		await expect(screen.findByTestId("PendingTransactions")).resolves.toBeVisible();

		userEvent.click(within(screen.getByTestId("PendingTransactions")).getAllByTestId("TableRow")[0]);

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("Modal__close-button"));

		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());
		vi.restoreAllMocks();
	});

	it("shows the transaction detail modal when click in a pending transfer row", async () => {
		vi.spyOn(fixtures.transfer, "usesMultiSignature").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(true);

		renderPage();

		await expect(screen.findByTestId("PendingTransactions")).resolves.toBeVisible();

		userEvent.click(within(screen.getByTestId("PendingTransactions")).getAllByTestId("TableRow")[0]);

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("Modal__close-button"));

		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());

		vi.restoreAllMocks();
	});

	it("should remove pending multisignature transactions", async () => {
		renderPage();

		await expect(screen.findByTestId("PendingTransactions")).resolves.toBeVisible();

		userEvent.click(within(screen.getByTestId("PendingTransactions")).getAllByTestId("TableRow")[0]);

		await expect(screen.findByTestId("TableRemoveButton--compact")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("TableRemoveButton--compact"));

		await expect(
			screen.findByTestId("ConfirmRemovePendingTransaction__Transfer-Transaction"),
		).resolves.toBeVisible();

		vi.restoreAllMocks();
		defaultNetMocks();

		nock("https://ark-test-musig.arkvault.io/")
			.get("/api/wallets/DDA5nM7KEqLeTtQKv5qGgcnc6dpNBKJNTS")
			.reply(200, []);

		nock("https://ark-test-musig.arkvault.io")
			.post("/")
			.reply(200, { result: { id: "03df6cd794a7d404db4f1b25816d8976d0e72c5177d17ac9b19a92703b62cdbbbc" } });

		const toastsMock = vi.spyOn(toasts, "success");

		userEvent.click(screen.getByTestId("DeleteResource__submit-button"));

		await waitFor(() => expect(screen.queryByTestId("PendingTransactions")).not.toBeInTheDocument());

		expect(toastsMock).toHaveBeenCalledWith(translations.TRANSACTION.TRANSACTION_REMOVED);

		toastsMock.mockRestore();
	});
});
