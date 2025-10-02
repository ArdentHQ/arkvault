import { FormProvider, useForm } from "react-hook-form";
import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import {
	env,
	getDefaultMainsailWalletMnemonic,
	getMainsailProfileId,
	MAINSAIL_MNEMONICS,
	render,
	renderResponsiveWithRoute,
	screen,
} from "@/utils/testing-library";

import { SelectAccountStep, MobileAccountRow, AccountRow } from "./SelectAccountStep";
import { Contracts } from "@/app/lib/profiles";
import React from "react";
import userEvent from "@testing-library/user-event";

const fixtureProfileId = getMainsailProfileId();
const route = `/profiles/${fixtureProfileId}/dashboard`;

const firstMnemonic = getDefaultMainsailWalletMnemonic();
const secondMnemonic = MAINSAIL_MNEMONICS[1];

const FormWrapper = ({ children, defaultValues = {} }: { children: React.ReactNode; defaultValues?: any }) => {
	const form = useForm({
		defaultValues,
		mode: "onChange",
	});

	form.register("selectedAccount");

	return <FormProvider {...form}>{children}</FormProvider>;
};

const addressRowRadioElements = () => screen.getAllByTestId("AccountRow--radio");

describe("SelectAccountStep", () => {
	let profile: Contracts.IProfile;
	let hdWallet1: Contracts.IReadWriteWallet;
	let hdWallet2: Contracts.IReadWriteWallet;
	let hdWallet3: Contracts.IReadWriteWallet;

	const createHDWallet = async (accountName: string, addressIndex: number, mnemonic: string, password?: string) => {
		const wallet = await profile.walletFactory().fromMnemonicWithBIP44({
			levels: { account: 0, addressIndex },
			mnemonic,
			password,
		});

		wallet.mutator().accountName(accountName);

		return wallet;
	};

	beforeEach(async () => {
		profile = env.profiles().findById(fixtureProfileId);

		// Clean up any existing wallets
		for (const wallet of profile.wallets().values()) {
			profile.wallets().forget(wallet.id());
		}

		// Create test HD wallets
		hdWallet1 = await createHDWallet("Test Account 1", 0, firstMnemonic);
		hdWallet2 = await createHDWallet("Test Account 1", 1, firstMnemonic);

		hdWallet3 = await createHDWallet("Test Account 2", 0, secondMnemonic, "password");

		profile.wallets().push(hdWallet1);
		profile.wallets().push(hdWallet2);
		profile.wallets().push(hdWallet3);
	});

	afterEach(() => {
		vi.restoreAllMocks();

		// Clean up
		for (const wallet of profile.wallets().values()) {
			profile.wallets().forget(wallet.id());
		}
	});

	it("should render select account step", () => {
		const { unmount } = render(
			<FormWrapper>
				<SelectAccountStep profile={profile} />
			</FormWrapper>,
			{ route },
		);

		expect(screen.getByTestId("SelectAccountStep")).toBeInTheDocument();

		expect(screen.getByText("Test Account 1")).toBeInTheDocument();
		expect(screen.getByText("Test Account 2")).toBeInTheDocument();

		expect(screen.getByText("Import New HD Wallet")).toBeInTheDocument();

		unmount();
	});

	it("should display correct address count for account", () => {
		const { unmount } = render(
			<FormWrapper>
				<SelectAccountStep profile={profile} />
			</FormWrapper>,
			{ route },
		);

		// Should show 2 Addresses for "Test Account 1"
		expect(screen.getByText("2 Addresses")).toBeInTheDocument();

		unmount();
	});

	it("should auto-select first account on mount", async () => {
		const { unmount } = render(
			<FormWrapper>
				<SelectAccountStep profile={profile} />
			</FormWrapper>,
			{ route },
		);

		const firstAccountRadio = addressRowRadioElements()[0];
		expect(firstAccountRadio).toBeChecked();

		unmount();
	});

	it("should keep the selected account if any selected", async () => {
		const { unmount } = render(
			<FormWrapper defaultValues={{selectedAccount: "Test Account 2"}}>
				<SelectAccountStep profile={profile} />
			</FormWrapper>,
			{ route },
		);

		const radioElements = addressRowRadioElements();

		expect(radioElements[0]).not.toBeChecked();
		expect(radioElements[1]).toBeChecked();

		unmount();
	});

	it("should handle account selection", async () => {
		const user = userEvent.setup();

		const { unmount } = render(
			<FormWrapper>
				<SelectAccountStep profile={profile} />
			</FormWrapper>,
			{ route },
		);

		expect(screen.getAllByTestId("AccountRow")).toHaveLength(2);

		const radios = addressRowRadioElements();

		// Initially Test Account 1 should be selected
		expect(radios[0]).toBeChecked();
		expect(radios[1]).not.toBeChecked();

		// Click on Test Account 2 (second radio)
		await user.click(radios[1]);

		// Test Account 2 should now be selected
		expect(radios[1]).toBeChecked();
		expect(radios[0]).not.toBeChecked();

		unmount();
	});

	it("should handle import new HD wallet selection", async () => {
		const user = userEvent.setup();

		const { unmount } = render(
			<FormWrapper>
				<SelectAccountStep profile={profile} />
			</FormWrapper>,
			{ route },
		);

		expect(screen.getAllByTestId("AccountRow")).toHaveLength(2); // 1 account + import new option

		// Find the "Import new HD wallet" option (should be the last radio button)
		const newWalletRow = screen.getByTestId("NewAccountRow--radio");
		await user.click(newWalletRow);

		const radios = addressRowRadioElements();

		expect(newWalletRow).toBeChecked();

		// First account should no longer be selected
		expect(radios[0]).not.toBeChecked();

		unmount();
	});

	it("should display mnemonic import method", () => {
		const { unmount } = render(
			<FormWrapper>
				<SelectAccountStep profile={profile} />
			</FormWrapper>,
			{ route },
		);

		expect(screen.getByText("Mnemonic")).toBeInTheDocument();

		unmount();
	});

	it("should handle empty wallet list", () => {
		// Remove all wallets
		for (const wallet of profile.wallets().values()) {
			profile.wallets().forget(wallet.id());
		}

		const { unmount } = render(
			<FormWrapper>
				<SelectAccountStep profile={profile} />
			</FormWrapper>,
			{ route },
		);

		expect(screen.getByTestId("SelectAccountStep")).toBeInTheDocument();
		expect(screen.getByText("Import New HD Wallet")).toBeInTheDocument();

		expect(screen.getByTestId("NewAccountRow--radio")).toBeInTheDocument();

		unmount();
	});
});

