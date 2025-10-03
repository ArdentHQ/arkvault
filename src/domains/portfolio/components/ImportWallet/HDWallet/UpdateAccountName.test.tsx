import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { env, getMainsailProfileId, render, screen, waitFor } from "@/utils/testing-library";
import { UpdateAccountName } from "./UpdateAccountName";

describe("UpdateAccountName", () => {
	let profile: Contracts.IProfile;
	let wallet1: Contracts.IReadWriteWallet;
	let wallet2: Contracts.IReadWriteWallet;
	let wallets: Contracts.IReadWriteWallet[];

	beforeAll(() => {
		profile = env.profiles().findById(getMainsailProfileId());
		wallet1 = profile.wallets().values()[0];
		wallet2 = profile.wallets().values()[1];

		wallets = [wallet1, wallet2];
	});

	it("should render", () => {
		const { asFragment, unmount } = render(
			<UpdateAccountName profile={profile} wallets={wallets} onAfterSave={vi.fn()} onCancel={vi.fn()} />,
		);

		expect(screen.getByTestId("FormLabel")).toHaveTextContent(commonTranslations.NAME);
		expect(asFragment()).toMatchSnapshot();

		unmount();
	});

	it("should update account name for wallets", async () => {
		const accountNameSpy1 = vi.spyOn(wallet1.mutator(), "accountName");
		const accountNameSpy2 = vi.spyOn(wallet2.mutator(), "accountName");
		const onAfterSave = vi.fn();

		const { unmount } = render(
			<UpdateAccountName profile={profile} wallets={wallets} onAfterSave={onAfterSave} onCancel={vi.fn()} />,
		);

		const name = "Account Name";
		const user = userEvent.setup();

		await user.clear(screen.getByTestId("UpdateWalletName__input"));
		await user.paste(name);

		await waitFor(() => {
			expect(screen.getByTestId("UpdateWalletName__input")).toHaveValue(name);
		});

		await user.click(screen.getByTestId("UpdateWalletName__submit"));

		await waitFor(() => {
			expect(accountNameSpy1).toHaveBeenCalledWith(name);
		});

		expect(accountNameSpy2).toHaveBeenCalledWith(name);

		expect(onAfterSave).toHaveBeenCalledTimes(1);

		unmount();
	});

	it("should cancel editing", async () => {
		const onCancel = vi.fn();

		const { unmount } = render(
			<UpdateAccountName profile={profile} wallets={wallets} onAfterSave={vi.fn()} onCancel={onCancel} />,
		);

		const user = userEvent.setup();

		await user.click(screen.getByTestId("UpdateWalletName__cancel"));

		expect(onCancel).toHaveBeenCalledTimes(1);

		unmount();
	});

	it("should disable save button when input is invalid", async () => {
		const { unmount } = render(
			<UpdateAccountName profile={profile} wallets={wallets} onAfterSave={vi.fn()} onCancel={vi.fn()} />,
		);

		const user = userEvent.setup();

		// Clear input to make it invalid
		await user.clear(screen.getByTestId("UpdateWalletName__input"));

		await waitFor(() => {
			expect(screen.getByTestId("UpdateWalletName__submit")).toBeDisabled();
		});

		unmount();
	});

	it("should disable save button when name hasn't changed", async () => {
		const { unmount } = render(
			<UpdateAccountName profile={profile} wallets={wallets} onAfterSave={vi.fn()} onCancel={vi.fn()} />,
		);

		// Submit button should be disabled initially when no changes are made
		expect(screen.getByTestId("UpdateWalletName__submit")).toBeDisabled();

		unmount();
	});

	it("should show current account name as default value", async () => {
		const currentName = wallet1.accountName();

		const { unmount } = render(
			<UpdateAccountName profile={profile} wallets={wallets} onAfterSave={vi.fn()} onCancel={vi.fn()} />,
		);

		expect(screen.getByTestId("UpdateWalletName__input")).toHaveValue(currentName);

		unmount();
	});

	it("should validate account name", async () => {
		const { unmount } = render(
			<UpdateAccountName profile={profile} wallets={wallets} onAfterSave={vi.fn()} onCancel={vi.fn()} />,
		);

		const user = userEvent.setup();

		// Test with empty name (should be invalid)
		await user.clear(screen.getByTestId("UpdateWalletName__input"));

		await waitFor(() => {
			expect(screen.getByTestId("UpdateWalletName__input")).toBeInvalid();
		});

		expect(screen.getByTestId("UpdateWalletName__submit")).toBeDisabled();

		// Test with valid name
		await user.paste("Valid Name");

		await waitFor(() => {
			expect(screen.getByTestId("UpdateWalletName__input")).toBeValid();
		});

		expect(screen.getByTestId("UpdateWalletName__submit")).toBeEnabled();

		unmount();
	});

	it("should focus input on mount", () => {
		const { unmount } = render(
			<UpdateAccountName profile={profile} wallets={wallets} onAfterSave={vi.fn()} onCancel={vi.fn()} />,
		);

		expect(screen.getByTestId("UpdateWalletName__input")).toHaveFocus();

		unmount();
	});
});
