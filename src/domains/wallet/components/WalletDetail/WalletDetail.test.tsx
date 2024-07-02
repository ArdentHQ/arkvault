import React from "react";

import { render, screen } from "@/utils/testing-library";

import { WalletDetail } from "./WalletDetail";

describe("WalletDetail", () => {
	it("should render", () => {
		const { container } = render(<WalletDetail label="Test">test</WalletDetail>);

		expect(container).toMatchSnapshot();
	});

	it("should render without border", () => {
		const { container } = render(
			<WalletDetail label="Test" border={false}>
				test
			</WalletDetail>,
		);

		expect(container).toMatchSnapshot();
	});

	it.each(["top", "bottom"])("should render with %s border", (position) => {
		const { container } = render(
			<WalletDetail label="Test" borderPosition={position}>
				test
			</WalletDetail>,
		);

		expect(container).toMatchSnapshot();
	});

	it("should render without padding", () => {
		const { container } = render(
			<WalletDetail label="Test" padding={false}>
				test
			</WalletDetail>,
		);

		expect(container).toMatchSnapshot();
	});

	it("should render with extra children", () => {
		const { container } = render(
			<WalletDetail label="Test" padding={false} extra={<div data-testid="TEST_CHILD" />}>
				test
			</WalletDetail>,
		);

		expect(screen.getByTestId("TEST_CHILD")).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});
});
