import React from "react";

import { DevelopmentNetwork } from "./DevelopmentNetwork";
import { translations } from "@/domains/setting/i18n";
import { render, screen } from "@/utils/testing-library";

describe("DevelopmentNetwork", () => {
	const methods = {
		onCancel: jest.fn(),
		onClose: jest.fn(),
		onContinue: jest.fn(),
	};

	it("should not render if not open", () => {
		const { asFragment } = render(<DevelopmentNetwork isOpen={false} {...methods} />);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a modal", () => {
		const { asFragment } = render(<DevelopmentNetwork isOpen={true} {...methods} />);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_DEVELOPMENT_NETWORK.TITLE);
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(
			translations.MODAL_DEVELOPMENT_NETWORK.DESCRIPTION,
		);
		expect(asFragment()).toMatchSnapshot();
	});
});
