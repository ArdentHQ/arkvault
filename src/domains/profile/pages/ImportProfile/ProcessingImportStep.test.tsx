import fs from "fs";
import { Profile } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { translations } from "@/domains/profile/i18n";
import { ProcessingImport } from "@/domains/profile/pages/ImportProfile/ProcessingImportStep";
import { env, render, screen, waitFor } from "@/utils/testing-library";

let wwe: any;
let passwordProtectedWwe: any;
let json: any;
let jsonEmpty: any;

const submitID = "PasswordModal__submit-button";

describe("Import Profile - Processing import", () => {
	beforeAll(() => {
		const jsonEmptyContent = fs.readFileSync("src/tests/fixtures/profile/import/d2_test_wallets-empty.json");
		const jsonContent = fs.readFileSync("src/tests/fixtures/profile/import/d2_test_wallets.json");
		const wweFileContents = fs.readFileSync("src/tests/fixtures/profile/import/profile.wwe");
		const passwordProtectedWweFileContents = fs.readFileSync(
			"src/tests/fixtures/profile/import/password-protected-profile.wwe",
		);

		wwe = { content: wweFileContents.toString(), extension: "wwe", name: "profile.wwe" };
		passwordProtectedWwe = {
			content: passwordProtectedWweFileContents.toString(),
			extension: "wwe",
			name: "export",
		};

		json = { content: jsonContent.toString(), extension: "json", name: "export" };
		jsonEmpty = { content: jsonEmptyContent.toString(), extension: "json", name: "export" };
	});

	it("should not run import process if file is not provided", () => {
		render(<ProcessingImport env={env} />);

		expect(screen.queryByTestId("FilePreviewPlain")).not.toBeInTheDocument();
	});

	it("should successfully import wwe profile", async () => {
		const onSuccess = vi.fn();
		render(<ProcessingImport env={env} file={wwe} onSuccess={onSuccess} />);
		await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(expect.any(Profile)));

		expect(screen.queryByTestId("FilePreviewPlain__Success")).not.toBeInTheDocument();
	});

	it("should successfully import json profile", async () => {
		const onSuccess = vi.fn();
		render(<ProcessingImport env={env} file={json} onSuccess={onSuccess} />);
		await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(expect.any(Profile)));

		expect(screen.queryByTestId("FilePreviewPlain__Success")).not.toBeInTheDocument();
	});

	it("should require password for password-protected profile import", async () => {
		const onPasswordChange = vi.fn();

		const { container } = render(
			<ProcessingImport env={env} file={passwordProtectedWwe} onPasswordChange={onPasswordChange} />,
		);

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		userEvent.type(screen.getByTestId("PasswordModal__input"), "S3cUrePa$sword");

		await expect(screen.findByTestId(submitID)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId(submitID));

		await waitFor(() => expect(onPasswordChange).toHaveBeenCalledWith("S3cUrePa$sword"));

		expect(screen.queryByTestId("FilePreviewPlain__Success")).not.toBeInTheDocument();
	});

	it("should emit onBack when password modal is closed", async () => {
		const onBack = vi.fn();
		const onPasswordChange = vi.fn();

		render(
			<ProcessingImport
				env={env}
				file={passwordProtectedWwe}
				onBack={onBack}
				onPasswordChange={onPasswordChange}
			/>,
		);

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("Modal__close-button"));

		await waitFor(() => expect(onBack).toHaveBeenCalledWith());

		expect(onPasswordChange).toHaveBeenCalledWith(undefined);
	});

	it("should enter password again", async () => {
		const onPasswordChange = vi.fn();

		const { container } = render(
			<ProcessingImport
				env={env}
				file={passwordProtectedWwe}
				onPasswordChange={onPasswordChange}
				password="test"
				shouldRequestPassword
			/>,
		);

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("PasswordModal__input"), "invalid");

		await expect(screen.findByTestId(submitID)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId(submitID));

		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());

		await waitFor(() => {
			expect(container).toHaveTextContent(translations.IMPORT.PROCESSING_IMPORT_STEP.ERROR);
		});
	});

	it("should show error if json import has an error", async () => {
		const { container } = render(<ProcessingImport env={env} file={jsonEmpty} />);

		await waitFor(() => {
			expect(container).toHaveTextContent(translations.IMPORT.PROCESSING_IMPORT_STEP.ERROR);
		});
	});

	it("should handle import error", async () => {
		const { container } = render(
			<ProcessingImport
				env={env}
				file={{ content: "corrupted format", extension: "wwe", name: "test.wwe" }}
				password="test"
			/>,
		);

		await waitFor(() => {
			expect(container).toHaveTextContent(translations.IMPORT.PROCESSING_IMPORT_STEP.ERROR);
		});
	});
});
