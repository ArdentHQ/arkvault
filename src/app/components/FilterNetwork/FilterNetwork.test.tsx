import { Networks } from "@ardenthq/sdk";
import userEvent from "@testing-library/user-event";
import React from "react";

import { FilterNetwork, FilterNetworks } from "./FilterNetwork";
import { FilterOption } from "./FilterNetwork.contracts";
import { NetworkOptions } from "./NetworkOptions";
import { ToggleAllOption } from "./ToggleAllOption";
import { env, render, screen, waitFor, within } from "@/utils/testing-library";

let networkOptions: FilterOption[];

const setNetworkOptions = () => {
	networkOptions = env.availableNetworks().map((network: Networks.Network) => ({
		isSelected: false,
		network,
	}));
};

describe("NetworkOptions", () => {
	beforeAll(() => {
		setNetworkOptions();
	});

	it("should render empty", () => {
		const { container } = render(<NetworkOptions networks={[]} onClick={vi.fn()} />);

		expect(container).toMatchSnapshot();
	});

	it("should render available networks options", () => {
		const { container } = render(<NetworkOptions networks={networkOptions} onClick={vi.fn()} />);

		expect(container).toMatchSnapshot();
	});

	it("should trigger onClick", async () => {
		const onClick = vi.fn();
		render(<NetworkOptions networks={networkOptions} onClick={onClick} />);
		await userEvent.click(screen.getByTestId(`NetworkOption__${networkOptions[0].network.id()}`));

		expect(onClick).toHaveBeenCalledWith(
			{
				isSelected: false,
				network: networkOptions[0].network,
			},
			expect.anything(),
		);
	});
});

describe("ToggleAllOption", () => {
	it("should render", () => {
		const { container } = render(<ToggleAllOption />);

		expect(container).toMatchSnapshot();
	});

	it("should render hidden", () => {
		const { container } = render(<ToggleAllOption isHidden />);

		expect(container).toMatchSnapshot();
	});

	it("should render selected", () => {
		const { container } = render(<ToggleAllOption isSelected />);

		expect(container).toMatchSnapshot();
	});

	it("should handle onClick", async () => {
		const onClick = vi.fn();
		render(<ToggleAllOption isSelected onClick={onClick} />);
		await userEvent.click(screen.getByTestId("network__viewall"));

		expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});
});

describe("FilterNetwork", () => {
	beforeAll(() => {
		setNetworkOptions();
	});

	it("should render empty", () => {
		const { container } = render(<FilterNetwork />);

		expect(container).toMatchSnapshot();
	});

	it("should render public networks", () => {
		const { container } = render(<FilterNetwork options={networkOptions} />);

		expect(screen.getAllByTestId("FilterNetwork")).toHaveLength(1);

		expect(container).toMatchSnapshot();
	});

	it("should toggle a network option", async () => {
		const onChange = vi.fn();
		render(<FilterNetwork options={networkOptions} onChange={onChange} />);

		expect(screen.getAllByTestId("FilterNetwork")).toHaveLength(1);

		await userEvent.click(screen.getByTestId(`NetworkOption__${networkOptions[0].network.id()}`));

		expect(onChange).toHaveBeenCalledWith(
			{
				isSelected: true,
				network: networkOptions[0].network,
			},
			expect.anything(),
		);
	});
});

describe("FilterNetworks", () => {
	beforeAll(() => {
		setNetworkOptions();
	});

	it("should render empty", () => {
		const { container } = render(<FilterNetworks />);

		expect(container).toMatchSnapshot();
	});

	it("should render public and testnet networks", () => {
		const { container } = render(<FilterNetworks options={networkOptions} />);

		expect(screen.getAllByTestId("FilterNetwork")).toHaveLength(2);

		expect(container).toMatchSnapshot();
	});

	it("should toggle view all", async () => {
		const { container } = render(
			<FilterNetworks options={[networkOptions[0], ...networkOptions]} hideViewAll={false} />,
		);

		expect(screen.getAllByTestId("FilterNetwork")).toHaveLength(2);

		await userEvent.click(within(screen.getAllByTestId("FilterNetwork")[0]).getByTestId("network__viewall"));

		await expect(screen.findByTestId("FilterNetwork__select-all-checkbox")).resolves.toBeVisible();

		expect(container).toMatchSnapshot();

		await userEvent.click(within(screen.getAllByTestId("FilterNetwork")[0]).getByTestId("network__viewall"));

		await waitFor(() => expect(screen.queryByTestId("FilterNetwork__select-all-checkbox")).not.toBeInTheDocument());

		expect(container).toMatchSnapshot();
	});

	it("should select all public networks", async () => {
		const onChange = vi.fn();

		render(
			<FilterNetworks
				options={[
					{
						isSelected: false,
						network: {
							coin: () => "ARK",
							coinName: () => "Custom Network",
							id: () => "whatever.custom",
							isLive: () => true,
							ticker: () => "WTH",
						},
					},
					networkOptions[0],
					networkOptions[1],
				]}
				onChange={onChange}
				hideViewAll={false}
			/>,
		);

		expect(screen.getAllByTestId("FilterNetwork")).toHaveLength(2);

		await userEvent.click(within(screen.getAllByTestId("FilterNetwork")[0]).getByTestId("network__viewall"));

		await userEvent.click(screen.getByTestId("FilterNetwork__select-all-checkbox"));

		expect(onChange).toHaveBeenCalledWith(
			expect.anything(),
			expect.arrayContaining([
				...networkOptions
					.filter((option) => option.network.isLive())
					.map((option) => ({ ...option, isSelected: true })),
				...networkOptions
					.filter((option) => option.network.isTest())
					.map((option) => ({ ...option, isSelected: false })),
			]),
		);
	});

	it("should toggle a public network option", async () => {
		const onChange = vi.fn();
		render(<FilterNetworks options={networkOptions} onChange={onChange} />);

		expect(screen.getAllByTestId("FilterNetwork")).toHaveLength(2);

		await userEvent.click(screen.getByTestId(`NetworkOption__${networkOptions[0].network.id()}`));

		expect(onChange).toHaveBeenCalledWith(
			{
				isSelected: true,
				network: networkOptions[0].network,
			},
			expect.anything(),
		);
	});

	it("should toggle a testnet network option", async () => {
		const onChange = vi.fn();
		const { container } = render(<FilterNetworks options={networkOptions} onChange={onChange} />);

		expect(container).toMatchSnapshot();
		expect(screen.getAllByTestId("FilterNetwork")).toHaveLength(2);

		await userEvent.click(screen.getByTestId(`NetworkOption__${networkOptions[1].network.id()}`));

		expect(onChange).toHaveBeenCalledWith(
			{
				isSelected: true,
				network: networkOptions[1].network,
			},
			expect.anything(),
		);
	});
});
