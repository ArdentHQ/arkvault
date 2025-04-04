import React from "react";

import { WalletDetailAddress } from "./WalletDetailAddress";
import { env, getMainsailProfileId, render } from "@/utils/testing-library";

describe("WalletDetailAddress", () => {
	it("should render", () => {
		const profile = env.profiles().findById(getMainsailProfileId());

		const { container } = render(<WalletDetailAddress address={profile.wallets().first().address()} />);

		expect(container).toMatchSnapshot();
	});
});
