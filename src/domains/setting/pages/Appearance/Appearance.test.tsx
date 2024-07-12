/* eslint-disable @typescript-eslint/require-await */
import { camelCase } from "@ardenthq/sdk-helpers";
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Route } from "react-router-dom";

import { AppearanceSettings } from "./Appearance";
import { toasts } from "@/app/services";
import { translations } from "@/domains/setting/i18n";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	waitFor,
	within,
	renderResponsiveWithRoute,
} from "@/utils/testing-library";

describe("Appearance Settings", () => {
	let profile: Contracts.IProfile;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();
	});

	const renderPage = (showSupportChat = false) =>
		render(
			<Route path="/profiles/:profileId/settings/:activeSetting" element={
				<>
					<AppearanceSettings />
					{showSupportChat && <div id="webWidget" />}
				</>
			}>

			</Route>,
			{
				route: `/profiles/${profile.id()}/settings/appearance`,
			},
		);

	it("should render appearance settings", () => {
		const { asFragment } = renderPage();

		expect(screen.getAllByRole("radiogroup")).toHaveLength(2);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should reset support chat widget after saving", async () => {
		const toastSuccess = vi.spyOn(toasts, "success");

		renderPage(true);

		const darkButton = within(screen.getAllByRole("radiogroup")[1]).getAllByRole("radio")[1];

		userEvent.click(darkButton);

		await waitFor(() => {
			expect(darkButton).toBeChecked();
		});

		await waitFor(() => {
			expect(screen.getByTestId("AppearanceFooterButtons__save")).toBeEnabled();
		});

		userEvent.click(screen.getByTestId("AppearanceFooterButtons__save"));

		await waitFor(() => {
			expect(profile.settings().get(Contracts.ProfileSetting.Theme)).toBe("light");
		});

		await waitFor(() => {
			expect(toastSuccess).toHaveBeenCalledWith(translations.GENERAL.SUCCESS);
		});
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should return items to render in the form in %s", (breakpoint) => {
		const { asFragment } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/settings/:activeSetting" element={<AppearanceSettings />}>

			</Route>,
			breakpoint,
			{
				route: `/profiles/${profile.id()}/settings/appearance`,
			},
		);

		expect(asFragment).toMatchSnapshot();
	});

	it("should allow to change the accent color", async () => {
		const toastSuccess = vi.spyOn(toasts, "success");

		renderPage();

		const navyRadioButton = screen.getByLabelText(translations.APPEARANCE.OPTIONS.ACCENT_COLOR.COLORS.NAVY);

		expect(navyRadioButton).not.toBeChecked();
		expect(profile.settings().get(Contracts.ProfileSetting.AccentColor)).not.toBe("navy");

		expect(screen.getByTestId("AppearanceFooterButtons__save")).toBeDisabled();

		userEvent.click(navyRadioButton);

		await waitFor(() => {
			expect(navyRadioButton).toBeChecked();
		});

		expect(profile.settings().get(Contracts.ProfileSetting.AccentColor)).not.toBe("navy");

		expect(screen.getByTestId("AppearanceFooterButtons__save")).toBeEnabled();

		userEvent.click(screen.getByTestId("AppearanceFooterButtons__save"));

		await waitFor(() => {
			expect(profile.settings().get(Contracts.ProfileSetting.AccentColor)).toBe("navy");
		});

		await waitFor(() => {
			expect(toastSuccess).toHaveBeenCalledWith(translations.GENERAL.SUCCESS);
		});
	});

	it("should allow to change the viewing mode", async () => {
		const toastSuccess = vi.spyOn(toasts, "success");

		profile.settings().set(Contracts.ProfileSetting.Theme, "light");

		renderPage();

		const lightButton = within(screen.getAllByRole("radiogroup")[1]).getAllByRole("radio")[0];
		const darkButton = within(screen.getAllByRole("radiogroup")[1]).getAllByRole("radio")[1];

		expect(lightButton).toHaveAttribute("aria-label", "light");
		expect(darkButton).toHaveAttribute("aria-label", "dark");

		expect(lightButton).toBeChecked();

		expect(profile.settings().get(Contracts.ProfileSetting.Theme)).not.toBe("dark");

		userEvent.click(darkButton);

		await waitFor(() => {
			expect(darkButton).toBeChecked();
		});

		expect(profile.settings().get(Contracts.ProfileSetting.Theme)).not.toBe("dark");

		expect(screen.getByTestId("AppearanceFooterButtons__save")).toBeEnabled();

		userEvent.click(screen.getByTestId("AppearanceFooterButtons__save"));

		await waitFor(() => {
			expect(profile.settings().get(Contracts.ProfileSetting.Theme)).toBe("dark");
		});

		await waitFor(() => {
			expect(toastSuccess).toHaveBeenCalledWith(translations.GENERAL.SUCCESS);
		});
	});

	it.each([
		Contracts.ProfileSetting.DashboardTransactionHistory,
		Contracts.ProfileSetting.UseNetworkWalletNames,
		Contracts.ProfileSetting.UseExpandedTables,
	])("should allow to toggle %s setting", async (key) => {
		const toastSuccess = vi.spyOn(toasts, "success");

		profile.settings().set(key, true);

		renderPage();

		const toggleTestId = `AppearanceToggle__toggle-${camelCase(key)}`;

		expect(screen.getByTestId(toggleTestId)).toBeChecked();
		expect(profile.settings().get(key)).toBe(true);

		userEvent.click(screen.getByTestId(toggleTestId));

		await waitFor(() => {
			expect(screen.getByTestId(toggleTestId)).not.toBeChecked();
		});

		expect(profile.settings().get(key)).toBe(true);

		expect(screen.getByTestId("AppearanceFooterButtons__save")).toBeEnabled();

		userEvent.click(screen.getByTestId("AppearanceFooterButtons__save"));

		await waitFor(() => {
			expect(profile.settings().get(key)).toBe(false);
		});

		await waitFor(() => {
			expect(toastSuccess).toHaveBeenCalledWith(translations.GENERAL.SUCCESS);
		});
	});
});
