/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
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
		await wallet.synchroniser().identity();
		await wallet.synchroniser().coin();

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

		await userEvent.click(screen.getByTestId("WalletHeader__send-button"));

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

	// @TODO: Enable & refactor tests once mainsail coin support will be completed.
	//		  See https://app.clickup.com/t/86dvbvrvf
	it.skip("should manually sync wallet data", async () => {
		await renderPage();

		await userEvent.click(screen.getByTestId("WalletHeader__refresh"));
		await waitFor(() => expect(screen.getByTestId("WalletHeader__refresh")).toHaveAttribute("aria-busy", "true"));
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
