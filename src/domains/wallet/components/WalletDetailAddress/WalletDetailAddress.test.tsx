import React from "react";

import { WalletDetailAddress } from "./WalletDetailAddress";
import { env, getMainsailProfileId, render } from "@/utils/testing-library";

process.env.RESTORE_MAINSAIL_PROFILE = "true";

describe("WalletDetailAddress", () => {
	it("should render", () => {
		const profile = env.profiles().findById(getMainsailProfileId());

		const { container } = render(<WalletDetailAddress address={profile.wallets().first().address()} />);

		expect(container).toMatchSnapshot();
	});
});
