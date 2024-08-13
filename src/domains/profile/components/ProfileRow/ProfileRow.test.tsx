import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";
import { ProfileRow, ProfileRowSkeleton } from "./ProfileRow";

let profile: Contracts.IProfile;

// const options = [
// 	{ label: "Option 1", value: "1" },
// 	{ label: "Option 2", value: "2" },
// ];

describe("ProfileRow", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it("should render", () => {
		render(<ProfileRow profile={profile} />);

		expect(screen.getByTestId("ProfileRow")).toBeInTheDocument();
	});

	it("should show lock icon if profile is password protected", () => {
		const mockUsesPassword = vi.spyOn(profile, "usesPassword").mockImplementation(() => true);

		render(<ProfileRow profile={profile} />);

		expect(screen.getByTestId("Icon__Lock")).toBeInTheDocument();

		mockUsesPassword.mockRestore();
	});
});

describe("ProfileRowSkeleton", () => {
	it("should render", () => {
		render(<ProfileRowSkeleton />);

		expect(screen.getByTestId("ProfileRowSkeleton")).toBeInTheDocument();
	});
});
