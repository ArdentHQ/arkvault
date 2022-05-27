import userEvent from "@testing-library/user-event";
import React from "react";
import * as reactHookForm from "react-hook-form";

import { UseFormMethods } from "react-hook-form";
import { AppearanceAccentColor } from "./AppearanceAccentColor";
import { translations } from "@/domains/setting/i18n";
import { render, screen } from "@/utils/testing-library";

describe("AppearanceAccentColor", () => {
	it("should render", () => {
		const watch = jest.fn();
		const setValue = jest.fn();

		jest.spyOn(reactHookForm, "useFormContext").mockImplementationOnce(
			() => ({ setValue, watch } as unknown as UseFormMethods),
		);

		const { asFragment } = render(<AppearanceAccentColor />);

		expect(watch).toHaveBeenCalledWith("accentColor");
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["blue", "green"])("should allow to change the value", (color: string) => {
		const watch = jest.fn();
		const setValue = jest.fn();

		jest.spyOn(reactHookForm, "useFormContext").mockImplementationOnce(
			() => ({ setValue, watch } as unknown as UseFormMethods),
		);

		render(<AppearanceAccentColor />);

		expect(screen.getAllByRole("radio")).toHaveLength(2);

		const ariaLabel = translations.APPEARANCE.OPTIONS.ACCENT_COLOR.COLORS[color.toUpperCase()];

		userEvent.click(screen.getByLabelText(ariaLabel));

		expect(setValue).toHaveBeenCalledWith("accentColor", color, {
			shouldDirty: true,
			shouldValidate: true,
		});
	});
});
