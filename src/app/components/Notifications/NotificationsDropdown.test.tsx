import { Contracts } from "@/app/lib/profiles";
import React from "react";

import * as useNotificationsHook from "./hooks/use-notifications";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { env, getMainsailProfileId, render, screen } from "@/utils/testing-library";

vi.mock("@/app/components/Dot", () => ({
	Dot: () => <span data-testid="NotificationsDropdown__unread-indicator" />,
}));

const mockHasUnread = (hasUnread: boolean) =>
	vi.spyOn(useNotificationsHook, "useNotifications").mockReturnValue({
		hasUnread,
	} as ReturnType<typeof useNotificationsHook.useNotifications>);

describe("NotificationsDropdown", () => {
	let profile: Contracts.IProfile;

	beforeAll(() => {
		profile = env.profiles().findById(getMainsailProfileId());
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should render the unread indicator when there are unread notifications", () => {
		mockHasUnread(true);

		render(<NotificationsDropdown profile={profile} />);

		expect(screen.getByTestId("NotificationsDropdown__unread-indicator")).toBeInTheDocument();
	});

	it("should not render the unread indicator when all notifications are read", () => {
		mockHasUnread(false);

		render(<NotificationsDropdown profile={profile} />);

		expect(screen.getByTestId("NavigationBar__buttons--notifications")).toBeInTheDocument();
		expect(screen.queryByTestId("NotificationsDropdown__unread-indicator")).not.toBeInTheDocument();
	});
});
