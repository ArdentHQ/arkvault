/* eslint-disable @typescript-eslint/require-await */
import { Contracts, ReadOnlyWallet } from "@ardenthq/sdk-profiles";
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
	RenderResult,
	screen,
	syncDelegates,
	waitFor,
} from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";

const translations = buildTranslations();

const history = createHashHistory();
let walletUrl: string;

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let unvotedWallet: Contracts.IReadWriteWallet;

const renderPage = async ({ waitForTopSection = true } = {}) => {
	const utils: RenderResult = render(
		<Route path="/profiles/:profileId/wallets/:walletId">
			<WalletDetails />,
		</Route>,
		{
			history,
			route: walletUrl,
		},
	);

	if (waitForTopSection) {
		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();
	}

	return utils;
};

describe("WalletDetails", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().findById("ac38fe6d-4b67-4ef1-85be-17c5f6841129");

		unvotedWallet = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: MNEMONICS[0],
			network: "ark.devnet",
		});

		profile.wallets().push(unvotedWallet);

		await syncDelegates(profile);
		vi.spyOn(wallet.transaction(), "sync").mockResolvedValue(void 0);
	});

	beforeEach(async () => {
		server.use(
			requestMock(`https://ark-test.arkvault.io/api/wallets/${unvotedWallet.address()}`, walletMock),
			requestMock("https://ark-test-musig.arkvault.io", undefined, { method: "post" }),
		);

		walletUrl = `/profiles/${profile.id()}/wallets/${wallet.id()}`;
		history.push(walletUrl);
	});

	it("should navigate to send transfer", async () => {
		await renderPage({ waitForTopSection: true });

		const historySpy = vi.spyOn(history, "push").mockImplementation(vi.fn());

		await expect(screen.findByTestId("WalletHeader__send-button")).resolves.toBeVisible();
		await waitFor(() => expect(screen.getByTestId("WalletHeader__send-button")).toBeEnabled());

		userEvent.click(screen.getByTestId("WalletHeader__send-button"));

		await waitFor(() => {
			expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}/send-transfer`);
		});

		historySpy.mockRestore();
	});

	it("should navigate to votes page when clicking on WalletVote button", async () => {
		await profile.sync();

		const walletSpy = vi.spyOn(wallet.voting(), "current").mockReturnValue([]);
		const historySpy = vi.spyOn(history, "push");

		await renderPage();

		await expect(screen.findByText(translations.COMMON.LEARN_MORE)).resolves.toBeVisible();
		await waitFor(() => expect(screen.getByTestId("WalletVote__button")).toBeEnabled());

		userEvent.click(screen.getByTestId("WalletVote__button"));

		await waitFor(() => {
			expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}/votes`);
		});

		walletSpy.mockRestore();
		historySpy.mockRestore();
	});

	it('should navigate to votes with "current" filter param when clicking on Multivote', async () => {
		const walletSpy = vi.spyOn(wallet.voting(), "current").mockReturnValue([
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
		const maxVotesSpy = vi.spyOn(wallet.network(), "maximumVotesPerWallet").mockReturnValue(101);
		const historySpy = vi.spyOn(history, "push");

		await renderPage();
		await waitFor(() =>
			expect(screen.getByText(translations.WALLETS.PAGE_WALLET_DETAILS.VOTES.MULTIVOTE)).toBeEnabled(),
		);

		userEvent.click(screen.getByText(translations.WALLETS.PAGE_WALLET_DETAILS.VOTES.MULTIVOTE));

		await waitFor(() => {
			expect(historySpy).toHaveBeenCalledWith({
				pathname: `/profiles/${profile.id()}/wallets/${wallet.id()}/votes`,
				search: "?filter=current",
			});
		});

		walletSpy.mockRestore();
		maxVotesSpy.mockRestore();
		historySpy.mockRestore();
	});

	it("should update wallet name", async () => {
		await renderPage();

		userEvent.click(screen.getAllByTestId("dropdown__toggle")[4]);
		// eslint-disable-next-line testing-library/prefer-explicit-assert
		await screen.findByTestId("dropdown__option--primary-0");

		userEvent.click(screen.getByTestId("dropdown__option--primary-0"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		const name = "Sample label name";

		await userEvent.clear(screen.getByTestId("UpdateWalletName__input"));
		await userEvent.type(screen.getByTestId("UpdateWalletName__input"), name);

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

	it("should open wallet in explorer", async () => {
		const windowSpy = vi.spyOn(window, "open").mockImplementation(vi.fn());

		await renderPage();

		const dropdown = screen.getAllByTestId("dropdown__toggle")[4];

		expect(dropdown).toBeInTheDocument();

		userEvent.click(dropdown);
		// eslint-disable-next-line testing-library/prefer-explicit-assert
		await screen.findByTestId("dropdown__option--secondary-0");

		const openWalletOption = screen.getByTestId("dropdown__option--secondary-0");

		expect(openWalletOption).toBeInTheDocument();

		userEvent.click(openWalletOption);
		await waitFor(() => {
			expect(windowSpy).toHaveBeenCalledWith(wallet.explorerLink(), "_blank");
		});

		windowSpy.mockRestore();
	});

	it("should manually sync wallet data", async () => {
		await renderPage();

		await userEvent.click(screen.getByTestId("WalletHeader__refresh"));
		await waitFor(() => expect(screen.getByTestId("WalletHeader__refresh")).toHaveAttribute("aria-busy", "true"));
		await waitFor(() => expect(screen.getByTestId("WalletHeader__refresh")).toHaveAttribute("aria-busy", "false"));
	});

	it("should delete wallet and clear associated transaction notifications", async () => {
		await renderPage();

		const dropdown = screen.getAllByTestId("dropdown__toggle")[4];

		expect(dropdown).toBeInTheDocument();

		userEvent.click(dropdown);
		// eslint-disable-next-line testing-library/prefer-explicit-assert
		await screen.findByTestId("dropdown__option--secondary-1");

		const deleteWalletOption = screen.getByTestId("dropdown__option--secondary-1");

		expect(deleteWalletOption).toBeInTheDocument();

		userEvent.click(deleteWalletOption);

		expect(profile.wallets().count()).toBe(3);
		expect(profile.notifications().transactions().recent()).toHaveLength(2);

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("DeleteResource__submit-button"));

		await waitFor(() => expect(profile.wallets().count()).toBe(2));

		expect(profile.notifications().transactions().recent()).toHaveLength(0);
	});

	it("should not fail if the votes have not yet been synchronized", async () => {
		const newWallet = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: MNEMONICS[2],
			network: "ark.devnet",
		});

		server.use(requestMock(`https://ark-test.arkvault.io/api/wallets/${newWallet.address()}`, walletMock));

		profile.wallets().push(newWallet);

		await newWallet.synchroniser().identity();

		const syncVotesSpy = vi.spyOn(newWallet.synchroniser(), "votes").mockImplementation(vi.fn());

		walletUrl = `/profiles/${profile.id()}/wallets/${newWallet.id()}`;
		history.push(walletUrl);

		await renderPage();

		await expect(screen.findByText(translations.COMMON.LEARN_MORE)).resolves.toBeVisible();

		syncVotesSpy.mockRestore();
	});
});
