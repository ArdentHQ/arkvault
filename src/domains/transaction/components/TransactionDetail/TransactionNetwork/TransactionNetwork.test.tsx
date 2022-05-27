import React from "react";

import { Networks } from "@payvo/sdk";
import { TransactionNetwork } from "./TransactionNetwork";
import { translations } from "@/domains/transaction/i18n";
import { availableNetworksMock } from "@/tests/mocks/networks";
import { renderResponsive } from "@/utils/testing-library";

describe("TransactionNetwork", () => {
	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint) => {
		const network = availableNetworksMock.find((network: Networks.Network) => network.id() === "ark.devnet");

		const { container } = renderResponsive(<TransactionNetwork network={network!} />, breakpoint);

		expect(container).toHaveTextContent(translations.CRYPTOASSET);
		expect(container).toHaveTextContent("ark.svg");

		expect(container).toMatchSnapshot();
	});
});
