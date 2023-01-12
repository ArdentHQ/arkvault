import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import * as reactRouterDom from "react-router-dom";
import { MigrationBanner } from "./MigrationBanner";
import { render, screen, getDefaultProfileId, env } from "@/utils/testing-library";
import * as hooks from "@/app/hooks";
const fixtureProfileId = getDefaultProfileId();

let profile: Contracts.IProfile;
let useActiveProfileSpy;

vi.mock("react-router-dom", async () => ({
	...(await vi.importActual("react-router-dom")),
}));

describe("MigrationBanner", () => {
	beforeAll(() => {
		profile = env.profiles().findById(fixtureProfileId);

		useActiveProfileSpy = vi.spyOn(hooks, "useActiveProfile").mockReturnValue(profile);
	});

	afterAll(() => {
		useActiveProfileSpy.mockRestore();
	});

	it("should render", () => {
		const { asFragment } = render(<MigrationBanner />);

		expect(screen.getByTestId("MigrationBanner")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("can click the learn more button", () => {
		const windowOpenSpy = vi.spyOn(window, "open");

		render(<MigrationBanner />);

		userEvent.click(screen.getByTestId("MigrationBanner--learnmore"));

		expect(windowOpenSpy).toHaveBeenCalled();

		windowOpenSpy.mockRestore();
	});

	it("can click the learn more button", () => {
		const pushMock = vi.fn();

		const useHistorySpy = vi.spyOn(reactRouterDom, "useHistory").mockReturnValue({ push: pushMock });

		render(<MigrationBanner />);

		userEvent.click(screen.getByTestId("MigrationBanner--migrate"));

		expect(pushMock).toHaveBeenCalledWith(`/profiles/${profile.id()}/migration`);

		useHistorySpy.mockRestore();
	});
});
