import { Networks } from "@ardenthq/sdk";
import userEvent from "@testing-library/user-event";
import React from "react";

import { NetworkIcon } from "./NetworkIcon";
import { availableNetworksMock } from "@/tests/mocks/networks";
import { render, screen } from "@/utils/testing-library";

let network: Networks.Network;

describe("NetworkIcon", () => {
	beforeEach(() => {
		network = availableNetworksMock[0];
	});

	it.each([true, false])("should render when isCompact = %s", (isCompact: boolean) => {
		const { asFragment } = render(<NetworkIcon network={network} size="lg" isCompact={isCompact} />, {});

		expect(screen.getByTestId(`NetworkIcon-${network.coin()}-${network.id()}`)).toHaveAttribute(
			"aria-label",
			network.displayName(),
		);
		expect(screen.getByTestId("NetworkIcon__icon")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with tooltip in the dark mode", async () => {
		render(<NetworkIcon network={network} size="lg" tooltipDarkTheme />, {});

		await userEvent.hover(screen.getByTestId(`NetworkIcon-${network.coin()}-${network.id()}`));

		expect(screen.getByRole("tooltip")).toHaveAttribute("data-theme", "dark");
	});

	it("should render with placeholder", () => {
		const { asFragment } = render(<NetworkIcon size="lg" />, {});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with test network", () => {
		network = availableNetworksMock[1];

		render(<NetworkIcon size="lg" network={network} />, {});

		expect(screen.getByTestId(`NetworkIcon-${network.coin()}-${network.id()}`)).toHaveAttribute(
			"aria-label",
			network.displayName(),
		);
		expect(screen.getByTestId("NetworkIcon__icon")).toBeInTheDocument();
	});

	it("should render for custom network", () => {
		const customNetwork = {
			...availableNetworksMock[1],
			coin: () => "Whatever",
			coinName: () => "Custom Network",
			id: () => "whatever.custom",
			isLive: () => false,
			ticker: () => "WTH",
		};

		render(<NetworkIcon size="lg" network={customNetwork} />, {});

		expect(screen.getByTestId(`NetworkIcon-Whatever-whatever.custom`)).toHaveAttribute(
			"aria-label",
			"Custom Network",
		);

		expect(screen.getByTestId(`NetworkIcon-Whatever-whatever.custom`)).toHaveTextContent("CU");
	});

	it("should render network with custom classname", () => {
		render(<NetworkIcon size="lg" network={network} className="test" />, {});

		expect(screen.getByTestId(`NetworkIcon-${network.coin()}-${network.id()}`)).toHaveAttribute(
			"aria-label",
			network.displayName(),
		);
		expect(screen.getByTestId("NetworkIcon__icon")).toBeInTheDocument();
	});
});
