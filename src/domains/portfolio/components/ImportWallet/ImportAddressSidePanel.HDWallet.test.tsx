import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import userEvent from "@testing-library/user-event";
import { ImportAddressesSidePanel } from "./ImportAddressSidePanel";
import {
	env,
	render,
	screen,
	waitFor,
	getMainsailProfileId,
	getDefaultMainsailWalletMnemonic,
} from "@/utils/testing-library";
import { Contracts } from "@/app/lib/profiles";
import { ProfileSetting } from "@/app/lib/profiles/profile.enum.contract";

const fixtureProfileId = getMainsailProfileId();
const route = `/profiles/${fixtureProfileId}/dashboard`;

const mnemonic = getDefaultMainsailWalletMnemonic();

// Test helper selectors
const getMnemonicInput = () => screen.getByTestId("ImportWallet__mnemonic-input");
const getContinueButton = () => screen.getByTestId("ImportWallet__continue-button");
const getBackButton = () => screen.getByTestId("ImportWallet__back-button");
const getAddressCheckboxes = () => screen.getAllByTestId("SelectAddressStep__checkbox-row");

describe("ImportAddressesSidePanel - HD Wallet Flow", () => {
	let profile: Contracts.IProfile;
	const onOpenChange = vi.fn();

	beforeEach(async () => {
		profile = env.profiles().findById(fixtureProfileId);
		profile.settings().set(ProfileSetting.UseHDWallets, true);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	const Component = ({ open = true }: { open?: boolean } = {}) => (
		<ImportAddressesSidePanel open={open} onOpenChange={onOpenChange} />
	);

	it("should render method step and allow HD wallet selection", async () => {
		const user = userEvent.setup();

		render(<Component />, { route });

		expect(screen.getByTestId("ImportWallet__method-step")).toBeInTheDocument();

		// Select HD Wallet (BIP44) option
		const hdWalletOption = screen.getByText("HD Wallet");
		await user.click(hdWalletOption);

		expect(screen.getByTestId("HDWalletTabs--child")).toBeInTheDocument();
	});

	it("should show Enter Mnemonic step when there are no imported HD Wallets", async () => {
		const user = userEvent.setup();

		render(<Component />, { route });

		// Navigate to HD wallet import
		await user.click(screen.getByText("HD Wallet"));

		expect(screen.getByTestId("ImportWallet__detail-step")).toBeInTheDocument();
	});

	it("should show Select Account step when there are imported HD Wallets", async () => {
		const wallet = await profile.walletFactory().fromMnemonicWithBIP44({
			levels: { account: 0 },
			mnemonic,
		});

		profile.wallets().push(wallet);

		const user = userEvent.setup();

		render(<Component />, { route });

		await user.click(screen.getByText("HD Wallet"));

		expect(screen.getByTestId("SelectAccountStep")).toBeInTheDocument();

		expect(screen.getAllByTestId("AccountRow--radio").length).toBeGreaterThan(0);

		profile.wallets().forget(wallet.id());
	});

	it("should handle HD wallet step navigation", async () => {
		const user = userEvent.setup();

		render(<Component />, { route });

		// Select HD Wallet option
		await user.click(screen.getByText("HD Wallet"));

		// Should start with enter mnemonic step
		expect(screen.getByTestId("ImportWallet__detail-step")).toBeInTheDocument();

		// Enter mnemonic
		await user.clear(getMnemonicInput());
		await user.paste(mnemonic);

		// Continue to next step
		await waitFor(() => expect(getContinueButton()).toBeEnabled());
		await user.click(getContinueButton());

		// Should navigate to address selection step
		await waitFor(() => {
			expect(screen.getByTestId("SelectAddressStep")).toBeInTheDocument();
		});
	});

	it("should handle HD wallet with encryption", async () => {
		const user = userEvent.setup();

		render(<Component />, { route });

		// Navigate to HD wallet import
		await user.click(screen.getByText("HD Wallet"));

		// Enter mnemonic
		await user.clear(getMnemonicInput());
		await user.paste(mnemonic);

		// Enable encryption
		const encryptionCheckbox = screen.getByTestId("WalletEncryptionBanner__encryption-toggle");
		await user.click(encryptionCheckbox);

		// Accept responsibility
		const responsibilityCheckbox = screen.getByTestId("WalletEncryptionBanner__checkbox");
		await user.click(responsibilityCheckbox);

		// Continue to encryption step
		await waitFor(() => expect(getContinueButton()).toBeEnabled());
		await user.click(getContinueButton());

		// Should show encryption password step
		await waitFor(() => {
			expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
		});
	});

	it("should handle address selection in HD wallet flow", async () => {
		const user = userEvent.setup();

		render(<Component />, { route });

		// Navigate to HD wallet import
		await user.click(screen.getByText("HD Wallet"));

		// Enter mnemonic and proceed to address selection
		await user.clear(getMnemonicInput());
		await user.paste(mnemonic);

		await waitFor(() => expect(getContinueButton()).toBeEnabled());
		await user.click(getContinueButton());

		// Should show address selection
		await waitFor(() => {
			expect(screen.getByTestId("SelectAddressStep")).toBeInTheDocument();
		});

		// Should show address selection interface
		await waitFor(() => {
			expect(screen.getAllByText("Address")[0]).toBeInTheDocument();
		});

		// Select an address
		const addressCheckbox = getAddressCheckboxes()[0];
		await user.click(addressCheckbox);

		const continueButton = getContinueButton();
		await waitFor(() => expect(continueButton).toBeEnabled());
		await user.click(continueButton);

		// Should proceed to summary step
		await waitFor(() => {
			expect(screen.getByTestId("SummaryStep")).toBeInTheDocument();
		});

		// remove imported HD Wallets
		for (const wallet of profile.wallets().values()) {
			if (wallet.isHDWallet()) {
				profile.wallets().forget(wallet.id());
			}
		}
	});

	it("should handle back navigation in HD wallet flow", async () => {
		const user = userEvent.setup();

		render(<Component />, { route });

		// Navigate to HD wallet import
		await user.click(screen.getByText("HD Wallet"));

		// Enter mnemonic and go to next step
		await user.clear(getMnemonicInput());
		await user.paste(mnemonic);

		const continueButton = getContinueButton();
		await user.click(continueButton);

		await user.click(getBackButton());

		// Should return to method selection
		await waitFor(() => {
			expect(screen.getByTestId("ImportWallet__detail-step")).toBeInTheDocument();
		});
	});

	it("should handle cancel in HD wallet flow", async () => {
		const user = userEvent.setup();

		render(<Component />, { route });

		// Navigate to HD wallet import
		await user.click(screen.getByText("HD Wallet"));

		// Close the panel
		const closeButton = screen.getByTestId("SidePanel__close-button");
		await user.click(closeButton);

		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it("should validate mnemonic input in HD wallet flow", async () => {
		const user = userEvent.setup();

		render(<Component />, { route });

		// Navigate to HD wallet import
		await user.click(screen.getByText("HD Wallet"));

		// Try to continue without entering mnemonic
		expect(getContinueButton()).toBeDisabled();

		// Enter invalid mnemonic
		await user.clear(getMnemonicInput());
		await user.paste("invalid mnemonic");

		// Button should still be disabled
		await waitFor(() => {
			expect(getContinueButton()).toBeDisabled();
		});

		// Enter valid mnemonic
		await user.clear(getMnemonicInput());
		await user.paste(mnemonic);

		// Button should be enabled
		await waitFor(() => {
			expect(getContinueButton()).toBeEnabled();
		});
	});

	it("should prevent already imported mnemonic when importing a new HD wallet", async () => {
		const wallet = await profile.walletFactory().fromMnemonicWithBIP44({
			levels: { account: 0 },
			mnemonic,
		});

		profile.wallets().push(wallet);

		const user = userEvent.setup();

		render(<Component />, { route });

		// Navigate to HD wallet import
		await user.click(screen.getByText("HD Wallet"));

		// Select account step should be visible
		expect(screen.getByTestId("SelectAccountStep")).toBeInTheDocument();

		const radios = screen.getAllByTestId("AccountRow--radio");
		expect(radios.length).toBeGreaterThan(0);

		// Select import new HD wallet
		await user.click(radios[1]);

		await user.click(getContinueButton());

		// Enter already imported mnemonic
		await user.clear(getMnemonicInput());
		await user.paste(mnemonic);

		// Continue button should be disabled
		expect(getContinueButton()).toBeDisabled();

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toHaveAttribute(
				"data-errortext",
				"This value is already imported."
			);
		});

		profile.wallets().forget(wallet.id());
	});

	it("should import addresses for existing HD Wallet - mnemonic", async () => {
		const wallet = await profile.walletFactory().fromMnemonicWithBIP44({
			levels: { account: 0 },
			mnemonic,
		});

		wallet.mutator().accountName("Test Account");

		profile.wallets().push(wallet);

		const user = userEvent.setup();

		render(<Component />, { route });

		// Navigate to HD wallet import
		await user.click(screen.getByText("HD Wallet"));

		// Select account step should be visible
		expect(screen.getByTestId("SelectAccountStep")).toBeInTheDocument();

		const radios = screen.getAllByTestId("AccountRow--radio");
		expect(radios.length).toBeGreaterThan(0);

		// Select import existing wallet
		await user.click(radios[0]);

		await user.click(getContinueButton());

		await expect(screen.findByTestId("EnterImportValueStep")).resolves.toBeVisible();

		// Enter already imported mnemonic
		await user.clear(screen.getByTestId("InputPassword"));
		await user.paste(mnemonic);

		// Continue button should be enabled
		await waitFor(() => {
			expect(getContinueButton()).toBeEnabled();
		});

		await user.click(getContinueButton());

		await expect(screen.findByTestId("SelectAddressStep")).resolves.toBeVisible();

		await user.click(screen.getByTestId("SelectAddressStep__load-more"));

		const addressCheckboxes = getAddressCheckboxes();

		// First address checkbox should be disabled as it is already imported
		expect(addressCheckboxes[0]).toBeDisabled();

		await user.click(addressCheckboxes[1]);

		await waitFor(() => {
			expect(getContinueButton()).toBeEnabled();
		});

		await user.click(getContinueButton());

		await waitFor(() => {
			expect(screen.getByTestId("SummaryStep")).toBeInTheDocument();
		});

		for (const wallet of profile.wallets().values()) {
			if (wallet.isHDWallet()) {
				profile.wallets().forget(wallet.id());
			}
		}
	});

	it("should import addresses for existing HD Wallet - encrypted password", async () => {
		const wallet = await profile.walletFactory().fromMnemonicWithBIP44({
			levels: { account: 0 },
			mnemonic,
			password: "password",
		});

		wallet.mutator().accountName("Encrypted Account");

		profile.wallets().push(wallet);

		const user = userEvent.setup();

		render(<Component />, { route });

		// Navigate to HD wallet import
		await user.click(screen.getByText("HD Wallet"));

		// Select account step should be visible
		expect(screen.getByTestId("SelectAccountStep")).toBeInTheDocument();

		const account = screen.getByText("Encrypted Account");

		// Select import existing wallet
		await user.click(account);

		await user.click(getContinueButton());

		await expect(screen.findByTestId("EnterImportValueStep")).resolves.toBeVisible();

		// Enter already imported mnemonic
		await user.clear(screen.getByTestId("InputPassword"));
		await user.paste("password");

		// Continue button should be enabled
		await waitFor(() => {
			expect(getContinueButton()).toBeEnabled();
		});

		await user.click(getContinueButton());

		await expect(screen.findByTestId("SelectAddressStep")).resolves.toBeVisible();

		await expect(screen.findByTestId("SelectAddressStep__load-more")).resolves.toBeVisible();

		await user.click(screen.getByTestId("SelectAddressStep__load-more"));

		const addressCheckboxes = getAddressCheckboxes();

		await waitFor(() => {
			expect(addressCheckboxes.length).toBe(6);
		});

		// First address checkbox should be disabled as it is already imported
		expect(addressCheckboxes[0]).toBeDisabled();

		await user.click(addressCheckboxes[1]);

		await waitFor(() => {
			expect(getContinueButton()).toBeEnabled();
		});

		await user.click(getContinueButton());

		await waitFor(() => {
			expect(screen.getByTestId("SummaryStep")).toBeInTheDocument();
		});

		for (const wallet of profile.wallets().values()) {
			if (wallet.isHDWallet()) {
				profile.wallets().forget(wallet.id());
			}
		}
	});

	it("should handle keyboard navigation in HD wallet flow", async () => {
		const user = userEvent.setup();

		render(<Component />, { route });

		// Navigate to HD wallet import
		await user.click(screen.getByText("HD Wallet"));

		// Enter mnemonic
		await user.clear(getMnemonicInput());
		await user.paste(mnemonic);

		// Press Enter to continue
		await user.keyboard("{Enter}");

		// Should navigate to next step
		await waitFor(() => {
			expect(screen.getByTestId("SelectAddressStep")).toBeInTheDocument();
		});
	});

	it("should successfully import multiple selected addresses in order", async () => {
		const user = userEvent.setup();

		render(<Component />, { route });

		await user.click(screen.getByText("HD Wallet"));

		await user.clear(getMnemonicInput());
		await user.paste(mnemonic);

		await user.click(getContinueButton());

		// Wait for address selection step
		await waitFor(() => {
			expect(screen.getByTestId("SelectAddressStep")).toBeInTheDocument();
		});

		await user.click(screen.getByTestId("SelectAddressStep__load-more"));

		await waitFor(() => {
			expect(getAddressCheckboxes().length).toBe(6);
		});

		const addressRows = screen.getAllByTestId("Address__address");
		const firstAddress = addressRows[0].textContent;
		const secondAddress = addressRows[1].textContent;

		const addressCheckboxes = getAddressCheckboxes();
		await user.click(addressCheckboxes[1]);
		await user.click(addressCheckboxes[0]);

		await waitFor(() => {
			expect(getContinueButton()).toBeEnabled();
		});

		await user.click(getContinueButton());

		await waitFor(() => {
			expect(screen.getByTestId("SummaryStep")).toBeInTheDocument();
		});

		const summaryAddressRows = screen.getAllByTestId("Address__address");
		const summaryFirstAddress = summaryAddressRows[0].textContent;
		const summarySecondAddress = summaryAddressRows[1].textContent;

		// eslint-disable-next-line unicorn/consistent-function-scoping
		const getAddressPrefix = (address: string | null) => address?.split("...")[0] || "";

		// The summary should show the first selected address first (lower addressIndex)
		// even though we clicked them in reverse order (1 then 0)
		expect(getAddressPrefix(summaryFirstAddress)).toBe(getAddressPrefix(firstAddress)); // Address from index 0
		expect(getAddressPrefix(summarySecondAddress)).toBe(getAddressPrefix(secondAddress)); // Address from index 1
	});
});
