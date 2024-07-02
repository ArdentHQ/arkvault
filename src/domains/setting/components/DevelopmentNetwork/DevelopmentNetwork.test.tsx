import React from "react";

import { translations } from "@/domains/setting/i18n";
import { render, screen } from "@/utils/testing-library";

import { DevelopmentNetwork } from "./DevelopmentNetwork";

describe("DevelopmentNetwork", () => {
	const methods = {
		onCancel: vi.fn(),
		onClose: vi.fn(),
		onContinue: vi.fn(),
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
