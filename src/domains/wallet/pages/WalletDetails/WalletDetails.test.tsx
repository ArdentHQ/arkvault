/* eslint-disable @typescript-eslint/require-await */
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { WalletDetails } from "./WalletDetails";
import { buildTranslations } from "@/app/i18n/helpers";
import walletMock from "@/tests/fixtures/coins/ark/devnet/wallets/D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD.json";
import {
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
import { server, requestMock } from "@/tests/mocks/server";

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

	it.skip("should render responsive", async () => {
		mockPendingTransfers(wallet);

		renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/wallets/:walletId">
				<WalletDetails />,
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
		vi.restoreAllMocks();
	});

	it("should always render wallet vote", async () => {
		const networkFeatureSpy = vi.spyOn(wallet.network(), "allowsVoting").mockReturnValue(false);

		await renderPage({ waitForTopSection: false });

		await waitFor(() => {
			expect(screen.getByTestId("WalletVote")).toBeInTheDocument();
		});

		networkFeatureSpy.mockRestore();
	});

	it("should render when wallet not found for votes", async () => {
		vi.spyOn(blankWallet, "isMultiSignature").mockReturnValue(false);

		walletUrl = `/profiles/${profile.id()}/wallets/${blankWallet.id()}`;
		history.push(walletUrl);

		await renderPage({ waitForTopSection: true, waitForTransactions: false });

		await expect(screen.findByText(translations.COMMON.LEARN_MORE)).resolves.toBeVisible();
	});
});
