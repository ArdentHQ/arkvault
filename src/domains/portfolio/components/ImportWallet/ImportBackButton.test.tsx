import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ImportBackButton } from "./ImportAddressSidePanel.blocks";

describe("ImportBackButton", () => {
	it("should not render when onBack is not provided", () => {
		const { container } = render(<ImportBackButton />);
		expect(screen.queryByTestId("ImportWallet__back-button")).not.toBeInTheDocument();
	});

	it("should not render when showBack is false", () => {
		const onBack = vi.fn();
		render(<ImportBackButton onBack={onBack} showBack={false} />);
		expect(screen.queryByTestId("ImportWallet__back-button")).not.toBeInTheDocument();
	});

	it("should call onBack when clicked", () => {
		const onBack = vi.fn();
		render(<ImportBackButton onBack={onBack} showBack={true} />);

		const button = screen.getByTestId("ImportWallet__back-button");
		fireEvent.click(button);

		expect(onBack).toHaveBeenCalledTimes(1);
	});

	it("should render with correct text", () => {
		render(<ImportBackButton onBack={vi.fn()} showBack={true} />);

		expect(screen.getByTestId("ImportWallet__back-button")).toHaveTextContent("Back");
	});
});
