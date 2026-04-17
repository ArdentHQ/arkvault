import React from "react";
import { render, screen } from "@/utils/testing-library";
import { TransactionRowSkeleton } from "./TransactionRowSkeleton";
import { TableRow } from "@/app/components/Table";

describe("TransactionRowSkeleton", () => {
	it("should render skeleton with hideSender false", () => {
		const { container } = render(
			<TableRow>
				<TransactionRowSkeleton hideSender={false} />
			</TableRow>,
		);
		expect(container.firstChild).toBeInTheDocument();
	});

	it("should render skeleton with hideSender true", () => {
		const { container } = render(
			<TableRow>
				<TransactionRowSkeleton hideSender={true} />
			</TableRow>,
		);
		expect(container.firstChild).toBeInTheDocument();
	});

	it("should render sender and recipient columns when hideSender is false", () => {
		const { container } = render(
			<TableRow>
				<TransactionRowSkeleton hideSender={false} />
			</TableRow>,
		);
		expect(screen.getByTestId("TransactionRowSkeleton__recipient-mobile")).toBeInTheDocument();
		expect(screen.getByTestId("TransactionRowSkeleton__sender-desktop")).toBeInTheDocument();
	});

	it("should not render sender column when hideSender is true", () => {
		const { container } = render(
			<TableRow>
				<TransactionRowSkeleton hideSender={true} />
			</TableRow>,
		);
		expect(screen.queryByTestId("TransactionRowSkeleton__recipient-mobile")).toBeNull();
		expect(screen.queryByTestId("TransactionRowSkeleton__sender-desktop")).toBeNull();
	});
});
