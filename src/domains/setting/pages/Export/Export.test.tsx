/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Route } from "react-router-dom";
import * as browserAccess from "browser-fs-access";

import { renderHook } from "@testing-library/react";
import { useTranslation, Trans } from "react-i18next";
import ExportSettings from "@/domains/setting/pages/Export";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";
import { toasts } from "@/app/services";

let profile: Contracts.IProfile;

describe("Export Settings", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should render export settings", async () => {
		const { container, asFragment } = render(
			<Route path="/profiles/:profileId/settings/export">
				<ExportSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings/export`,
			},
		);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should export data", async () => {
		const browserAccessMock = vi
			.spyOn(browserAccess, "fileSave")
			// @ts-ignore
			.mockResolvedValue({ name: "test.wwe" });

		const { container } = render(
			<Route path="/profiles/:profileId/settings/export">
				<ExportSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings/export`,
				withProfileSynchronizer: true,
			},
		);

		expect(container).toBeInTheDocument();

		await userEvent.click(await screen.findByTestId("Export-settings__submit-button"));

		await waitFor(() =>
			expect(browserAccessMock).toHaveBeenCalledWith(expect.any(Blob), {
				description: "Web Wallet Export",
				extensions: [".wwe"],
				fileName: `profile-${profile.id()}.wwe`,
			}),
		);

		browserAccessMock.mockRestore();
	});

	it("should show toast message for successful download if browser supports SaveFilePicker", async () => {
		const toastSpy = vi.spyOn(toasts, "success").mockImplementation(vi.fn());

		Object.defineProperty(window, "showSaveFilePicker", vi.fn());

		const browserAccessMock = vi
			.spyOn(browserAccess, "fileSave")
			// @ts-ignore
			.mockResolvedValue({ name: "test.wwe" });

		const { container } = render(
			<Route path="/profiles/:profileId/settings/export">
				<ExportSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings/export`,
				withProfileSynchronizer: true,
			},
		);

		expect(container).toBeInTheDocument();

		await userEvent.click(await screen.findByTestId("Export-settings__submit-button"));

		await waitFor(() => {
			expect(toastSpy).toHaveBeenCalledWith(
				<Trans i18nKey="COMMON.SAVE_FILE.SUCCESS" values={{ filePath: "test.wwe" }} />,
			);
		});

		toastSpy.mockRestore();
		browserAccessMock.mockRestore();
	});

	it("should not export data or show error on cancelled download", async () => {
		const toastSpy = vi.spyOn(toasts, "error").mockImplementation(vi.fn());

		const browserAccessMock = vi.spyOn(browserAccess, "fileSave").mockImplementation(() => {
			throw new Error("The user aborted a request");
		});

		const { container } = render(
			<Route path="/profiles/:profileId/settings/export">
				<ExportSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings/export`,
				withProfileSynchronizer: true,
			},
		);

		expect(container).toBeInTheDocument();

		await userEvent.click(await screen.findByTestId("Export-settings__submit-button"));

		await waitFor(() => {
			expect(toastSpy).not.toHaveBeenCalled();
		});

		toastSpy.mockRestore();
		browserAccessMock.mockRestore();
	});

	it("should show error toast for unexpected error", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const toastSpy = vi.spyOn(toasts, "error").mockImplementation(vi.fn());

		const browserAccessMock = vi.spyOn(browserAccess, "fileSave").mockImplementation(() => {
			throw new Error("unexpected error");
		});

		const { container } = render(
			<Route path="/profiles/:profileId/settings/export">
				<ExportSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings/export`,
				withProfileSynchronizer: true,
			},
		);

		expect(container).toBeInTheDocument();

		await userEvent.click(await screen.findByTestId("Export-settings__submit-button"));

		await waitFor(() => {
			expect(toastSpy).toHaveBeenCalledWith(t("COMMON.SAVE_FILE.ERROR", { error: "unexpected error" }));
		});

		toastSpy.mockRestore();
		browserAccessMock.mockRestore();
	});
});