describe("AccountRow", () => {
	const defaultProps = {
		accountName: "Test Account",
		addressesCount: 3,
		importMethod: "mnemonic" as const,
		isSelected: false,
		onClick: vi.fn(),
	};

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should render account information", () => {
		const { unmount } = render(<AccountRow {...defaultProps} />, { route });

		expect(screen.getByText("Test Account")).toBeInTheDocument();
		expect(screen.getByText("Mnemonic")).toBeInTheDocument();
		expect(screen.getByText("3 Addresses")).toBeInTheDocument();

		unmount();
	});

	it("should handle click interaction", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();

		const { unmount } = render(<AccountRow {...defaultProps} onClick={onClick} />, { route });

		await user.click(screen.getByTestId("AccountRow"));

		expect(onClick).toHaveBeenCalled();

		unmount();
	});

	it("should show selected state correctly", () => {
		const { unmount } = render(<AccountRow {...defaultProps} isSelected={true} />, { route });

		const radio = screen.getByTestId("AccountRow--radio");
		expect(radio).toBeChecked();

		unmount();
	});

	it("should render mobile version on small screens", () => {
		const { unmount } = renderResponsiveWithRoute(<AccountRow {...defaultProps} />, "xs", { route });

		expect(screen.getByTestId("MobileAccountRow")).toBeInTheDocument();

		unmount();
	});

	it("should display encrypted password import method", () => {
		const { unmount } = render(<AccountRow {...defaultProps} importMethod="encryptedPassword" />, { route });

		expect(screen.getByText("Encrypted Password")).toBeInTheDocument();

		unmount();
	});
});

describe("MobileAccountRow", () => {
	const defaultProps = {
		accountName: "Mobile Test Account",
		addressesCount: 2,
		importMethod: "mnemonic" as const,
		isSelected: false,
		onClick: vi.fn(),
	};

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should render mobile account row", () => {
		const { unmount } = render(<MobileAccountRow {...defaultProps} />, { route });

		expect(screen.getByTestId("MobileAccountRow")).toBeInTheDocument();
		expect(screen.getByText("Mobile Test Account")).toBeInTheDocument();
		expect(screen.getByText("Mnemonic")).toBeInTheDocument();

		unmount();
	});

	it("should handle header click interaction", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();

		const { unmount } = render(<MobileAccountRow {...defaultProps} onClick={onClick} />, { route });

		await user.click(screen.getByTestId("MobileAccountRowHeader"));

		expect(onClick).toHaveBeenCalled();

		unmount();
	});

	it("should display encrypted password import method", () => {
		const { unmount } = render(<MobileAccountRow {...defaultProps} importMethod="encryptedPassword" />, { route });

		expect(screen.getByText("Encrypted Password")).toBeInTheDocument();

		unmount();
	});

	it("should show selected state correctly", () => {
		const { unmount } = render(<MobileAccountRow {...defaultProps} isSelected={true} />, { route });

		const radio = screen.getByTestId("AccountRow--radio");
		expect(radio).toBeChecked();

		unmount();
	});

	it("should display address count information", () => {
		const { unmount } = render(<MobileAccountRow {...defaultProps} />, { route });

		expect(screen.getByText("2 Addresses")).toBeInTheDocument();
		unmount();
	});
});
