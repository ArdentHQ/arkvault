import { Contracts } from "@/app/lib/profiles";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";

import { ConfirmPassphraseStep } from "./ConfirmPassphraseStep";
import { env, getMainsailProfileId, MAINSAIL_MNEMONICS, render, screen } from "@/utils/testing-library";

let profile: Contracts.IProfile;

describe("ConfirmPassphraseStep", () => {
	beforeEach(() => {
		profile = env.profiles().findById(getMainsailProfileId());

		for (const wallet of profile.wallets().values()) {
			profile.wallets().forget(wallet.id());
		}
	});

	it("should render 3rd step", () => {
		const { result: form } = renderHook(() => useForm());

		render(
			<FormProvider {...form.current}>
				<ConfirmPassphraseStep mnemonic={MAINSAIL_MNEMONICS[0]} />
			</FormProvider>,
		);

		// This is to silence `act` warning due to `register` call
		// https://github.com/testing-library/react-testing-library/issues/1051#issuecomment-1111625962
		act(async () => {
			await new Promise((resolve) => {
				setTimeout(resolve);
			});
		});

		expect(screen.getByTestId("CreateWallet__ConfirmPassphraseStep")).toBeInTheDocument();
		expect(screen.getAllByTestId("MnemonicVerificationInput__input")).toHaveLength(3);
	});
});
