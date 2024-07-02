import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";

import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

import { ProfileAvatar } from "./ProfileAvatar";

let profile: Contracts.IProfile;

describe("Avatar", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it("should render with svg", () => {
		const { asFragment } = render(<ProfileAvatar profile={profile} />);

		expect(screen.getByTestId("ProfileAvatar__svg")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with profile image", () => {
		profile.settings().set(Contracts.ProfileSetting.Avatar, "avatarImage");

		const { asFragment } = render(<ProfileAvatar profile={profile} />);

		expect(screen.getByTestId("ProfileAvatar__image")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
