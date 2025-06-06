import React from "react";

import { Image } from "./Image";
import { renderWithoutRouter } from "@/utils/testing-library";
import * as theme from "@/utils/theme";

describe("Image", () => {
	it("should render", () => {
		const { container, asFragment } = renderWithoutRouter(<Image name="WelcomeBanner" />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with domain", () => {
		const { container, asFragment } = renderWithoutRouter(<Image name="GenericError" domain="error" />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render in dim mode", () => {
		const useThemeMock = vi.spyOn(theme, "shouldUseDimColors").mockReturnValue(true);
		const { container } = renderWithoutRouter(<Image name="GenericError" domain="error" />);

		expect(container).toBeInTheDocument();
		useThemeMock.mockRestore();
	});

	it("should render in dark mode", () => {
		const useThemeMock = vi.spyOn(theme, "shouldUseDarkColors").mockReturnValue(true);
		const { container, asFragment } = renderWithoutRouter(<Image name="GenericError" domain="error" />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
		useThemeMock.mockRestore();
	});

	it("should render nothing if image can't be found", () => {
		const { container, asFragment } = renderWithoutRouter(<Image name="NotExistingImage" />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with string", () => {
		const { container, asFragment } = renderWithoutRouter(<Image name="WelcomeModalStep1" domain="profile" />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
