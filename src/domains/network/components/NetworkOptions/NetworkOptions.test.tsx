import { Networks } from "@ardenthq/sdk";
import userEvent from "@testing-library/user-event";
import React from "react";

import { NetworkOption, NetworkOptions } from "./NetworkOptions";
import { env, getDefaultProfileId, MNEMONICS, render, screen } from "@/utils/testing-library";

let network: Networks.Network;
let customNetwork: Networks.Network;
let networkTestnet: Networks.Network;

const ariaLabelAttribute = "aria-label";

describe("NetworkOption", () => {
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
			ticker: () => "WTH",
		};
		networkTestnet = profile.wallets().first().network();
	});

	it("should render network", () => {
		render(<NetworkOption network={network} />, {});

		expect(screen.getByTestId("NetworkOption-ARK-ark.mainnet")).toHaveAttribute(
			ariaLabelAttribute,
			network.displayName(),
		);
		expect(screen.getByTestId("NetworkIcon__icon")).toBeInTheDocument();
	});

	it("should render custom network", () => {
		render(<NetworkOption network={customNetwork} />, {});

		expect(screen.getByTestId("NetworkOption-Whatever-whatever.custom")).toHaveAttribute(
			ariaLabelAttribute,
			"Custom Network",
		);
		expect(screen.getByTestId("NetworkOption-Whatever-whatever.custom")).toHaveTextContent("CU");
	});

	it("should call onSelect callback", async () => {
		const onSelect = vi.fn();

		render(<NetworkOption network={network} onSelect={onSelect} />, {});

		expect(screen.getByTestId("NetworkOption-ARK-ark.mainnet")).toHaveAttribute(
			ariaLabelAttribute,
			network.displayName(),
		);
		expect(screen.getByTestId("NetworkIcon__icon")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("NetworkOption"));

		expect(onSelect).toHaveBeenCalledWith();
	});

	it("should not call onSelect callback if disabled", async () => {
		const onSelect = vi.fn();

		render(<NetworkOption network={network} onSelect={onSelect} disabled />, {});

		expect(screen.getByTestId("NetworkOption-ARK-ark.mainnet")).toHaveAttribute(
			ariaLabelAttribute,
			network.displayName(),
		);
		expect(screen.getByTestId("NetworkIcon__icon")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("NetworkOption"));

		expect(onSelect).not.toHaveBeenCalledWith();
	});

	it("should call onDeselect callback if is already selected", async () => {
		const onDeselect = vi.fn();

		render(<NetworkOption network={network} onDeselect={onDeselect} isSelected />, {});

		expect(screen.getByTestId("NetworkOption-ARK-ark.mainnet")).toHaveAttribute(
			ariaLabelAttribute,
			network.displayName(),
		);
		expect(screen.getByTestId("NetworkIcon__icon")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("NetworkOption"));

		expect(onDeselect).toHaveBeenCalledWith();
	});

	it("should not render different class for testnet network", () => {
		const { asFragment } = render(<NetworkOption network={networkTestnet} />, {});

		expect(screen.getByTestId("NetworkOption-ARK-ark.devnet")).toHaveAttribute(
			ariaLabelAttribute,
			networkTestnet.displayName(),
		);
		expect(screen.getByTestId("NetworkIcon__icon")).toBeInTheDocument();
		expect(asFragment).toMatchSnapshot();
	});

	it("should render NetworkOptions", () => {
		const { asFragment } = render(<NetworkOptions networks={[networkTestnet, network]} />, {});

		expect(screen.getAllByTestId("NetworkOption")).toHaveLength(2);
		expect(asFragment).toMatchSnapshot();
	});

	it("should render NetworkOptions as disabled", () => {
		const { asFragment } = render(<NetworkOptions networks={[networkTestnet, network]} disabled />, {});

		expect(screen.getAllByTestId("NetworkOption")).toHaveLength(2);
		expect(asFragment).toMatchSnapshot();
	});

	it("should render NetworkOptions with no networks", async () => {
		const { asFragment } = render(<NetworkOptions />, {});

		await expect(screen.findByTestId("NetworkOption")).rejects.toThrow(/Unable to find/);
		expect(asFragment).toMatchSnapshot();
	});

	it("should select network option", async () => {
		const onSelect = vi.fn();
		const { asFragment } = render(<NetworkOptions networks={[networkTestnet, network]} onSelect={onSelect} />, {});

		expect(screen.getAllByTestId("NetworkOption")).toHaveLength(2);
		expect(asFragment).toMatchSnapshot();

		await userEvent.click(screen.getAllByTestId("NetworkOption")[0]);

		expect(onSelect).toHaveBeenCalledWith(networkTestnet);
	});

	it("should deselect network option", async () => {
		const onSelect = vi.fn();

		const { asFragment } = render(
			<NetworkOptions networks={[networkTestnet, network]} onSelect={onSelect} selected={networkTestnet} />,
			{},
		);

		expect(screen.getAllByTestId("NetworkOption")).toHaveLength(2);
		expect(asFragment).toMatchSnapshot();

		await userEvent.click(screen.getAllByTestId("NetworkOption")[0]);

		expect(onSelect).toHaveBeenCalledWith();
	});
});
