import React from "react";

import { Offline } from "./Offline";
import { translations } from "@/domains/error/i18n";
import { render, screen } from "@/utils/testing-library";

describe("Offline", () => {
	it("should render", () => {
		const { container, asFragment } = render(<Offline />);

		expect(container).toBeInTheDocument();
		expect(screen.getByTestId("Offline__text")).toHaveTextContent(translations.OFFLINE.TITLE);
		expect(screen.getByTestId("Offline__text")).toHaveTextContent(translations.OFFLINE.DESCRIPTION);
		expect(asFragment()).toMatchSnapshot();
	});
});
