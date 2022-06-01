import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { FilterWallets } from "./FilterWallets";
import { FilterOption } from "@/app/components/FilterNetwork";
import { DashboardConfiguration } from "@/domains/dashboard/pages/Dashboard";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

let profile: Contracts.IProfile;
let networkOptions: FilterOption[];

const defaultConfiguration: DashboardConfiguration = {
	selectedNetworkIds: [],
	walletsDisplayType: "all",
};

describe("FilterWallets", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());

		const networks: Record<string, FilterOption> = {};

		for (const wallet of profile.wallets().values()) {
			const networkId = wallet.networkId();

			if (!networks[networkId]) {
				networks[networkId] = {
					isSelected: false,
					network: wallet.network(),
				};
			}
		}

		networkOptions = Object.values(networks);
	});

	it("should render", () => {
		const { container } = render(
			<FilterWallets selectedNetworkIds={[]} defaultConfiguration={defaultConfiguration} />,
		);

		expect(container).toMatchSnapshot();
	});

	it("should render with networks selection", () => {
		const { container } = render(
			<FilterWallets
				selectedNetworkIds={[]}
				networks={networkOptions}
				defaultConfiguration={defaultConfiguration}
			/>,
		);

		expect(container).toMatchSnapshot();
	});

	it("should emit onChange for network selection", () => {
		const onChange = jest.fn();

		render(
			<FilterWallets
				selectedNetworkIds={[]}
				networks={networkOptions}
				onChange={onChange}
				defaultConfiguration={defaultConfiguration}
			/>,
		);

		userEvent.click(screen.getByTestId(`NetworkOption__${networkOptions[0].network.id()}`));

		expect(onChange).toHaveBeenCalledWith("selectedNetworkIds", [networkOptions[0].network.id()]);
	});

	it("should emit onChange for wallets display type change", () => {
		const onChange = jest.fn();

		render(
			<FilterWallets
				selectedNetworkIds={[]}
				networks={networkOptions}
				onChange={onChange}
				defaultConfiguration={defaultConfiguration}
			/>,
		);

		userEvent.click(screen.getByTestId("filter-wallets__wallets"));

		userEvent.click(screen.getByTestId("dropdown__option--0"));

		expect(onChange).toHaveBeenCalledWith("walletsDisplayType", "all");
	});

	it("should not emit onChange for wallet display type change", () => {
		const onChange = jest.fn();

		render(
			<FilterWallets
				selectedNetworkIds={[]}
				networks={networkOptions}
				defaultConfiguration={defaultConfiguration}
			/>,
		);

		userEvent.click(screen.getByTestId("filter-wallets__wallets"));

		userEvent.click(screen.getByTestId("dropdown__option--0"));

		expect(onChange).not.toHaveBeenCalled();
	});
});
