import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import {
	env,
	getDefaultMainsailWalletMnemonic,
	getMainsailProfileId,
	render,
	screen,
	waitFor,
} from "@/utils/testing-library";
import { SelectAccountStep } from "./SelectAccountStep";
import { BIP44CoinType } from "@/app/lib/profiles/wallet.factory.contract";

const FormWrapper = ({ children, defaultValues = {} }: { children: React.ReactNode; defaultValues?: any }) => {
	const form = useForm({
		defaultValues: {
			...defaultValues,
		},
		mode: "onChange",
	});

	return <FormProvider {...form}>{children}</FormProvider>;
};

const createFormWrapperWithSpy = (spy: (...arguments_: any[]) => void) => {
	const FormWrapperWithSpy = ({ children }: { children: React.ReactNode }) => {
		const form = useForm({ mode: "onChange" });
		const originalSetValue = form.setValue;
		form.setValue = (...arguments_) => {
			spy(...arguments_);
			return originalSetValue(...arguments_);
		};
		return <FormProvider {...form}>{children}</FormProvider>;
	};
	return FormWrapperWithSpy;
};

describe("SelectAccountStep", () => {
	let profile: Contracts.IProfile;
	let wallet1: Contracts.IReadWriteWallet;
	let wallet2: Contracts.IReadWriteWallet;
	let wallet3: Contracts.IReadWriteWallet;
	const testAccountName = "Test HD Account";
	const testAccountName2 = "Test HD Account 2";

	const createHDWallet = async (accountName: string, addressIndex: number) => {
		const wallet = await profile.walletFactory().fromMnemonicWithBIP44({
			coin: BIP44CoinType.ARK,
			levels: { account: 0, addressIndex, change: 0 },
			mnemonic: getDefaultMainsailWalletMnemonic(),
		});
		wallet.mutator().accountName(accountName);
		return wallet;
	};

	beforeEach(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		// Clear existing wallets
		for (const wallet of profile.wallets().values()) {
			profile.wallets().forget(wallet.id());
		}

		// Create test HD wallets with different address indices to avoid duplicates
		wallet1 = await createHDWallet(testAccountName, 0);
		wallet2 = await createHDWallet(testAccountName, 1);
		wallet3 = await createHDWallet(testAccountName2, 2);

		profile.wallets().push(wallet1);
		profile.wallets().push(wallet2);
		profile.wallets().push(wallet3);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should render select account step", () => {
		const { unmount } = render(
			<FormWrapper>
				<SelectAccountStep profile={profile} />
			</FormWrapper>,
		);

		expect(screen.getByTestId("SelectAccountStep")).toBeInTheDocument();

		unmount();
	});

	it("should display all existing HD wallet accounts", () => {
		const { unmount } = render(
			<FormWrapper>
				<SelectAccountStep profile={profile} />
			</FormWrapper>,
		);

		expect(screen.getByText(testAccountName)).toBeInTheDocument();
		expect(screen.getByText(testAccountName2)).toBeInTheDocument();

		unmount();
	});

	it("should display address count for each account", () => {
		const { unmount } = render(
			<FormWrapper>
				<SelectAccountStep profile={profile} />
			</FormWrapper>,
		);

		expect(screen.getByText("2 Addresses")).toBeInTheDocument();
		expect(screen.getByText("1 Address")).toBeInTheDocument();

		unmount();
	});

	it("should display 'Mnemonic' label for non-encrypted wallets", () => {
		const { unmount } = render(
			<FormWrapper>
				<SelectAccountStep profile={profile} />
			</FormWrapper>,
		);

		expect(screen.getAllByText(commonTranslations.MNEMONIC)).toHaveLength(2);

		unmount();
	});

	it("should display 'Encrypted Password' label for encrypted wallets", async () => {
		await wallet1.signingKey().set(getDefaultMainsailWalletMnemonic(), "password123");

		const { unmount } = render(
			<FormWrapper>
				<SelectAccountStep profile={profile} />
			</FormWrapper>,
		);

		expect(screen.getByText("Encrypted Password")).toBeInTheDocument();

		unmount();
	});

	it("should display 'Import New HD Wallet' option", () => {
		const { unmount } = render(
			<FormWrapper>
				<SelectAccountStep profile={profile} />
			</FormWrapper>,
		);

		expect(screen.getByText("Import New HD Wallet")).toBeInTheDocument();

		unmount();
	});

	it("should display divider with 'or' text when HD wallets exist", () => {
		const { unmount } = render(
			<FormWrapper>
				<SelectAccountStep profile={profile} />
			</FormWrapper>,
		);

		expect(screen.getByText("Or")).toBeInTheDocument();

		unmount();
	});

	it("should not display divider when no HD wallets exist", () => {
		for (const wallet of profile.wallets().values()) {
			profile.wallets().forget(wallet.id());
		}

		const { unmount } = render(
			<FormWrapper>
				<SelectAccountStep profile={profile} />
			</FormWrapper>,
		);

		expect(screen.queryByText("Or")).not.toBeInTheDocument();

		unmount();
	});

	it("should select an existing HD wallet account", async () => {
		const user = userEvent.setup();

		const { unmount } = render(
			<FormWrapper>
				<SelectAccountStep profile={profile} />
			</FormWrapper>,
		);

		const accountCard = screen.getByTestId(`SelectAccountStep__option-${testAccountName}`);
		await user.click(accountCard);

		await waitFor(() => {
			const radioButton = screen.getAllByTestId("SelectAccountStep__option-radio")[0];
			expect(radioButton).toBeChecked();
		});

		unmount();
	});

	it("should set empty mnemonic for encrypted wallet", async () => {
		const user = userEvent.setup();
		await wallet1.signingKey().set(getDefaultMainsailWalletMnemonic(), "password123");

		const setValueSpy = vi.fn();
		const FormWrapperWithSpy = createFormWrapperWithSpy(setValueSpy);

		const { unmount } = render(
			<FormWrapperWithSpy>
				<SelectAccountStep profile={profile} />
			</FormWrapperWithSpy>,
		);

		const accountCard = screen.getByTestId(`SelectAccountStep__option-${testAccountName}`);
		await user.click(accountCard);

		await waitFor(() => {
			expect(setValueSpy).toHaveBeenCalledWith("mnemonic", "");
		});

		unmount();
	});

	it("should select 'Import New HD Wallet' option", async () => {
		const user = userEvent.setup();

		const { unmount } = render(
			<FormWrapper>
				<SelectAccountStep profile={profile} />
			</FormWrapper>,
		);

		const importNewCard = screen.getByTestId("SelectAccountStep__import-new");
		await user.click(importNewCard);

		await waitFor(() => {
			const radioButton = screen.getByTestId("SelectAccountStep__import-new-radio");
			expect(radioButton).toBeChecked();
		});

		unmount();
	});

	it("should set form values when selecting 'Import New HD Wallet'", async () => {
		const user = userEvent.setup();
		const setValueSpy = vi.fn();
		const FormWrapperWithSpy = createFormWrapperWithSpy(setValueSpy);

		const { unmount } = render(
			<FormWrapperWithSpy>
				<SelectAccountStep profile={profile} />
			</FormWrapperWithSpy>,
		);

		const importNewCard = screen.getByTestId("SelectAccountStep__import-new");
		await user.click(importNewCard);

		await waitFor(() => {
			expect(setValueSpy).toHaveBeenCalledWith("selectedAccountName", "new", {
				shouldDirty: true,
				shouldValidate: true,
			});
		});
		await waitFor(() => {
			expect(setValueSpy).toHaveBeenCalledWith("mnemonic", "");
		});
		await waitFor(() => {
			expect(setValueSpy).toHaveBeenCalledWith("isExistingHDWallet", false);
		});

		unmount();
	});

	it("should switch selection between accounts", async () => {
		const user = userEvent.setup();

		const { unmount } = render(
			<FormWrapper>
				<SelectAccountStep profile={profile} />
			</FormWrapper>,
		);

		const firstAccountCard = screen.getByTestId(`SelectAccountStep__option-${testAccountName}`);
		await user.click(firstAccountCard);

		await waitFor(() => {
			const radioButtons = screen.getAllByTestId("SelectAccountStep__option-radio");
			expect(radioButtons[0]).toBeChecked();
		});

		const secondAccountCard = screen.getByTestId(`SelectAccountStep__option-${testAccountName2}`);
		await user.click(secondAccountCard);

		const radioButtons = screen.getAllByTestId("SelectAccountStep__option-radio");
		await waitFor(() => {
			expect(radioButtons[0]).not.toBeChecked();
		});
		await waitFor(() => {
			expect(radioButtons[1]).toBeChecked();
		});

		unmount();
	});

	it("should register form fields on mount", () => {
		const registerSpy = vi.fn();

		const FormWrapperWithSpy = ({ children }: { children: React.ReactNode }) => {
			const form = useForm({ mode: "onChange" });
			const originalRegister = form.register;
			form.register = (...arguments_) => {
				registerSpy(...arguments_);
				return originalRegister(...arguments_);
			};
			return <FormProvider {...form}>{children}</FormProvider>;
		};

		const { unmount } = render(
			<FormWrapperWithSpy>
				<SelectAccountStep profile={profile} />
			</FormWrapperWithSpy>,
		);

		expect(registerSpy).toHaveBeenCalledWith("selectedAccountName", { required: true });
		expect(registerSpy).toHaveBeenCalledWith("isExistingHDWallet");

		unmount();
	});

	it("should unregister form fields on unmount", () => {
		const unregisterSpy = vi.fn();

		const FormWrapperWithSpy = ({ children }: { children: React.ReactNode }) => {
			const form = useForm({ mode: "onChange" });
			const originalUnregister = form.unregister;
			form.unregister = (...arguments_) => {
				unregisterSpy(...arguments_);
				return originalUnregister(...arguments_);
			};
			return <FormProvider {...form}>{children}</FormProvider>;
		};

		const { unmount } = render(
			<FormWrapperWithSpy>
				<SelectAccountStep profile={profile} />
			</FormWrapperWithSpy>,
		);

		unmount();

		expect(unregisterSpy).toHaveBeenCalledWith(["selectedAccountName", "isExistingHDWallet"]);
	});

	it("should group wallets by account name correctly", () => {
		const { unmount } = render(
			<FormWrapper>
				<SelectAccountStep profile={profile} />
			</FormWrapper>,
		);

		expect(screen.getByTestId(`SelectAccountStep__option-${testAccountName}`)).toBeInTheDocument();
		expect(screen.getByTestId(`SelectAccountStep__option-${testAccountName2}`)).toBeInTheDocument();

		unmount();
	});

	it("should handle accounts with empty names", async () => {
		const walletWithoutName = await createHDWallet("", 3);
		profile.wallets().push(walletWithoutName);

		const { unmount } = render(
			<FormWrapper>
				<SelectAccountStep profile={profile} />
			</FormWrapper>,
		);

		expect(screen.getByTestId("SelectAccountStep__option-")).toBeInTheDocument();

		unmount();
	});
});
