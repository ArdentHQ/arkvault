import React from "react";

import { WalletDetailNetwork } from "./WalletDetailNetwork";
import { translations } from "@/domains/transaction/i18n";
import { render, screen, env, getDefaultProfileId } from "@/utils/testing-library";

describe("WalletDetailNetwork", () => {
	it("should render", () => {
		const profile = env.profiles().findById(getDefaultProfileId());
		const { asFragment } = render(<WalletDetailNetwork network={profile.activeNetwork()} />);

		expect(screen.getByTestId("WalletDetailNetwork")).toHaveTextContent(translations.CRYPTOASSET);

		// eslint-disable-next-line testing-library/no-node-access
		expect(screen.getByTestId("WalletDetailNetwork").querySelector("svg#ark")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});
});
