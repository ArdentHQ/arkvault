import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import {
	env,
	getDefaultMainsailWalletId,
	getMainsailProfileId,
	render,
	screen,
	waitFor,
} from "@/utils/testing-library";
import { UpdateAddressName } from "./UpdateAddressName";

describe("UpdateAddressName", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeAll(() => {
		profile = env.profiles().findById(getMainsailProfileId());
		wallet = profile.wallets().findById(getDefaultMainsailWalletId());
	});

	it("should render", () => {
		const { asFragment } = render(
			<UpdateAddressName profile={profile} wallet={wallet} onAfterSave={vi.fn()} onCancel={vi.fn()} />,
		);

		expect(screen.getByTestId("FormLabel")).toHaveTextContent(commonTranslations.NAME);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should rename wallet", async () => {
		const aliasSpy = vi.spyOn(wallet.mutator(), "alias");
		const onAfterSave = vi.fn();

		render(<UpdateAddressName profile={profile} wallet={wallet} onAfterSave={onAfterSave} onCancel={vi.fn()} />);

		expect(screen.getByTestId("FormLabel")).toHaveTextContent(commonTranslations.NAME);

		const name = "Sample label";

		const user = userEvent.setup();

		await user.clear(screen.getByTestId("UpdateWalletName__input"));
		await user.paste(name);

		await waitFor(() => {
			expect(screen.getByTestId("UpdateWalletName__input")).toHaveValue(name);
		});

		await waitFor(() => {
			expect(screen.getByTestId("UpdateWalletName__submit")).not.toBeDisabled();
		});

		await userEvent.click(screen.getByTestId("UpdateWalletName__submit"));

		await waitFor(() => expect(onAfterSave).toHaveBeenCalledWith());

		expect(aliasSpy).toHaveBeenCalledWith(name);
		expect(wallet.settings().get(Contracts.WalletSetting.Alias)).toStrictEqual(name);
	});

	it("should show an error message for duplicate name", async () => {
		const { asFragment } = render(
			<UpdateAddressName profile={profile} wallet={wallet} onAfterSave={vi.fn()} onCancel={vi.fn()} />,
		);

		const nameVariations = ["Mainsail Wallet 2", "mainsail wallet 2", " Mainsail Wallet 2", "Mainsail Wallet 2 "];

		const user = userEvent.setup();

		for (const name of nameVariations) {
			await user.clear(screen.getByTestId("UpdateWalletName__input"));
			await user.paste(name);

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
			<UpdateAddressName profile={profile} wallet={wallet} onAfterSave={vi.fn()} onCancel={vi.fn()} />,
		);

		const user = userEvent.setup();

		await user.clear(screen.getByTestId("UpdateWalletName__input"));
		await user.paste("      ");

		// wait for formState.isValid to be updated
		await expect(screen.findByTestId("UpdateWalletName__submit")).resolves.toBeVisible();

		expect(screen.getByTestId("UpdateWalletName__submit")).toBeDisabled();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should show error message when name exceeds 42 characters", async () => {
		const { asFragment } = render(
			<UpdateAddressName profile={profile} wallet={wallet} onAfterSave={vi.fn()} onCancel={vi.fn()} />,
		);

		const user = userEvent.setup();

		await user.clear(screen.getByTestId("UpdateWalletName__input"));
		await user.paste("Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet fugit distinctio");

		// wait for formState.isValid to be updated
		await expect(screen.findByTestId("UpdateWalletName__submit")).resolves.toBeVisible();

		expect(screen.getByTestId("UpdateWalletName__submit")).toBeDisabled();
		expect(asFragment()).toMatchSnapshot();
	});
});
