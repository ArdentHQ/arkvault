import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";

import { Route } from "react-router-dom";
import { UserMenu } from "@/app/components/NavigationBar/components/UserMenu/UserMenu";
import { env, getDefaultProfileId, render, renderResponsiveWithRoute, screen } from "@/utils/testing-library";
let profile: Contracts.IProfile;

describe("UserMenu", () => {
	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it("should render with svg image", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<UserMenu avatarImage={profile.avatar()} onUserAction={vi.fn()} />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with regular image", () => {
		const avatarImage =
			"data:image/png;base64,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";

		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<UserMenu avatarImage={avatarImage} onUserAction={vi.fn()} />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render the avatar with 25px on mobile", () => {
		const avatarImage = "<svg></svg>";
		renderResponsiveWithRoute(
			<Route path="/profiles/:profileId">
				<UserMenu avatarImage={avatarImage} onUserAction={vi.fn()} />
			</Route>,
			"xs",
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(screen.getByTestId("Avatar")).toHaveClass("w-[25px]");
	});

	it("should render the avatar with 44px on desktop", () => {
		const avatarImage = "<svg></svg>";
		renderResponsiveWithRoute(
			<Route path="/profiles/:profileId">
				<UserMenu avatarImage={avatarImage} onUserAction={vi.fn()} />
			</Route>,
			"lg",
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(screen.getByTestId("Avatar")).toHaveClass("w-11");
	});
});
