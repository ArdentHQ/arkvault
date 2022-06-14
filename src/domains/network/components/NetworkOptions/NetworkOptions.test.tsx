import { Networks } from "@ardenthq/sdk";
import userEvent from "@testing-library/user-event";
import React from "react";

import { NetworkOption } from "./NetworkOptions";
import { env, getDefaultProfileId, MNEMONICS, render, screen } from "@/utils/testing-library";

let network: Networks.Network;
let customNetwork: Networks.Network;
let networkTestnet: Networks.Network;

const ariaLabelAttribute = "aria-label";

describe("NetworkIcon", () => {
	beforeAll(async () => {
		const profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();

		const wallet1 = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: MNEMONICS[0],
			network: "ark.mainnet",
		});

		network = wallet1.network();
		customNetwork = {
			...wallet1.network(),
			coin: () => "Whatever",
			coinName: () => "Custom Network",
			id: () => "whatever.custom",
			isLive: () => false,
		};
		networkTestnet = profile.wallets().first().network();
	});

	it("should render network", () => {
		render(<NetworkOption network={network} />, {});

		expect(screen.getByTestId("NetworkIcon-ARK-ark.mainnet")).toHaveAttribute(
			ariaLabelAttribute,
			network.displayName(),
		);
		expect(screen.getByTestId("NetworkIcon__icon")).toBeInTheDocument();
	});

	it("should render custom network", () => {
		render(<NetworkOption network={customNetwork} />, {});

		expect(screen.getByTestId("NetworkIcon-Whatever-whatever.custom")).toHaveAttribute(
			ariaLabelAttribute,
			"Custom Network",
		);
		expect(screen.getByTestId("NetworkIcon-Whatever-whatever.custom")).toHaveTextContent("CU");
	});

	it("should call onClick callback", () => {
		const onClick = jest.fn();

		render(<NetworkOption network={network} onClick={onClick} />, {});

		expect(screen.getByTestId("NetworkIcon-ARK-ark.mainnet")).toHaveAttribute(
			ariaLabelAttribute,
			network.displayName(),
		);
		expect(screen.getByTestId("NetworkIcon__icon")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectNetwork__NetworkIcon--container"));

		expect(onClick).toHaveBeenCalledWith();
	});

	it("should not call onClick callback if disabled", () => {
		const onClick = jest.fn();

		render(<NetworkOption network={network} onClick={onClick} disabled />, {});

		expect(screen.getByTestId("NetworkIcon-ARK-ark.mainnet")).toHaveAttribute(
			ariaLabelAttribute,
			network.displayName(),
		);
		expect(screen.getByTestId("NetworkIcon__icon")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectNetwork__NetworkIcon--container"));

		expect(onClick).not.toHaveBeenCalled();
	});

	it("should not render different class for testnet network", () => {
		const { asFragment } = render(<NetworkOption network={networkTestnet} />, {});

		expect(screen.getByTestId("NetworkIcon-ARK-ark.devnet")).toHaveAttribute(
			ariaLabelAttribute,
			networkTestnet.displayName(),
		);
		expect(screen.getByTestId("NetworkIcon__icon")).toBeInTheDocument();
		expect(asFragment).toMatchSnapshot();
	});
});
