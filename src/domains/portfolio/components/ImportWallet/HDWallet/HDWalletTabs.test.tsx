import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import userEvent from "@testing-library/user-event";
import { env, render, screen, getMainsailProfileId, getDefaultMainsailWalletMnemonic } from "@/utils/testing-library";
import { Contracts } from "@/app/lib/profiles";
import { HDWalletTabs } from "./HDWalletTabs";

const fixtureProfileId = getMainsailProfileId();
const route = `/profiles/${fixtureProfileId}/dashboard`;
const mnemonic = getDefaultMainsailWalletMnemonic();

const FormWrapper = ({ children }: { children: React.ReactNode }) => {
	const form = useForm({ mode: "onChange" });
	return <FormProvider {...form}>{children}</FormProvider>;
};

describe("HDWalletTabs", () => {
	let profile: Contracts.IProfile;

	beforeEach(() => {
		profile = env.profiles().findById(fixtureProfileId);
		for (const wallet of profile.wallets().values()) {
			profile.wallets().forget(wallet.id());
		}
	});

	afterEach(() => {
		vi.restoreAllMocks();
		for (const wallet of profile.wallets().values()) {
			profile.wallets().forget(wallet.id());
		}
	});

	it("should call onCancel when pressing back on SelectAccountStep without onBack prop", async () => {
		const hdWallet = await profile.walletFactory().fromMnemonicWithBIP44({
			levels: { account: 0 },
			mnemonic,
		});
		profile.wallets().push(hdWallet);

		const onCancel = vi.fn();
		const user = userEvent.setup();

		render(
			<FormWrapper>
				<HDWalletTabs mnemonic={mnemonic} onClickEditWalletName={vi.fn()} onCancel={onCancel} />
			</FormWrapper>,
			{ route },
		);

		expect(screen.getByTestId("SelectAccountStep")).toBeInTheDocument();

		await user.click(screen.getByTestId("ImportWallet__back-button"));

		expect(onCancel).toHaveBeenCalledTimes(1);
	});
});
