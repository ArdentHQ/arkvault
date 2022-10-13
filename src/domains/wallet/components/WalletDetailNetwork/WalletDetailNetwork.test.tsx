import React from "react";

import { WalletDetailNetwork } from "./WalletDetailNetwork";
import { translations } from "@/domains/transaction/i18n";
import { availableNetworksMock } from "@/tests/mocks/networks";
import { render, screen } from "@/utils/testing-library";

describe("WalletDetailNetwork", () => {
	it("should render", () => {
		const network = availableNetworksMock.find((network) => network.id() === "ark.devnet");

		const { asFragment } = render(<WalletDetailNetwork network={network!} />);

		expect(screen.getByTestId("WalletDetailNetwork")).toHaveTextContent(translations.CRYPTOASSET);

		// eslint-disable-next-line testing-library/no-node-access
		expect(screen.getByTestId("WalletDetailNetwork").querySelector("svg#ark")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});
});
