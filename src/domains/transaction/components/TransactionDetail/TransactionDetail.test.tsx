import React from "react";

import { TransactionDetail } from "./TransactionDetail";
import { render, screen, renderResponsive } from "@/utils/testing-library";

describe("TransactionDetail", () => {
	it.each(["md", "lg", "xl"])("should render in %s desktop screen", (breakpoint) => {
		const { container } = renderResponsive(<TransactionDetail label="Test">test</TransactionDetail>, breakpoint);

		expect(screen.getByTestId("TransactionDetail--desktop")).toBeInTheDocument();
		expect(screen.queryByTestId("TransactionDetail--mobile")).not.toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});

	it.each(["xs", "sm"])("should render in %s mobile screen", (breakpoint) => {
		const { container } = renderResponsive(<TransactionDetail label="Test">test</TransactionDetail>, breakpoint);

		expect(screen.getByTestId("TransactionDetail--mobile")).toBeInTheDocument();
		expect(screen.queryByTestId("TransactionDetail--desktop")).not.toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should always render as desktop is useDesktop is set %s", (breakpoint) => {
		const { container } = renderResponsive(
			<TransactionDetail useDesktop label="Test">
				test
			</TransactionDetail>,
			breakpoint,
		);

		expect(screen.getByTestId("TransactionDetail--desktop")).toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});

	it("should render without border", () => {
		const { container } = render(
			<TransactionDetail label="Test" border={false}>
				test
			</TransactionDetail>,
		);

		expect(container).toMatchSnapshot();
	});

	it.each(["top", "bottom"])("should render with %s border", (position) => {
		const { container } = render(
			<TransactionDetail label="Test" borderPosition={position}>
				test
			</TransactionDetail>,
		);

		expect(container).toMatchSnapshot();
	});

	it("should render without padding", () => {
		const { container } = render(
			<TransactionDetail label="Test" padding={false}>
				test
			</TransactionDetail>,
		);

		expect(container).toMatchSnapshot();
	});

	it("should render with extra children", () => {
		const { container } = render(
			<TransactionDetail label="Test" padding={false} extra={<div data-testid="TEST_CHILD" />}>
				test
			</TransactionDetail>,
		);

		expect(screen.getByTestId("TEST_CHILD")).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});
});
