import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { UpdateAccountNameModal } from "./UpdateAccountNameModal";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { translations } from "@/domains/wallet/i18n";
import {
	env,
	getDefaultMainsailWalletId,
	getMainsailProfileId,
	render,
	screen,
	waitFor,
} from "@/utils/testing-library";
import { wait } from "@testing-library/user-event/dist/types/utils";

describe("UpdateAccountNameModal", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeAll(() => {
		profile = env.profiles().findById(getMainsailProfileId());
		wallet = profile.wallets().findById(getDefaultMainsailWalletId());
	});

	it("should render", async () => {
		const { asFragment } = render(
			<UpdateAccountNameModal profile={profile} wallet={wallet} onAfterSave={vi.fn()} onCancel={vi.fn()} />,
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_NAME_WALLET.HD_DESCRIPTION);
		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(commonTranslations.ACCOUNT_NAME);
		})
		expect(asFragment()).toMatchSnapshot();
	});

	it("should update hd wallet account name", async () => {
		const onAfterSave = vi.fn();

		render(<UpdateAccountNameModal profile={profile} wallet={wallet} onAfterSave={onAfterSave} onCancel={vi.fn()} />);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_NAME_WALLET.HD_DESCRIPTION);
		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(commonTranslations.ACCOUNT_NAME);
		})

		const name = "Sample label";

		await userEvent.clear(screen.getByTestId("UpdateWalletAccountName__input"));
		await userEvent.type(screen.getByTestId("UpdateWalletAccountName__input"), name);

		await waitFor(() => {
			expect(screen.getByTestId("UpdateWalletAccountName__input")).toHaveValue(name);
		});

		await waitFor(() => {
			expect(screen.getByTestId("UpdateWalletName__submit")).not.toBeDisabled();
		});

		await userEvent.click(screen.getByTestId("UpdateWalletName__submit"));

		await waitFor(() => expect(onAfterSave).toHaveBeenCalled());
	});

	it("should show error message when name consists only of whitespace", async () => {
		const { asFragment } = render(
			<UpdateAccountNameModal profile={profile} wallet={wallet} onAfterSave={vi.fn()} onCancel={vi.fn()} />,
		);

		await userEvent.clear(screen.getByTestId("UpdateWalletAccountName__input"));
		await userEvent.type(screen.getByTestId("UpdateWalletAccountName__input"), "      ");

		// wait for formState.isValid to be updated
		await expect(screen.findByTestId("UpdateWalletName__submit")).resolves.toBeVisible();

		expect(screen.getByTestId("UpdateWalletName__submit")).toBeDisabled();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should show error message when name exceeds 42 characters", async () => {
		const { asFragment } = render(
			<UpdateAccountNameModal profile={profile} wallet={wallet} onAfterSave={vi.fn()} onCancel={vi.fn()} />,
		);

		await userEvent.clear(screen.getByTestId("UpdateWalletAccountName__input"));
		await userEvent.type(
			screen.getByTestId("UpdateWalletAccountName__input"),
			"Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet fugit distinctio",
		);

		// wait for formState.isValid to be updated
		await expect(screen.findByTestId("UpdateWalletName__submit")).resolves.toBeVisible();

		expect(screen.getByTestId("UpdateWalletName__submit")).toBeDisabled();
		expect(asFragment()).toMatchSnapshot();
	});
});
