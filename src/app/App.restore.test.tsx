import { createHashHistory } from "history";
import React from "react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";
import { toasts } from "@/app/services";
import { translations as profileTranslations } from "@/domains/profile/i18n";
import { render, screen, waitFor } from "@/utils/testing-library";

const history = createHashHistory();

const passwordInput = () => screen.getByTestId("SignIn__input--password");

describe("App", () => {
	afterEach(() => {
		vi.restoreAllMocks();
		process.env.MOCK_SYNCHRONIZER = undefined;
	});

	beforeEach(() => {
		vi.spyOn(toasts, "dismiss").mockImplementation(vi.fn());

		// Mock synchronizer to avoid running any jobs in these tests.
		process.env.MOCK_SYNCHRONIZER = "TRUE";

		history.replace("/");
	});

	it("should redirect to root if profile restoration error occurs", async () => {
		process.env.TEST_PROFILES_RESTORE_STATUS = "restored";
		process.env.REACT_APP_IS_UNIT = "1";

		render(<App />, { history, withProviders: false });

		await expect(
			screen.findByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE, undefined),
		).resolves.toBeVisible();

		expect(history.location.pathname).toBe("/");

		await userEvent.click(screen.getAllByTestId("ProfileRow__Link")[1]);

		await waitFor(() => {
			expect(passwordInput()).toBeInTheDocument();
		});

		await userEvent.clear(passwordInput());
		await userEvent.type(passwordInput(), "invalid-password");

		await waitFor(() => {
			expect(passwordInput()).toHaveValue("invalid-password");
		});

		await userEvent.click(screen.getByTestId("SignIn__submit-button"));

		await waitFor(() => expect(history.location.pathname).toBe("/"));
	});
});
