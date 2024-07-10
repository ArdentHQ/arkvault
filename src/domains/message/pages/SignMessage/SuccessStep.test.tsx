/* eslint-disable @typescript-eslint/require-await */
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { SuccessStep } from "./SuccessStep";
import { env, getDefaultProfileId, renderResponsiveWithRoute, screen } from "@/utils/testing-library";

const history = createHashHistory();

describe("SignMessage success step", () => {
	it.each(["xs", "lg"])("should render success step in %s", async (breakpoint) => {
		const profile = env.profiles().findById(getDefaultProfileId());

		const { asFragment } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/wallets/:walletId/sign-message" element={	<SuccessStep
				wallet={profile.wallets().first()}
				signedMessage={{ message: "Test Message", mnemonic: "1", signatory: "!", signature: "1" }}
			/>}>
			</Route>,
			breakpoint,
			{
				history,
				route: `/profiles/${getDefaultProfileId()}/wallets/${profile.wallets().first().id()}/sign-message`,
			},
		);

		expect(screen.getByText("Test Message")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
