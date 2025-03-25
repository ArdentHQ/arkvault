import userEvent from "@testing-library/user-event";
import React from "react";
import { render, screen, fireEvent } from "@/utils/testing-library";
import { TruncatedWithTooltip } from "./TruncatedWithTooltip";

describe("TruncatedWithTooltip", () => {
	it("should truncate text when it overflows", () => {
		render(
			<div style={{ width: "100px" }}>
				<TruncatedWithTooltip text="ASuusXSW9kfWnicScSgUTjttP6T9GQ3kqT" />
			</div>,
		);

		const span = screen.getByText("ASuusXSW9kfWnicScSgUTjttP6T9GQ3kqT");
		expect(span).toHaveClass("truncate");
		expect(span).toHaveTextContent("ASuusXSW9kfWnicScSgUTjttP6T9GQ3kqT");
	});

	it("should not truncate text when it does not overflow", () => {
		render(
			<div style={{ width: "500px" }}>
				<TruncatedWithTooltip text="Short text" />
			</div>,
		);

		const span = screen.getByText("Short text");
		expect(span).toHaveTextContent("Short text");
	});

	it("should show tooltip when text is truncated", async () => {
		const { baseElement } = render(
			<div style={{ width: "100px" }}>
				<TruncatedWithTooltip text="ASuusXSW9kfWnicScSgUTjttP6T9GQ3kqT" />
			</div>,
		);

		const span = screen.getByText("ASuusXSW9kfWnicScSgUTjttP6T9GQ3kqT");
		await userEvent.hover(span);

		expect(baseElement).toHaveTextContent("ASuusXSW9kfWnicScSgUTjttP6T9GQ3kqT");
	});

	it("should not show tooltip when text is not truncated", async () => {
		const { baseElement } = render(
			<div style={{ width: "500px" }}>
				<TruncatedWithTooltip text="Short text" />
			</div>,
		);

		const span = screen.getByText("Short text");
		await userEvent.hover(span);

		expect(baseElement.querySelector(".tooltip")).toBeNull();
	});

	it("should update truncation on resize", () => {
		render(
			<div style={{ width: "100px" }}>
				<TruncatedWithTooltip text="ASuusXSW9kfWnicScSgUTjttP6T9GQ3kqT" />
			</div>,
		);

		const span = screen.getByText("ASuusXSW9kfWnicScSgUTjttP6T9GQ3kqT");
		expect(span).toHaveClass("truncate");

		fireEvent(window, new Event("resize"));

		expect(span).toHaveTextContent("ASuusXSW9kfWnicScSgUTjttP6T9GQ3kqT");
	});
});
