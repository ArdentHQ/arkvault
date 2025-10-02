import { FormProvider, useForm } from "react-hook-form";
import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import {
	env,
	getDefaultMainsailWalletMnemonic,
	getMainsailProfileId,
	MAINSAIL_MNEMONICS,
	render,
	screen,
} from "@/utils/testing-library";

import { EnterImportValueStep } from "./EnterImportValueStep";
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

describe("EnterImportValueStep", () => {
	let profile: Contracts.IProfile;
	let mnemonicWallet: Contracts.IReadWriteWallet;
	let encryptedPasswordWallet: Contracts.IReadWriteWallet;

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
		mnemonicWallet = await createHDWallet("Mnemonic Account", 0, firstMnemonic);
		encryptedPasswordWallet = await createHDWallet("Encrypted Account", 0, secondMnemonic, "password");

		profile.wallets().push(mnemonicWallet);
		profile.wallets().push(encryptedPasswordWallet);
	});

	afterEach(() => {
		vi.restoreAllMocks();

		// Clean up
		for (const wallet of profile.wallets().values()) {
			profile.wallets().forget(wallet.id());
		}
	});

	it("should render enter import value step", () => {
		const { unmount } = render(
			<FormWrapper defaultValues={{ selectedAccount: "Mnemonic Account" }}>
				<EnterImportValueStep profile={profile} />
			</FormWrapper>,
			{ route },
		);

		expect(screen.getByTestId("EnterImportValueStep")).toBeInTheDocument();

		unmount();
	});

	it("should display mnemonic input for mnemonic import method", () => {
		const { unmount } = render(
			<FormWrapper defaultValues={{ selectedAccount: "Mnemonic Account" }}>
				<EnterImportValueStep profile={profile} />
			</FormWrapper>,
			{ route },
		);

		expect(screen.getByText("Mnemonic")).toBeInTheDocument();

		unmount();
	});

	it("should display encrypted password input for encrypted password import method", () => {
		const { unmount } = render(
			<FormWrapper defaultValues={{ selectedAccount: "Encrypted Account" }}>
				<EnterImportValueStep profile={profile} />
			</FormWrapper>,
			{ route },
		);

		expect(screen.getByText("Encrypted Password")).toBeInTheDocument();

		unmount();
	});
});
