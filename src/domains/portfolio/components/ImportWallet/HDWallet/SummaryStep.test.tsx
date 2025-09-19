import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Networks } from "@/app/lib/mainsail";

import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import {
	env,
	getDefaultMainsailWalletMnemonic,
	getMainsailProfileId,
	render,
	screen,
	waitFor,
} from "@/utils/testing-library";
import { SummaryStep } from "./SummaryStep";
import { AddressData } from "./HDWalletsTabs.contracts";
import { BIP44CoinType } from "@/app/lib/profiles/wallet.factory.contract";

describe("SummaryStep", () => {
	let profile: Contracts.IProfile;
	let network: Networks.Network;
	let walletData: AddressData[];

	const testAccountName = "Test HD Account";

	const createWallet = async (addressIndex: number) => profile.walletFactory().fromMnemonicWithBIP44({
			coin: BIP44CoinType.ARK,
			levels: { account: 0, addressIndex, change: 0 },
			mnemonic: getDefaultMainsailWalletMnemonic(),
		});

	const setupWallets = async () => {
		const wallet1 = await createWallet(0);
		const wallet2 = await createWallet(1);

		wallet1.mutator().accountName(testAccountName);
		wallet2.mutator().accountName(testAccountName);

		profile.wallets().push(wallet1);
		profile.wallets().push(wallet2);

		return [
			{
				address: wallet1.address(),
				balance: 100,
				levels: { account: 0, addressIndex: 0, change: 0 },
				path: "m/44'/111'/0'/0/0",
			},
			{
				address: wallet2.address(),
				balance: 200,
				levels: { account: 0, addressIndex: 1, change: 0 },
				path: "m/44'/111'/0'/0/1",
			},
		];
	};

	beforeEach(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		network = profile.activeNetwork();

		// Clear existing wallets
		for (const wallet of profile.wallets().values()) {
			profile.wallets().forget(wallet.id());
		}

		walletData = await setupWallets();
	});

	it("should render summary step with account details", () => {
		const { unmount } = render(
			<SummaryStep network={network} wallets={walletData} profile={profile} onClickEditWalletName={vi.fn()} />,
		);

		expect(screen.getByTestId("SummaryStep")).toBeInTheDocument();
		expect(screen.getByText(testAccountName)).toBeInTheDocument();

		unmount();
	});

	it("should show multiple import component when more than one wallet", () => {
		const { unmount } = render(
			<SummaryStep network={network} wallets={walletData} profile={profile} onClickEditWalletName={vi.fn()} />,
		);

		// Verify MultipleImport specific elements are present
		expect(screen.getByText(walletData[0].address)).toBeInTheDocument();
		expect(screen.getByText(walletData[1].address)).toBeInTheDocument();

		// Should show multiple wallet addresses
		const addressElements = screen.getAllByTestId("Address__address");
		expect(addressElements).toHaveLength(2);

		unmount();
	});

	it("should show single import component when only one wallet", () => {
		const singleWallet = [walletData[0]];

		const { unmount } = render(
			<SummaryStep network={network} wallets={singleWallet} profile={profile} onClickEditWalletName={vi.fn()} />,
		);

		// Should show SingleImport component for single wallet
		expect(singleWallet.length).toBe(1);

		// Verify only one wallet address is shown
		expect(screen.getByText(singleWallet[0].address)).toBeInTheDocument();

		// Should show only one address element
		const addressElements = screen.getAllByTestId("Address__address");
		expect(addressElements).toHaveLength(1);

		unmount();
	});

	it("should show edit account name form when edit button is clicked", async () => {
		const user = userEvent.setup();

		const { unmount } = render(
			<SummaryStep network={network} wallets={walletData} profile={profile} onClickEditWalletName={vi.fn()} />,
		);

		// Initially, edit form should not be visible
		expect(screen.queryByTestId("UpdateWalletName__input")).not.toBeInTheDocument();

		// Click edit button
		const editButton = screen.getByTestId("UpdateAccountName");
		await user.click(editButton);

		// Edit form should now be visible
		await waitFor(() => {
			expect(screen.getByTestId("UpdateWalletName__input")).toBeInTheDocument();
		});

		unmount();
	});

	it("should hide edit form when save is clicked", async () => {
		const user = userEvent.setup();

		const { unmount } = render(
			<SummaryStep network={network} wallets={walletData} profile={profile} onClickEditWalletName={vi.fn()} />,
		);

		// Click edit button to show form
		const editButton = screen.getByText(commonTranslations.EDIT);
		await user.click(editButton);

		await waitFor(() => {
			expect(screen.getByTestId("UpdateWalletName__input")).toBeInTheDocument();
		});

		// Enter a new name
		const input = screen.getByTestId("UpdateWalletName__input");
		await user.clear(input);
		await user.paste("New Account Name");

		// Click save
		const saveButton = screen.getByTestId("UpdateWalletName__submit");
		await user.click(saveButton);

		// Form should be hidden
		await waitFor(() => {
			expect(screen.queryByTestId("UpdateWalletName__input")).not.toBeInTheDocument();
		});

		unmount();
	});

	it("should hide edit form when cancel is clicked", async () => {
		const user = userEvent.setup();

		const { unmount } = render(
			<SummaryStep network={network} wallets={walletData} profile={profile} onClickEditWalletName={vi.fn()} />,
		);

		// Click edit button to show form
		const editButton = screen.getByText(commonTranslations.EDIT);
		await user.click(editButton);

		await waitFor(() => {
			expect(screen.getByTestId("UpdateWalletName__input")).toBeInTheDocument();
		});

		// Click cancel
		const cancelButton = screen.getByTestId("UpdateWalletName__cancel");
		await user.click(cancelButton);

		// Form should be hidden
		await waitFor(() => {
			expect(screen.queryByTestId("UpdateWalletName__input")).not.toBeInTheDocument();
		});

		unmount();
	});

	it("should disable edit button when edit form is shown", async () => {
		const user = userEvent.setup();

		const { unmount } = render(
			<SummaryStep network={network} wallets={walletData} profile={profile} onClickEditWalletName={vi.fn()} />,
		);

		const editButton = screen.getByTestId("UpdateAccountName");

		// Initially edit button should be enabled
		expect(editButton).toBeEnabled();

		// Click edit button
		await user.click(editButton);

		// Edit button should now be disabled
		await waitFor(() => {
			expect(screen.getByTestId("UpdateAccountName")).toBeDisabled();
		});

		unmount();
	});

	it("should display current account name from first wallet", () => {
		const { unmount } = render(
			<SummaryStep network={network} wallets={walletData} profile={profile} onClickEditWalletName={vi.fn()} />,
		);

		// Should display account name from first imported wallet
		expect(screen.getByText(testAccountName)).toBeInTheDocument();

		unmount();
	});

	it("should update account name display after editing", async () => {
		const user = userEvent.setup();

		const { unmount } = render(
			<SummaryStep network={network} wallets={walletData} profile={profile} onClickEditWalletName={vi.fn()} />,
		);

		// Initial account name
		expect(screen.getByText(testAccountName)).toBeInTheDocument();

		// Click edit button
		const editButton = screen.getByTestId("UpdateAccountName");
		await user.click(editButton);

		// Change account name
		const input = screen.getByTestId("UpdateWalletName__input");
		await user.clear(input);
		await user.paste("Updated Account Name");

		// Save changes
		const saveButton = screen.getByTestId("UpdateWalletName__submit");
		await user.click(saveButton);

		// Updated name should be displayed
		await waitFor(() => {
			expect(screen.getByText("Updated Account Name")).toBeInTheDocument();
		});

		unmount();
	});
});
