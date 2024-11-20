/* eslint-disable @typescript-eslint/require-await */
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { WalletDetails } from "./WalletDetails";
import { requestMock, server } from "@/tests/mocks/server";
import transactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions.json";
import walletMock from "@/tests/fixtures/coins/ark/devnet/wallets/D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD.json";
import {
	env,
	getDefaultProfileId,
	MNEMONICS,
	render,
	RenderResult,
	screen,
	syncDelegates,
	waitFor,
	within,
} from "@/utils/testing-library";

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
			<WalletDetails />,
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
		multiPayment: undefined,
		multiSignature: undefined,
		transfer: undefined,
		unvote: undefined,
		vote: undefined,
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

		// Mock musig server requests
		vi.spyOn(wallet.transaction(), "sync").mockResolvedValue(void 0);
	});

	beforeEach(async () => {
		const { meta, data } = transactionsFixture;

		server.use(
			requestMock(`https://ark-test.arkvault.io/api/wallets/${unvotedWallet.address()}`, walletMock),
			requestMock(
				`https://ark-test.arkvault.io/api/wallets/${blankWallet.address()}`,
				{
					error: "Not Found",
					message: "Wallet not found",
					statusCode: 404,
				},
				{ status: 404 },
			),
			requestMock(`https://ark-test.arkvault.io/api/wallets/${wallet2.address()}`, {
				error: "Not Found",
				message: "Wallet not found",
				statusCode: 404,
			}),
			requestMock("https://ark-test-musig.arkvault.io", undefined, { method: "post" }),
			requestMock(
				"https://ark-test.arkvault.io/api/transactions",
				{ data: [], meta },
				{
					query: {
						address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
						limit: 1,
						page: 1,
					},
				},
			),
			requestMock("https://ark-test.arkvault.io/api/transactions", {
				data: data.slice(0, 1),
				meta,
			}),
		);

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

	it("should open detail modal on transaction row click", async () => {
		await renderPage({
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
});
