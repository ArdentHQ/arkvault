/* eslint-disable @typescript-eslint/require-await */
import userEvent from "@testing-library/user-event";
import React from "react";

import { Clipboard } from "./Clipboard";
import { render, screen, waitFor } from "@/utils/testing-library";

const clipboardCheckmarkID = "clipboard-button__checkmark";

describe("ClipboardButton", () => {
	beforeAll(() => {
		(navigator as any).clipboard = {
			writeText: vi.fn().mockResolvedValue("test"),
		};
	});

	afterAll(() => {
		(navigator as any).clipboard.writeText.mockRestore();
	});

	it("should show checkmark when clicked", async () => {
		render(
			<Clipboard variant="button" data="">
				<span>Hello!</span>
			</Clipboard>,
		);

		expect(screen.queryByTestId(clipboardCheckmarkID)).not.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("clipboard-button__wrapper"));

		await expect(screen.findByTestId(clipboardCheckmarkID)).resolves.toBeInTheDocument();
	});

	it("should hide checkmark", async () => {
		render(
			<Clipboard variant="button" data="">
				<span>Hello!</span>
			</Clipboard>,
		);

		expect(screen.queryByTestId(clipboardCheckmarkID)).not.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("clipboard-button__wrapper"));

		await expect(screen.findByTestId(clipboardCheckmarkID)).resolves.toBeInTheDocument();

		await waitFor(() => expect(screen.queryByTestId(clipboardCheckmarkID)).not.toBeInTheDocument(), {
			timeout: 2000,
		});
	});
});
