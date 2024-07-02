import React from "react";

import { env, getDefaultProfileId, render } from "@/utils/testing-library";

import { WalletDetailAddress } from "./WalletDetailAddress";

describe("WalletDetailAddress", () => {
	it("should render", () => {
		const profile = env.profiles().findById(getDefaultProfileId());

		const { container } = render(<WalletDetailAddress address={profile.wallets().first().address()} />);

		expect(container).toMatchSnapshot();
	});
});
