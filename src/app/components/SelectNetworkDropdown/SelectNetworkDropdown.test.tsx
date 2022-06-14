import React from "react";
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
		jest.spyOn(Tippy as any, "render").mockRestore();

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
		const networks = env.availableNetworks();

		const { container } = render(<SelectNetworkDropdown profile={profile} selectedNetwork={networks[0]} />);

		expect(container).toMatchSnapshot();
	});

	it("should change network", () => {
		const networks = env.availableNetworks();
		const onChange = jest.fn();

		const { container } = render(
			<SelectNetworkDropdown
				profile={profile}
				networks={networks}
				selectedNetwork={networks[0]}
				onChange={onChange}
			/>,
		);

		userEvent.click(screen.getByTestId("SelectDropdown__input"));

		expect(screen.getByTestId("SelectDropdown__option--2")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectDropdown__option--2"));

		expect(onChange).toHaveBeenCalledWith(networks[2]);
		expect(container).toMatchSnapshot();
	});

	it("should not render network option label if network is not defined", () => {
		const { container } = render(<NetworkOptionLabel />);

		expect(container).toMatchSnapshot();
	});

	it("should render custom network initials", () => {
		const customNetworkMock = {
			coinName: () => "My Coin name",
			id: "whatever.custom",
			isLive: () => false,
			isTest: () => false,
		};

		render(<NetworkOptionLabel network={customNetworkMock} value="tests" />);

		expect(screen.getByText("MY")).toBeInTheDocument();
	});
});
