import React from "react";

import { LayoutBreakpoint } from "@/types";
import { renderResponsive } from "@/utils/testing-library";

import { Lg, Md, MdAndAbove, Sm, SmAndAbove, SmAndBelow, Xl, Xs } from "./Breakpoint";

const SM_AND_ABOVE = "sm-and-above";

describe("Breakpoint", () => {
	const render = (
		content,
		containerSize: LayoutBreakpoint | "xs" | "sm-and-above",
		breakpoint: LayoutBreakpoint | "xs" | "sm-and-above",
	) => {
		if (containerSize === "xs") {
			return renderResponsive(<Xs>{content}</Xs>, breakpoint);
		}
		if (containerSize === "sm") {
			return renderResponsive(<Sm>{content}</Sm>, breakpoint);
		}
		if (containerSize === "md") {
			return renderResponsive(<Md>{content}</Md>, breakpoint);
		}
		if (containerSize === "lg") {
			return renderResponsive(<Lg>{content}</Lg>, breakpoint);
		}
		if (containerSize === "xl") {
			return renderResponsive(<Xl>{content}</Xl>, breakpoint);
		}

		return renderResponsive(<SmAndAbove>{content}</SmAndAbove>, breakpoint);
	};

	describe("Xs", () => {
		it("should render in xs", () => {
			const { container } = render("Hello!", "xs", "xs");

			expect(container).toHaveTextContent("Hello!");
		});

		it.each(["sm", "md", "lg", "xl", SM_AND_ABOVE])("should not render in xs", (containerSize) => {
			const { container } = render("Hello!", containerSize, "xs");

			expect(container).toBeEmptyDOMElement();
		});
	});

	describe("Sm", () => {
		it.each(["sm", SM_AND_ABOVE])("should render in sm", (containerSize) => {
			const { container } = render("Hello!", containerSize, "sm");

			expect(container).toHaveTextContent("Hello!");
		});

		it.each(["xs", "md", "lg", "xl"])("should not render in sm", (containerSize) => {
			const { container } = render("Hello!", containerSize, "sm");

			expect(container).toBeEmptyDOMElement();
		});
	});

	describe("Md", () => {
		it.each(["md", SM_AND_ABOVE])("should render in md", (containerSize) => {
			const { container } = render("Hello!", containerSize, "md");

			expect(container).toHaveTextContent("Hello!");
		});

		it.each(["xs", "sm", "lg", "xl"])("should not render in md", (containerSize) => {
			const { container } = render("Hello!", containerSize, "md");

			expect(container).toBeEmptyDOMElement();
		});
	});

	describe("Lg", () => {
		it.each(["lg", SM_AND_ABOVE])("should render in lg", (containerSize) => {
			const { container } = render("Hello!", containerSize, "lg");

			expect(container).toHaveTextContent("Hello!");
		});

		it.each(["xs", "sm", "md", "xl"])("should not render in lg", (containerSize) => {
			const { container } = render("Hello!", containerSize, "lg");

			expect(container).toBeEmptyDOMElement();
		});
	});

	describe("Xl", () => {
		it.each(["xl", SM_AND_ABOVE])("should render in xl", (containerSize) => {
			const { container } = render("Hello!", containerSize, "xl");

			expect(container).toHaveTextContent("Hello!");
		});

		it.each(["xs", "sm", "md", "lg"])("should not render in xl", (containerSize) => {
			const { container } = render("Hello!", containerSize, "xl");

			expect(container).toBeEmptyDOMElement();
		});
	});

	describe("MdAndAbove", () => {
		it.each(["md", "lg", "xl"])("should render in %s", (breakpoint) => {
			const { container } = renderResponsive(<MdAndAbove>Content</MdAndAbove>, breakpoint);

			expect(container).toHaveTextContent("Content");
		});

		it.each(["xs", "sm"])("should not render in %s", (breakpoint) => {
			const { container } = renderResponsive(<MdAndAbove>Content</MdAndAbove>, breakpoint);

			expect(container).toBeEmptyDOMElement();
		});
	});

	describe("SmAndBelow", () => {
		it.each(["xs", "sm"])("should render in %s", (breakpoint) => {
			const { container } = renderResponsive(<SmAndBelow>Content</SmAndBelow>, breakpoint);

			expect(container).toHaveTextContent("Content");
		});

		it.each(["md", "lg", "xl"])("should not render in %s", (breakpoint) => {
			const { container } = renderResponsive(<SmAndBelow>Content</SmAndBelow>, breakpoint);

			expect(container).toBeEmptyDOMElement();
		});
	});
});
