import React from "react";
import { render, screen, renderResponsive } from "@/utils/testing-library";
import { DetailWrapper, DetailLabelText } from "./DetailWrapper";

describe("DetailWrapper", () => {
	it.each(["sm", "md", "lg"])("should render DetailWrapper in %s", (breakpoint: string) => {
		renderResponsive(
			<DetailWrapper>
				<div data-testid="content" />
			</DetailWrapper>,
			breakpoint,
		);

		expect(screen.getByTestId("DetailWrapper")).toBeInTheDocument();
		expect(screen.getByTestId("content")).toBeInTheDocument();
	});

	it("should render DetailWrapper ", () => {
		render(
			<DetailWrapper label="label-text">
				{" "}
				<div data-testid="content" />{" "}
			</DetailWrapper>,
		);

		expect(screen.getByTestId("DetailWrapper")).toBeInTheDocument();
		expect(screen.getByTestId("DetailLabel")).toBeInTheDocument();
		expect(screen.getByTestId("content")).toBeInTheDocument();
		expect(screen.getByText("label-text")).toBeInTheDocument();
	});

	it.each(["sm", "md", "lg"])("should render DetailLabelText in %s", (breakpoint: string) => {
		renderResponsive(
			<DetailLabelText>
				<div data-testid="content" />
			</DetailLabelText>,
			breakpoint,
		);

		expect(screen.getByTestId("DetailLabelText")).toBeInTheDocument();
		expect(screen.getByTestId("content")).toBeInTheDocument();
	});
});
