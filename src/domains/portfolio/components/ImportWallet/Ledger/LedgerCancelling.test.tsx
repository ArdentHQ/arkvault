import { render, screen } from "@/utils/testing-library";
import { it, describe, expect } from "vitest";
import { LedgerCancelling } from "./LedgerCancelling";

describe("LedgerCancelling", () => {
	it("should render", () => {
		render(<LedgerCancelling />);
		expect(screen.getByTestId("LedgerCancellingScreen")).toBeInTheDocument();
	});
});
