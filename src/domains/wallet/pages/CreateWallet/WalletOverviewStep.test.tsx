/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import userEvent from "@testing-library/user-event";
import * as browserAccess from "browser-fs-access";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Trans } from "react-i18next";

import { WalletOverviewStep } from "./WalletOverviewStep";
import { toasts } from "@/app/services";
import { env, getDefaultProfileId, MNEMONICS, render, screen, waitFor } from "@/utils/testing-library";

let profile: Contracts.IProfile;

const renderForm = () =>
	renderHook(() =>
		useForm({
			defaultValues: {
				mnemonic: MNEMONICS[0],
				wallet: {
					address: () => "address",
				},
			},
		}),
	);

describe("WalletOverviewStep", () => {
	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());

		for (const wallet of profile.wallets().values()) {
			profile.wallets().forget(wallet.id());
		}
	});

	describe("Render step", () => {
		it("should render", async () => {
			const { result: form } = renderForm();

			const browserAccessMock = vi
				.spyOn(browserAccess, "fileSave")
				// @ts-ignore
				.mockResolvedValue({ name: "filePath" });

			render(
				<FormProvider {...form.current}>
					<WalletOverviewStep />
				</FormProvider>,
			);

			expect(screen.getByTestId("CreateWallet__WalletOverviewStep")).toBeInTheDocument();

			const writeTextMock = vi.fn();
			const clipboardOriginal = navigator.clipboard;
			// @ts-ignore
			navigator.clipboard = { writeText: writeTextMock };

			userEvent.click(screen.getByTestId("clipboard-icon__wrapper"));

			await waitFor(() => expect(writeTextMock).toHaveBeenCalledWith(MNEMONICS[0]));

			// @ts-ignore
			navigator.clipboard = clipboardOriginal;

			browserAccessMock.mockRestore();
		});

		it("should download file if legacy", async () => {
			const { result: form } = renderForm();

			const browserAccessMock = vi
				.spyOn(browserAccess, "fileSave")
				// @ts-ignore
				.mockResolvedValue({ name: "filePath" });

			const toastSpy = vi.spyOn(toasts, "success");

			render(
				<FormProvider {...form.current}>
					<WalletOverviewStep />
				</FormProvider>,
			);

			userEvent.click(screen.getByTestId("CopyOrDownload__download"));

			await waitFor(() => {
				expect(toastSpy).not.toHaveBeenCalledWith(
					<Trans i18nKey="COMMON.SAVE_FILE.SUCCESS" values={{ filePath: "filePath" }} />,
				);
			});

			toastSpy.mockRestore();
			browserAccessMock.mockRestore();
		});

		it("should show success toast on successful download", async () => {
			Object.defineProperty(window, "showSaveFilePicker", vi.fn());

			const { result: form } = renderForm();

			const browserAccessMock = vi
				.spyOn(browserAccess, "fileSave")
				// @ts-ignore
				.mockResolvedValue({ name: "filePath" });

			const toastSpy = vi.spyOn(toasts, "success");

			render(
				<FormProvider {...form.current}>
					<WalletOverviewStep />
				</FormProvider>,
			);

			userEvent.click(screen.getByTestId("CopyOrDownload__download"));

			await waitFor(() => {
				expect(toastSpy).toHaveBeenCalledWith(
					<Trans i18nKey="COMMON.SAVE_FILE.SUCCESS" values={{ filePath: "filePath" }} />,
				);
			});

			toastSpy.mockRestore();
			browserAccessMock.mockRestore();
		});

		it("should not show success toast on cancelled download", async () => {
			const { result: form } = renderForm();

			const browserAccessMock = vi
				.spyOn(browserAccess, "fileSave")
				.mockRejectedValue(new Error("The user aborted a request"));

			const toastSpy = vi.spyOn(toasts, "success");

			render(
				<FormProvider {...form.current}>
					<WalletOverviewStep />
				</FormProvider>,
			);

			userEvent.click(screen.getByTestId("CopyOrDownload__download"));

			expect(toastSpy).not.toHaveBeenCalled();

			toastSpy.mockRestore();
			browserAccessMock.mockRestore();
		});

		it("should show error toast on error", async () => {
			const { result: form } = renderForm();

			const browserAccessMock = vi.spyOn(browserAccess, "fileSave").mockRejectedValue(new Error("Error"));

			const toastSpy = vi.spyOn(toasts, "error");

			render(
				<FormProvider {...form.current}>
					<WalletOverviewStep />
				</FormProvider>,
			);

			userEvent.click(screen.getByTestId("CopyOrDownload__download"));

			await waitFor(() => {
				expect(toastSpy).toHaveBeenCalledWith(expect.stringMatching(/Could not save/));
			});

			toastSpy.mockRestore();
			browserAccessMock.mockRestore();
		});
	});
});
