import React from "react";

import { Icon, ThemeIcon } from "./Icon";
import { render, screen } from "@/utils/testing-library";
import * as themeFns from "@/utils/theme";
import { useAccentColor } from "@/app/hooks";

describe("Icon", () => {
	it("should render", () => {
		const { container, asFragment } = render(<Icon name="ARK" />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render fallback", () => {
		const { asFragment } = render(<Icon name="unknown" fallback={<span>Not found</span>} />);

		expect(screen.getByText("Not found")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with custom dimensions", () => {
		const { asFragment } = render(<Icon dimensions={[20, 20]} name="ARK" />);

		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["sm", "md", "lg", "xl"])("should render with size '%s'", (size) => {
		const { asFragment } = render(<Icon name="ARK" size={size} />);

		expect(asFragment).toMatchSnapshot();
	});
});

describe("ThemeIcon", () => {
	it.each([
		[true, "DarkIcon"],
		[false, "LightIcon"],
	])("should render right icon for theme - isDark: %s", (isDarkMode, testId) => {
		const shouldUseDarkColorsMock = vi.spyOn(themeFns, "shouldUseDarkColors").mockReturnValue(isDarkMode);

		render(<ThemeIcon darkIcon="DarkIcon" lightIcon="LightIcon" />);

		expect(screen.getByTestId(`icon-${testId}`)).toBeInTheDocument();

		shouldUseDarkColorsMock.mockRestore();
	});

	// should render green icons for green theme
	it.each([
		[true, "GreenDarkIcon"],
		[false, "GreenLightIcon"],
	])("should render right icon for theme - isDark: %s", (isDarkMode, testId) => {
		const { setAccentColor } = useAccentColor();
		const shouldUseDarkColorsMock = vi.spyOn(themeFns, "shouldUseDarkColors").mockReturnValue(isDarkMode);

		setAccentColor("green");

		render(
			<ThemeIcon
				darkIcon="DarkIcon"
				lightIcon="LightIcon"
				greenDarkIcon="GreenDarkIcon"
				greenLightIcon="GreenLightIcon"
			/>,
		);

		expect(screen.getByTestId(`icon-${testId}`)).toBeInTheDocument();

		setAccentColor("navy");

		shouldUseDarkColorsMock.mockRestore();
	});
});
