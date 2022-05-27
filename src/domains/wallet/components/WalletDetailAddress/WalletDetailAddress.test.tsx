import React from "react";

import { WalletDetailAddress } from "./WalletDetailAddress";
import { env, getDefaultProfileId, render } from "@/utils/testing-library";

describe("WalletDetailAddress", () => {
	it("should render", () => {
		const profile = env.profiles().findById(getDefaultProfileId());

		const { container } = render(<WalletDetailAddress wallet={profile.wallets().first()} />);

		expect(container).toMatchSnapshot();
	});
});
