import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";
import { ProfileRow, ProfileRowSkeleton, ProfilesSliderSkeleton } from "./ProfileRow";

let profile: Contracts.IProfile;

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

describe("ProfileSliderSkeleton", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it("should render", () => {
		const { asFragment } = render(<ProfilesSliderSkeleton />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with length", () => {
		const { asFragment } = render(<ProfilesSliderSkeleton length={2} />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with dots", () => {
		const { asFragment } = render(<ProfilesSliderSkeleton length={6} />);

		expect(asFragment()).toMatchSnapshot();
	});
});
