import { Contracts } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import React from "react";

import userEvent from "@testing-library/user-event";
import { WalletHeaderMobile } from "./WalletHeaderMobile";
import * as envHooks from "@/app/hooks/env";
import { env, getDefaultProfileId, renderResponsiveWithRoute, screen, within, waitFor } from "@/utils/testing-library";

const history = createHashHistory();

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

let walletUrl: string;

describe("WalletHeaderMobile", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		await wallet.synchroniser().votes();
		await wallet.synchroniser().identity();
		await wallet.synchroniser().coin();

		vi.spyOn(envHooks, "useActiveProfile").mockReturnValue(profile);

		walletUrl = `/profiles/${profile.id()}/wallets/${wallet.id()}`;

		history.push(walletUrl);
	});

	it("should render", async () => {
		const { asFragment } = renderResponsiveWithRoute(
			<WalletHeaderMobile profile={profile} wallet={wallet} />,
			"xs",
			{
				history,
				route: walletUrl,
			},
		);

		await expect(screen.findByText(wallet.address())).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render for starred wallets", async () => {
		const starredSpy = vi.spyOn(wallet, "isStarred").mockReturnValue(true);

		renderResponsiveWithRoute(<WalletHeaderMobile profile={profile} wallet={wallet} />, "xs", {
			history,
			route: walletUrl,
		});

		await expect(screen.findByText(wallet.address())).resolves.toBeVisible();

		// eslint-disable-next-line testing-library/no-node-access
		expect(document.querySelector("svg#star-filled")).toBeInTheDocument();

		starredSpy.mockRestore();
	});

	it("should show converted balance if wallet does not belongs to test network", async () => {
		const networkSpy = vi.spyOn(wallet.network(), "isTest").mockReturnValue(false);

		renderResponsiveWithRoute(<WalletHeaderMobile profile={profile} wallet={wallet} />, "xs", {
			history,
			route: walletUrl,
		});

		await expect(screen.findByText(wallet.address())).resolves.toBeVisible();

		await expect(screen.findByTestId("WalletHeaderMobile__currency-balance")).resolves.toBeVisible();

		networkSpy.mockRestore();
	});

	it("should call the onUpdate method when wallet name is updated", async () => {
		const onUpdateSpy = vi.fn();
		const networkSpy = vi.spyOn(wallet.network(), "isTest").mockReturnValue(false);

		renderResponsiveWithRoute(
			<WalletHeaderMobile profile={profile} wallet={wallet} onUpdate={onUpdateSpy} />,
			"xs",
			{
				history,
				route: walletUrl,
			},
		);

		await expect(screen.findByText(wallet.address())).resolves.toBeVisible();

		expect(screen.getByTestId("WalletHeaderMobile__more-button")).toBeVisible();

		userEvent.click(within(screen.getByTestId("WalletHeaderMobile__more-button")).getByTestId("dropdown__toggle"));

		await expect(screen.findByText("Wallet Name")).resolves.toBeVisible();

		userEvent.click(screen.getByText("Wallet Name"));

		await expect(screen.findByTestId("UpdateWalletName__input")).resolves.toBeVisible();

		const input = screen.getByTestId("UpdateWalletName__input");
		const submitButton = screen.getByTestId("UpdateWalletName__submit");

		await userEvent.clear(input);
		await userEvent.type(input, "New name");

		expect(input).toHaveValue("New name");

		await waitFor(() => expect(submitButton).toBeEnabled());
		userEvent.click(submitButton);

		await waitFor(() => expect(onUpdateSpy).toHaveBeenCalledWith(true));

		networkSpy.mockRestore();
	});
});
