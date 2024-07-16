import React from "react";
import { render, screen, renderResponsive } from "@/utils/testing-library";
import { TransactionReviewDetail, TransactionReviewLabelText } from "./TransactionReviewDetail";

describe("TransactionAddresses", () => {
	it.each(["sm", "md", "lg"])("should render TransactionReviewDetail in %s", (breakpoint: string) => {
		renderResponsive(
			<TransactionReviewDetail>
				<div data-testid="content" />
			</TransactionReviewDetail>,
			breakpoint,
		);

		expect(screen.getByTestId("TransactionReviewDetail")).toBeInTheDocument();
		expect(screen.getByTestId("content")).toBeInTheDocument();
	});

	it("should render TransactionReviewDetail ", () => {
		render(
			<TransactionReviewDetail label="label-text">
				{" "}
				<div data-testid="content" />{" "}
			</TransactionReviewDetail>,
		);

		expect(screen.getByTestId("TransactionReviewDetail")).toBeInTheDocument();
		expect(screen.getByTestId("TransactionReviewDetailLabel")).toBeInTheDocument();
		expect(screen.getByTestId("content")).toBeInTheDocument();
		expect(screen.getByText("label-text")).toBeInTheDocument();
	});

	it.each(["sm", "md", "lg"])("should render TransactionReviewLabelText in %s", (breakpoint: string) => {
		renderResponsive(
			<TransactionReviewLabelText>
				<div data-testid="content" />
			</TransactionReviewLabelText>,
			breakpoint,
		);

		expect(screen.getByTestId("TransactionReviewLabelText")).toBeInTheDocument();
		expect(screen.getByTestId("content")).toBeInTheDocument();
	});
});
