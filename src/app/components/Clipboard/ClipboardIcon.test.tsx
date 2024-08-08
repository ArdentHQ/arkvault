import userEvent from "@testing-library/user-event";
import React from "react";

import { Clipboard } from "./Clipboard";
import { translations } from "@/app/i18n/common/i18n";
import { render, screen, waitFor } from "@/utils/testing-library";

describe("ClipboardIcon", () => {
	beforeAll(() => {
		(navigator as any).clipboard = {
			writeText: vi.fn().mockResolvedValue("test"),
		};
	});

	afterAll(() => {
		(navigator as any).clipboard.writeText.mockRestore();
	});

	it("should render with tooltip in the dark mode", async () => {
		render(
			<Clipboard variant="icon" data="" tooltipDarkTheme>
				<span>Hello!</span>
			</Clipboard>,
		);

		await userEvent.hover(screen.getByTestId("clipboard-icon__wrapper"));

		expect(screen.getByRole("tooltip")).toHaveAttribute("data-theme", "dark");
	});

	it("should change the tooltip content when clicked", async () => {
		const { baseElement } = render(
			<Clipboard variant="icon" data="">
				<span>Hello!</span>
			</Clipboard>,
		);

		await userEvent.hover(screen.getByTestId("clipboard-icon__wrapper"));

		expect(baseElement).toHaveTextContent(translations.CLIPBOARD.TOOLTIP_TEXT);
		expect(baseElement).not.toHaveTextContent(translations.CLIPBOARD.SUCCESS);

		await userEvent.click(screen.getByTestId("clipboard-icon__wrapper"));

		await waitFor(() => expect(baseElement).not.toHaveTextContent(translations.CLIPBOARD.TOOLTIP_TEXT));

		expect(baseElement).toHaveTextContent(translations.CLIPBOARD.SUCCESS);
	});
});
