import { Contracts } from "@/app/lib/profiles";
import React from "react";

import { SelectNetwork } from "./SelectNetwork";
import {
	env,
	render,
	screen,
	mockProfileWithPublicAndTestNetworks,
	getMainsailProfileId,
} from "@/utils/testing-library";

let profile: Contracts.IProfile;

describe("SelectNetwork", () => {
	beforeAll(async () => {
		process.env.MOCK_AVAILABLE_NETWORKS = "false";
		profile = env.profiles().findById(getMainsailProfileId());
		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should render as dropdown", () => {
		const resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
		render(<SelectNetwork profile={profile} networks={profile.availableNetworks()} />, {});

		expect(screen.queryByTestId("SelectDropdown")).not.toBeInTheDocument();

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
