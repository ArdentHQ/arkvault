import React from "react";

import { render, screen } from "@/utils/testing-library";

import { MiddleTruncator } from "./MiddleTruncator";
import { MiddleTruncation } from "./MiddleTruncation";

vi.mock("./MiddleTruncator", () => ({
	MiddleTruncator: {
		ELLIPSIS: "...",
		truncate: vi.fn(),
	},
}));

const mockTruncate = MiddleTruncator.truncate as ReturnType<typeof vi.fn>;

const TEXT = "Hello";

beforeEach(() => {
	mockTruncate.mockClear();
});

describe("MiddleTruncation", () => {
	it("renders the full text when it fits", () => {
		mockTruncate.mockReturnValue(TEXT);

		render(<MiddleTruncation>{TEXT}</MiddleTruncation>);
		expect(screen.getByText(TEXT)).toBeInTheDocument();
	});

	it("uses additional HTML props", () => {
		mockTruncate.mockReturnValue(TEXT);

		render(
			<MiddleTruncation data-testid="my-address" aria-label="Address">
				{TEXT}
			</MiddleTruncation>,
		);
		const span = screen.getByTestId("my-address");
		expect(span).toHaveAttribute("aria-label", "Address");
	});
});
