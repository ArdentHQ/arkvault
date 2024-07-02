import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";

import {
	env,
	getDefaultProfileId,
	mockProfileWithPublicAndTestNetworks,
	render,
	screen,
} from "@/utils/testing-library";

import { SelectNetwork } from "./SelectNetwork";

let profile: Contracts.IProfile;

describe("SelectNetwork", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should render as dropdown", () => {
		const resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
		render(<SelectNetwork profile={profile} networks={profile.availableNetworks()} />, {});

		expect(screen.getByTestId("SelectDropdown")).toBeInTheDocument();

		resetProfileNetworksMock();
	});

	it("should render as network options", () => {
		const resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
		const [network1, network2] = profile.availableNetworks();
		render(<SelectNetwork profile={profile} networks={[network1, network2]} />, {});

		expect(screen.getByTestId("NetworkOptions")).toBeInTheDocument();

		resetProfileNetworksMock();
	});
});
