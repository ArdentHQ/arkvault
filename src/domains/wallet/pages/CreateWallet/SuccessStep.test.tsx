/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";

import { SuccessStep } from "./SuccessStep";
import { env, getDefaultProfileId, renderResponsive, screen } from "@/utils/testing-library";

describe("SuccessStep", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());

		wallet = profile.wallets().first();
	});

	it.each(["xs", "lg"])("should render (%s)", async (breakpoint) => {
		const { result: form } = renderHook(() =>
			useForm({
				defaultValues: {
					network: wallet.network(),
					wallet,
				},
			}),
		);

		const onClickEditAlias = vi.fn();

		const { asFragment } = renderResponsive(
			<FormProvider {...form.current}>
				<SuccessStep onClickEditAlias={onClickEditAlias} />
			</FormProvider>,
			breakpoint,
		);

		expect(screen.getByTestId("CreateWallet__SuccessStep")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		expect(screen.getAllByText("ARK Devnet")[0]).toBeInTheDocument();
		expect(screen.getAllByText(wallet.address())[0]).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("CreateWallet__edit-alias"));

		expect(onClickEditAlias).toHaveBeenCalledTimes(1);
	});
});
