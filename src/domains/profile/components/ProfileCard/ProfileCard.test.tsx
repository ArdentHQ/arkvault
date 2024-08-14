import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { ProfileCard } from "./ProfileCard";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

let profile: Contracts.IProfile;

const options = [
	{ label: "Option 1", value: "1" },
	{ label: "Option 2", value: "2" },
];

describe("ProfileCard", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it("should render", () => {
		const { container} = render(<ProfileCard profile={profile} />);

		expect(container).toBeInTheDocument();
		expect(screen.getByText(profile.name())).toBeInTheDocument();
		expect(screen.getByTestId("ProfileAvatar__svg")).toBeInTheDocument();
	});

	it("should render the profile with avatar image", () => {
		profile.settings().set(Contracts.ProfileSetting.Avatar, "avatarImage");

		const { container} = render(<ProfileCard profile={profile} />);

		expect(container).toBeInTheDocument();
		expect(screen.getByText(profile.name())).toBeInTheDocument();
		expect(screen.getByTestId("ProfileAvatar__image")).toBeInTheDocument();
	});

	it("should render the settings icon", () => {
		render(<ProfileCard profile={profile} actions={options} showSettings />);

		expect(screen.getByTestId("dropdown__toggle")).toBeInTheDocument();
	});

	it("should hide the settings icon", () => {
		render(<ProfileCard profile={profile} actions={options} showSettings={false} />);

		expect(screen.queryByTestId("dropdown__toggle")).not.toBeInTheDocument();
	});

	it("should open dropdown settings on icon click", () => {
		render(<ProfileCard profile={profile} actions={options} />);
		const toggle = screen.getByTestId("dropdown__toggle");

		userEvent.click(toggle);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();
	});

	it("should select an option in the settings", () => {
		const onSelect = vi.fn();
		render(<ProfileCard profile={profile} actions={options} onSelect={onSelect} />);
		const toggle = screen.getByTestId("dropdown__toggle");

		userEvent.click(toggle);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		const firstOption = screen.getByTestId("dropdown__option--0");

		expect(firstOption).toBeInTheDocument();

		userEvent.click(firstOption);

		expect(onSelect).toHaveBeenCalledWith({ label: "Option 1", value: "1" });
	});

	it("should ignore triggering onSelect callback if not exists", () => {
		render(<ProfileCard profile={profile} actions={options} />);
		const toggle = screen.getByTestId("dropdown__toggle");

		userEvent.click(toggle);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		const firstOption = screen.getByTestId("dropdown__option--0");

		expect(firstOption).toBeInTheDocument();

		userEvent.click(firstOption);

		expect(screen.queryAllByRole("listbox")).toHaveLength(0);
	});

	it("should render lock icon if profile is password protected", () => {
		const mockUsesPassword = vi.spyOn(profile, "usesPassword").mockImplementation(() => true);

		const { container } = render(<ProfileCard profile={profile} actions={options} />);

		// eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
		expect(container.querySelector("svg#lock")).toBeInTheDocument();

		mockUsesPassword.mockRestore();
	});
});
