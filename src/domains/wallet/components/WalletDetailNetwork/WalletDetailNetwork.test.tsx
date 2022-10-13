import React from "react";

import { WalletDetailNetwork } from "./WalletDetailNetwork";
import { translations } from "@/domains/transaction/i18n";
import { availableNetworksMock } from "@/tests/mocks/networks";
import { render } from "@/utils/testing-library";

describe("WalletDetailNetwork", () => {
	it("should render", () => {
		const network = availableNetworksMock.find((network) => network.id() === "ark.devnet");

		const { container } = render(<WalletDetailNetwork network={network!} />);

		expect(container).toHaveTextContent(translations.CRYPTOASSET);

		// eslint-disable-next-line testing-library/no-node-access
		expect(container.querySelector("svg#ark")).toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});
});
