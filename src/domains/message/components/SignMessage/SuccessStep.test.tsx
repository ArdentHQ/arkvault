/* eslint-disable @typescript-eslint/require-await */
import React from "react";

import { SuccessStep } from "./SuccessStep";
import { env, getMainsailProfileId, renderResponsiveWithRoute, screen } from "@/utils/testing-library";

describe("SignMessage success step", () => {
	it.each(["xs", "lg"])("should render success step in %s", async (breakpoint) => {
		const profile = env.profiles().findById(getMainsailProfileId());

		const { asFragment } = renderResponsiveWithRoute(
			<SuccessStep
				wallet={profile.wallets().first()}
				signedMessage={{ message: "Test Message", mnemonic: "1", signatory: "!", signature: "1" }}
			/>,
			breakpoint,
			{
				route: `/profiles/${getMainsailProfileId()}/wallets/${profile.wallets().first().id()}/sign-message`,
			},
		);

		expect(screen.getByText("Test Message")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
