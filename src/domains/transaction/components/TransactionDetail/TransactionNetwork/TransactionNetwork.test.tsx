import React from "react";

import { Networks } from "@ardenthq/sdk";
import { TransactionNetwork } from "./TransactionNetwork";
import { translations } from "@/domains/transaction/i18n";
import { availableNetworksMock } from "@/tests/mocks/networks";
import { renderResponsive, screen } from "@/utils/testing-library";

describe("TransactionNetwork", () => {
	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint) => {
		const network = availableNetworksMock.find((network: Networks.Network) => network.id() === "ark.devnet");

		const { asFragment } = renderResponsive(<TransactionNetwork network={network!} />, breakpoint);

		expect(screen.getByTestId("TransactionNetwork")).toHaveTextContent(translations.CRYPTOASSET);

		// eslint-disable-next-line testing-library/no-node-access
		expect(screen.getByTestId("TransactionNetwork").querySelector("svg#ark")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});
});
