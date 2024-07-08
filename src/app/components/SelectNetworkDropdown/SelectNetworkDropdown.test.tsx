import React from "react";
import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import Tippy from "@tippyjs/react";
import userEvent from "@testing-library/user-event";
import { SelectNetworkDropdown } from "./SelectNetworkDropdown";
import { NetworkOptionLabel } from "./SelectNetworkDropdown.blocks";
import {
	render,
	env,
	screen,
	getDefaultProfileId,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

const fixtureProfileId = getDefaultProfileId();
let profile: Contracts.IProfile;
let resetProfileNetworksMock: () => void;

describe("SelectNetworkDropdown", () => {
	beforeEach(() => {
		vi.spyOn(Tippy as any, "render").mockRestore();

		profile = env.profiles().findById(fixtureProfileId);

		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("should render", () => {
		const { container } = render(<SelectNetworkDropdown profile={profile} />);

		expect(container).toMatchSnapshot();
	});

	it("should render with default network", () => {
		const networks = profile.availableNetworks();

		const { container } = render(<SelectNetworkDropdown profile={profile} selectedNetwork={networks[0]} />);

		expect(container).toMatchSnapshot();
	});

	it("should change network", async () => {
		const networks = profile.availableNetworks();
		const onChange = vi.fn();

		const { container } = render(
			<SelectNetworkDropdown
				profile={profile}
				networks={[
					...networks,
					{
						coin: () => "ARK",
						coinName: () => "Custom Network",
						id: () => "whatever.custom",
						isLive: () => true,
						isTest: () => false,
						ticker: () => "WTH",
					} as Networks.Network,
				]}
				selectedNetwork={networks[0]}
				onChange={onChange}
			/>,
		);

		await userEvent.click(screen.getByTestId("SelectDropdown__input"));

		expect(screen.getByTestId("SelectDropdown__option--1")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("SelectDropdown__option--1"));

		expect(onChange).toHaveBeenCalledWith(networks[1]);
		expect(container).toMatchSnapshot();
	});

	it("should not render network option label if network is not defined", () => {
		const { container } = render(<NetworkOptionLabel />);

		expect(container).toMatchSnapshot();
	});

	it("should render custom network initials", () => {
		const customNetworkMock = {
			coin: () => "ARK",
			coinName: () => "My Coin name",
			id: () => "whatever.custom",
			isLive: () => false,
			isTest: () => false,
			ticker: () => "MYC",
		} as Networks.Network;

		render(<NetworkOptionLabel network={customNetworkMock} />);

		expect(screen.getByText("MY")).toBeInTheDocument();
	});
});
