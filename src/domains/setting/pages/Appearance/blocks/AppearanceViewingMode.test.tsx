import userEvent from "@testing-library/user-event";
import React from "react";
import * as reactHookForm from "react-hook-form";

import { UseFormMethods } from "react-hook-form";
import { AppearanceViewingMode } from "./AppearanceViewingMode";
import { translations } from "@/domains/setting/i18n";
import { render, screen } from "@/utils/testing-library";

vi.mock("react-hook-form");

describe("AppearanceViewingMode", () => {
	it("should render", () => {
		const watch = vi.fn();
		const setValue = vi.fn();

		vi.spyOn(reactHookForm, "useFormContext").mockImplementationOnce(
			() => ({ setValue, watch }) as unknown as UseFormMethods,
		);

		const { asFragment } = render(<AppearanceViewingMode />);

		expect(watch).toHaveBeenCalledWith("viewingMode");
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["light", "dark"])("should allow to change the value", async (viewingMode: string) => {
		const watch = vi.fn();
		const setValue = vi.fn();

		vi.spyOn(reactHookForm, "useFormContext").mockImplementationOnce(
			() => ({ setValue, watch }) as unknown as UseFormMethods,
		);

		render(<AppearanceViewingMode />);

		expect(screen.getAllByRole("radio")).toHaveLength(2);

		const buttonText = translations.APPEARANCE.OPTIONS.VIEWING_MODE.VIEWING_MODES[viewingMode.toUpperCase()];

		await userEvent.click(screen.getByText(buttonText));

		expect(setValue).toHaveBeenCalledWith("viewingMode", viewingMode, {
			shouldDirty: true,
			shouldValidate: true,
		});
	});
});
