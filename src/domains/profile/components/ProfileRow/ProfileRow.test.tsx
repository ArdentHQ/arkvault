
import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";
import {ProfileRow} from "./ProfileRow";

let profile: Contracts.IProfile;

const options = [
	{ label: "Option 1", value: "1" },
	{ label: "Option 2", value: "2" },
];

describe("ProfileRow", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it("should render", () => {
		render(<ProfileRow profile={profile}/>);

		expect(screen.getByTestId("ProfileRow")).toBeInTheDocument();
	});

	it("should show lock icon if profile is password protected", () => {
		const mockUsesPassword = vi.spyOn(profile, "usesPassword").mockImplementation(() => true);

		const { container } = render(<ProfileRow profile={profile}/>);

		expect(container.querySelector("svg#lock")).toBeInTheDocument();

		mockUsesPassword.mockRestore();
	});
});
