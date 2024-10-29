/* eslint-disable @typescript-eslint/require-await */
import fs from "fs";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";

import { EnvironmentProvider } from "@/app/contexts";
import { ImportProfile } from "@/domains/profile/pages/ImportProfile/ImportProfile";
import { env, fireEvent, render, screen, waitFor } from "@/utils/testing-library";

const passwordProtectedWwe = fs.readFileSync("src/tests/fixtures/profile/import/password-protected-profile.wwe");
const corruptedWwe = fs.readFileSync("src/tests/fixtures/profile/import/corrupted-profile.wwe");
const legacyJson = fs.readFileSync("src/tests/fixtures/profile/import/legacy-profile.json");
const darkThemeWwe = fs.readFileSync("src/tests/fixtures/profile/import/profile-dark-theme.wwe");
const lightThemeWwe = fs.readFileSync("src/tests/fixtures/profile/import/profile-light-theme.wwe");
const history = createHashHistory();

const importProfileURL = "/profiles/import";

const browseFiles = () => screen.getByTestId("SelectFile__browse-files");

const changeFileID = "SelectFileStep__change-file";
const submitID = "PasswordModal__submit-button";
const validPassword = "S3cUrePa$sword";
const wrongPassword = "wrong password";

const createBlob = (fileContents: string | Buffer, fileName?: string) =>
	new File([new Blob([fileContents])], fileName || "fileName.wwe");

