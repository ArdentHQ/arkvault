import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { SuccessStep } from "./SuccessStep";
import { env, getMainsailProfileId, renderResponsive, screen } from "@/utils/testing-library";

describe("SuccessStep", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(() => {
		profile = env.profiles().findById(getMainsailProfileId());

		wallet = profile.wallets().first();
	});

	it.each(["xs", "lg"])("should render (%s)", async (breakpoint) => {
		const onClickEditAlias = vi.fn();

		const { asFragment } = renderResponsive(
			<SuccessStep wallet={wallet} onClickEditAlias={onClickEditAlias} />,
			breakpoint,
		);

		expect(screen.getByTestId("CreateWallet__SuccessStep")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		expect(screen.getAllByText(wallet.address())[0]).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("CreateWallet__edit-alias"));

		expect(onClickEditAlias).toHaveBeenCalledTimes(1);
	});
});
