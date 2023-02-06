import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import * as reactRouterDom from "react-router-dom";
import { MigrationBanner } from "./MigrationBanner";
import { render, screen, getDefaultProfileId, env, waitFor } from "@/utils/testing-library";
import * as hooks from "@/app/hooks";
import * as contextMock from "@/app/contexts";
const fixtureProfileId = getDefaultProfileId();

let profile: Contracts.IProfile;
let useActiveProfileSpy;
let useMigrationsSpy;

vi.mock("react-router-dom", async () => ({
	...(await vi.importActual("react-router-dom")),
}));

const migrateButton = () => screen.getByTestId("MigrationBanner--migrate");

describe("MigrationBanner", () => {
	beforeAll(() => {
		profile = env.profiles().findById(fixtureProfileId);

		useActiveProfileSpy = vi.spyOn(hooks, "useActiveProfile").mockReturnValue(profile);
	});

	afterAll(() => {
		useActiveProfileSpy.mockRestore();

		vi.unmock("react-router-dom");
	});

	beforeEach(() => {
		useMigrationsSpy = vi.spyOn(contextMock, "useMigrations").mockReturnValue({
			migrations: [],
		});
	});

	afterEach(() => {
		useMigrationsSpy.mockRestore();
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

	it("the migrate button redirects to migrate page if has migrations", () => {
		useMigrationsSpy = vi.spyOn(contextMock, "useMigrations").mockReturnValue({
			migrations: [{ id: 1 }],
		});

		const pushMock = vi.fn();

		const useHistorySpy = vi.spyOn(reactRouterDom, "useHistory").mockReturnValue({ push: pushMock });

		render(<MigrationBanner />);

		userEvent.click(migrateButton());

		expect(pushMock).toHaveBeenCalledWith(`/profiles/${profile.id()}/migration`);

		useHistorySpy.mockRestore();
	});

	it("the migrate button redirects to migrate page while loading", () => {
		useMigrationsSpy = vi.spyOn(contextMock, "useMigrations").mockReturnValue({
			isLoading: true,
			migrations: [],
		});

		const pushMock = vi.fn();

		const useHistorySpy = vi.spyOn(reactRouterDom, "useHistory").mockReturnValue({ push: pushMock });

		render(<MigrationBanner />);

		userEvent.click(migrateButton());

		expect(pushMock).toHaveBeenCalledWith(`/profiles/${profile.id()}/migration`);

		useHistorySpy.mockRestore();
	});

	it("opens the migrate disclaimer modal if no migrations and redirects to the user migration add page", () => {
		const pushMock = vi.fn();

		const useHistorySpy = vi.spyOn(reactRouterDom, "useHistory").mockReturnValue({ push: pushMock });

		render(<MigrationBanner />);

		userEvent.click(migrateButton());

		expect(screen.getByTestId("MigrationDisclaimer__submit-button")).toBeVisible();

		userEvent.click(screen.getByTestId("MigrationDisclaimer-checkbox"));

		expect(screen.getByTestId("MigrationDisclaimer__submit-button")).not.toBeDisabled();

		userEvent.click(screen.getByTestId("MigrationDisclaimer__submit-button"));

		expect(pushMock).toHaveBeenCalledWith(`/profiles/${profile.id()}/migration/add`);

		useHistorySpy.mockRestore();
	});

	it("handles the cancel button on the disclaimer modal", async () => {
		render(<MigrationBanner />);

		userEvent.click(migrateButton());

		expect(screen.getByTestId("MigrationDisclaimer__cancel-button")).toBeVisible();

		userEvent.click(screen.getByTestId("MigrationDisclaimer__cancel-button"));

		await waitFor(() => expect(screen.queryByTestId("MigrationDisclaimer__cancel-button")).not.toBeInTheDocument());
	});

	it("handles the close button on the disclaimer modal", async () => {
		render(<MigrationBanner />);

		userEvent.click(migrateButton());

		expect(screen.getByTestId("Modal__close-button")).toBeVisible();

		userEvent.click(screen.getByTestId("Modal__close-button"));

		await waitFor(() => expect(screen.queryByTestId("Modal__close-button")).not.toBeInTheDocument());
	});
});
