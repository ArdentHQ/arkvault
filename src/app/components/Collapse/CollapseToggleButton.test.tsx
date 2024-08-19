import userEvent from "@testing-library/user-event";
import React from "react";

import { CollapseToggleButton } from "./CollapseToggleButton";
import { translations } from "@/app/i18n/common/i18n";
import { render, screen } from "@/utils/testing-library";

describe("CollapseToggleButton", () => {
	it("should render", async () => {
		const onClick = vi.fn();

		render(<CollapseToggleButton isOpen={false} onClick={onClick} />);

		const button = screen.getByTestId("CollapseToggleButton");

		expect(button).toHaveTextContent(translations.SHOW);

		await userEvent.click(button);

		expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should render open", () => {
		render(<CollapseToggleButton isOpen={true} />);

		const button = screen.getByTestId("CollapseToggleButton");

		expect(button).toHaveTextContent(translations.HIDE);
	});

	it("should render disabled", () => {
		const { container } = render(<CollapseToggleButton isOpen={true} disabled />);

		expect(container).toMatchSnapshot();
	});
});
