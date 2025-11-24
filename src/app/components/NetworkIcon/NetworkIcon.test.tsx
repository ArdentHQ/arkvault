import { Networks } from "@/app/lib/mainsail";
import userEvent from "@testing-library/user-event";
import React from "react";
import { env, getDefaultProfileId } from "@/utils/testing-library";

import { NetworkIcon } from "./NetworkIcon";
import { render, screen } from "@/utils/testing-library";

let network: Networks.Network;

describe("NetworkIcon", () => {
	beforeEach(() => {
		const profile = env.profiles().findById(getDefaultProfileId());
		network = profile.activeNetwork();
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
		const { asFragment } = render(<NetworkIcon network={network} size="lg" />, {});

		await userEvent.hover(screen.getByTestId(`NetworkIcon-${network.coin()}-${network.id()}`));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with placeholder", () => {
		const { asFragment } = render(<NetworkIcon size="lg" />, {});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with test network", () => {
		render(<NetworkIcon size="lg" network={network} />, {});

		expect(screen.getByTestId(`NetworkIcon-${network.coin()}-${network.id()}`)).toHaveAttribute(
			"aria-label",
			network.displayName(),
		);
		expect(screen.getByTestId("NetworkIcon__icon")).toBeInTheDocument();
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