describe("ImportProfile", () => {
	beforeEach(() => {
		history.push(importProfileURL);
	});

	it("should render first step", async () => {
		render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();
	});

	it("should go back", async () => {
		const historyMock = vi.spyOn(history, "push").mockReturnValue();

		render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
			{ history },
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();
		expect(screen.getByTestId("SelectFileStep__back")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("SelectFileStep__back"));

		await waitFor(() => expect(historyMock).toHaveBeenCalledWith("/"));
		historyMock.mockRestore();
	});

	it("should change file format", async () => {
		render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
			{ history },
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();

		await userEvent.click(screen.getByTestId(changeFileID));

		await waitFor(() => expect(screen.queryByTestId(changeFileID)).not.toBeInTheDocument());
	});

	it("should select file and go to step 2", async () => {
		render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
			{ history },
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();
		expect(screen.getByTestId("SelectFileStep__back")).toBeInTheDocument();

		fireEvent.drop(browseFiles(), {
			dataTransfer: {
				files: [createBlob(passwordProtectedWwe)],
			},
		});

		await expect(screen.findByTestId("ProcessingImport")).resolves.toBeVisible();
	});

	it("should request and set password for importing password protected profile", async () => {
		render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
			{ history },
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();
		expect(screen.getByTestId("SelectFileStep__back")).toBeInTheDocument();

		fireEvent.drop(browseFiles(), {
			dataTransfer: {
				files: [createBlob(passwordProtectedWwe)],
			},
		});

		await expect(screen.findByTestId("ProcessingImport")).resolves.toBeVisible();
		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await userEvent.type(screen.getByTestId("PasswordModal__input"), validPassword);

		// wait for formState.isValid to be updated
		await expect(screen.findByTestId(submitID)).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId(submitID));

		await waitFor(() => {
			expect(screen.getByTestId("ProfileForm__form")).toBeInTheDocument();
		});
	});

	it("should close password modal and go back to select file", async () => {
		render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
			{ history },
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();
		expect(screen.getByTestId("SelectFileStep__back")).toBeInTheDocument();

		fireEvent.drop(browseFiles(), {
			dataTransfer: {
				files: [createBlob(passwordProtectedWwe)],
			},
		});

		await expect(screen.findByTestId("ProcessingImport")).resolves.toBeVisible();
		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("Modal__close-button"));

		await expect(screen.findByTestId(changeFileID)).resolves.toBeVisible();
	});

	it("should successfully import profile and return to home screen", async () => {
		const historyMock = vi.spyOn(history, "push").mockReturnValue();

		render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
			{ history },
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();
		expect(screen.getByTestId("SelectFileStep__back")).toBeInTheDocument();

		fireEvent.drop(browseFiles(), {
			dataTransfer: {
				files: [createBlob(passwordProtectedWwe)],
			},
		});

		await waitFor(() => {
			expect(screen.getByTestId("ProcessingImport")).toBeVisible();
		});

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await userEvent.type(screen.getByTestId("PasswordModal__input"), validPassword);
		await waitFor(() => expect(screen.getByTestId("PasswordModal__input")).toHaveValue(validPassword));

		await userEvent.click(screen.getByTestId(submitID));

		await expect(screen.findByTestId("ProfileForm__form")).resolves.toBeVisible();

		expect(screen.queryByTestId("InputPassword")).not.toBeInTheDocument();

		await userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => {
			expect(screen.getByTestId("ProfileForm__submit-button")).toBeEnabled();
		});

		await userEvent.click(screen.getByTestId("ProfileForm__submit-button"));

		await waitFor(() => expect(historyMock).toHaveBeenCalledWith("/"));
	});

	it("should successfully import legacy profile and return to home screen", async () => {
		const historyMock = vi.spyOn(history, "push").mockReturnValue();

		render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
			{ history },
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();
		expect(screen.getByTestId("SelectFileStep__back")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId(changeFileID));

		fireEvent.drop(browseFiles(), {
			dataTransfer: {
				files: [createBlob(legacyJson, "legacy-profile.json")],
			},
		});

		await waitFor(() => {
			expect(screen.getByTestId("ProcessingImport")).toBeVisible();
		});

		await expect(screen.findByTestId("ProfileForm__form")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getAllByTestId("Input")[0]).toHaveValue("legacy-profile"));

		await userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => {
			expect(screen.getByTestId("ProfileForm__submit-button")).toBeEnabled();
		});

		await userEvent.click(screen.getByTestId("ProfileForm__submit-button"));

		await waitFor(() => expect(historyMock).toHaveBeenCalledWith("/"));
	});

	it.each([
		["dark", darkThemeWwe],
		["light", lightThemeWwe],
	])("should apply theme setting of imported profile regardless of OS preferences", async (theme, wweFile) => {
		render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
			{ history },
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();
		expect(screen.getByTestId("SelectFileStep__back")).toBeInTheDocument();

		fireEvent.drop(browseFiles(), {
			dataTransfer: {
				files: [createBlob(wweFile)],
			},
		});

		await waitFor(() => {
			expect(screen.getByTestId("ProcessingImport")).toBeVisible();
		});

		await expect(screen.findByTestId("ProfileForm__form")).resolves.toBeVisible();

		const lightButton = screen.getAllByRole("radio")[0];
		const darkButton = screen.getAllByRole("radio")[1];

		if (theme === "dark") {
			expect(lightButton).not.toBeChecked();
			expect(darkButton).toBeChecked();
		} else {
			expect(lightButton).toBeChecked();
			expect(darkButton).not.toBeChecked();
		}
	});

	it("should go to step 3 and back", async () => {
		render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
			{ history },
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();
		expect(screen.getByTestId("SelectFileStep__back")).toBeInTheDocument();

		fireEvent.drop(browseFiles(), {
			dataTransfer: {
				files: [createBlob(passwordProtectedWwe)],
			},
		});

		await waitFor(() => {
			expect(screen.getByTestId("ProcessingImport")).toBeVisible();
		});

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await userEvent.type(screen.getByTestId("PasswordModal__input"), validPassword);

		await waitFor(() => {
			expect(screen.getByTestId("PasswordModal__input")).toHaveValue(validPassword);
		});

		await userEvent.click(screen.getByTestId(submitID));

		await expect(screen.findByTestId("ProfileForm__form")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("ProfileForm__back-button"));

		await expect(screen.findByTestId(changeFileID)).resolves.toBeVisible();
	});

	it("should fail profile import and show error", async () => {
		render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
			{ history },
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();
		expect(screen.getByTestId("SelectFileStep__back")).toBeInTheDocument();

		fireEvent.drop(browseFiles(), {
			dataTransfer: {
				files: [createBlob(corruptedWwe)],
			},
		});

		await expect(screen.findByTestId("ProcessingImport")).resolves.toBeVisible();
		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await userEvent.type(screen.getByTestId("PasswordModal__input"), wrongPassword);

		await waitFor(() => {
			expect(screen.getByTestId("PasswordModal__input")).toHaveValue(wrongPassword);
		});

		await userEvent.click(screen.getByTestId(submitID));

		await expect(screen.findByTestId("ImportError")).resolves.toBeVisible();
	});

	it("should fail profile import and retry", async () => {
		render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
			{ history },
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();
		expect(screen.getByTestId("SelectFileStep__back")).toBeInTheDocument();

		fireEvent.drop(browseFiles(), {
			dataTransfer: {
				files: [createBlob(passwordProtectedWwe)],
			},
		});

		await expect(screen.findByTestId("ProcessingImport")).resolves.toBeVisible();
		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await userEvent.type(screen.getByTestId("PasswordModal__input"), wrongPassword);

		await waitFor(() => {
			expect(screen.getByTestId("PasswordModal__input")).toHaveValue(wrongPassword);
		});

		await userEvent.click(screen.getByTestId(submitID));

		await expect(screen.findByTestId("ImportError")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("ImportError__retry"));

		await expect(screen.findByTestId("ProcessingImport")).resolves.toBeVisible();
	});

	it("should fail profile import and go back to home screen", async () => {
		const historyMock = vi.spyOn(history, "push").mockReturnValue();

		render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
			{ history },
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();
		expect(screen.getByTestId("SelectFileStep__back")).toBeInTheDocument();

		fireEvent.drop(browseFiles(), {
			dataTransfer: {
				files: [createBlob(passwordProtectedWwe)],
			},
		});

		await expect(screen.findByTestId("ProcessingImport")).resolves.toBeVisible();
		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await userEvent.type(screen.getByTestId("PasswordModal__input"), wrongPassword);

		await waitFor(() => {
			expect(screen.getByTestId("PasswordModal__input")).toHaveValue(wrongPassword);
		});

		await userEvent.click(screen.getByTestId(submitID));

		await expect(screen.findByTestId("ImportError")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("ImportError__cancel"));

		await expect(screen.findByTestId("ImportError")).resolves.toBeVisible();

		await waitFor(() => expect(historyMock).toHaveBeenCalledWith("/"));

		historyMock.mockRestore();
	});
});
