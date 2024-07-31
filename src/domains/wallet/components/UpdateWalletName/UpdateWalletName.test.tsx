/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { UpdateWalletName } from "./UpdateWalletName";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { translations } from "@/domains/wallet/i18n";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";

describe("UpdateWalletName", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().findById("ac38fe6d-4b67-4ef1-85be-17c5f6841129");
	});

	it("should render", () => {
		const { asFragment } = render(
			<UpdateWalletName profile={profile} wallet={wallet} onAfterSave={vi.fn()} onCancel={vi.fn()} />,
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_NAME_WALLET.TITLE);
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_NAME_WALLET.DESCRIPTION);
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(commonTranslations.NAME);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should rename wallet", async () => {
		const aliasSpy = vi.spyOn(wallet.mutator(), "alias");
		const onAfterSave = vi.fn();

		render(<UpdateWalletName profile={profile} wallet={wallet} onAfterSave={onAfterSave} onCancel={vi.fn()} />);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_NAME_WALLET.TITLE);
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_NAME_WALLET.DESCRIPTION);
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(commonTranslations.NAME);

		const name = "Sample label";

		userEvent.clear(screen.getByTestId("UpdateWalletName__input"));
		userEvent.type(screen.getByTestId("UpdateWalletName__input"), name);

		await waitFor(() => {
			expect(screen.getByTestId("UpdateWalletName__input")).toHaveValue(name);
		});

		await waitFor(() => {
			expect(screen.getByTestId("UpdateWalletName__submit")).not.toBeDisabled();
		});

		userEvent.click(screen.getByTestId("UpdateWalletName__submit"));

		await waitFor(() => expect(onAfterSave).toHaveBeenCalledWith());

		expect(aliasSpy).toHaveBeenCalledWith(name);
		expect(wallet.settings().get(Contracts.WalletSetting.Alias)).toStrictEqual(name);
	});

	it("should show an error message for duplicate name", async () => {
		const { asFragment } = render(
			<UpdateWalletName profile={profile} wallet={wallet} onAfterSave={vi.fn()} onCancel={vi.fn()} />,
		);

		const nameVariations = ["ARK Wallet 2", "ark wallet 2", " ARK Wallet 2", "ARK Wallet 2 "];

		for (const name of nameVariations) {
			userEvent.clear(screen.getByTestId("UpdateWalletName__input"));
			await userEvent.clear(screen.getByTestId("UpdateWalletName__input"));
			await userEvent.type(screen.getByTestId("UpdateWalletName__input"), name);

			await waitFor(() => {
				expect(screen.getByTestId("UpdateWalletName__input")).toHaveValue(name);
			});

			await waitFor(() => {
				expect(screen.getByTestId("Input__error")).toBeVisible();
			});

			expect(screen.getByTestId("UpdateWalletName__submit")).toBeDisabled();
			expect(asFragment()).toMatchSnapshot();
		}
	});

	it("should show error message when name consists only of whitespace", async () => {
		const { asFragment } = render(
			<UpdateWalletName profile={profile} wallet={wallet} onAfterSave={vi.fn()} onCancel={vi.fn()} />,
		);

		userEvent.clear(screen.getByTestId("UpdateWalletName__input"));
		userEvent.type(screen.getByTestId("UpdateWalletName__input"), "      ");

		// wait for formState.isValid to be updated
		await expect(screen.findByTestId("UpdateWalletName__submit")).resolves.toBeVisible();

		expect(screen.getByTestId("UpdateWalletName__submit")).toBeDisabled();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should show error message when name exceeds 42 characters", async () => {
		const { asFragment } = render(
			<UpdateWalletName profile={profile} wallet={wallet} onAfterSave={vi.fn()} onCancel={vi.fn()} />,
		);

		await userEvent.clear(
			screen.getByTestId("UpdateWalletName__input")
		);
		await userEvent.type(
			screen.getByTestId("UpdateWalletName__input"),
			"Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet fugit distinctio",
		);

		// wait for formState.isValid to be updated
		await expect(screen.findByTestId("UpdateWalletName__submit")).resolves.toBeVisible();

		expect(screen.getByTestId("UpdateWalletName__submit")).toBeDisabled();
		expect(asFragment()).toMatchSnapshot();
	});
});
