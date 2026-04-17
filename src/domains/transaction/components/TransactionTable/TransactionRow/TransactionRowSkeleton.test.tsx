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
		expect(container).toBeInTheDocument();
	});

	it("should render skeleton with hideSender true", () => {
		render(
			<TableRow>
				<TransactionRowSkeleton hideSender={true} />
			</TableRow>,
		);

		expect(screen.queryByTestId("TransactionRowSkeleton__recipient-mobile")).not.toBeInTheDocument();
		expect(screen.queryByTestId("TransactionRowSkeleton__sender-desktop")).not.toBeInTheDocument();
	});

	it("should render sender and recipient columns when hideSender is false", () => {
		render(
			<TableRow>
				<TransactionRowSkeleton hideSender={false} />
			</TableRow>,
		);
		expect(screen.getByTestId("TransactionRowSkeleton__recipient-mobile")).toBeInTheDocument();
		expect(screen.getByTestId("TransactionRowSkeleton__sender-desktop")).toBeInTheDocument();
	});

	it("should not render sender column when hideSender is true", () => {
		render(
			<TableRow>
				<TransactionRowSkeleton hideSender={true} />
			</TableRow>,
		);
		expect(screen.queryByTestId("TransactionRowSkeleton__recipient-mobile")).toBeNull();
		expect(screen.queryByTestId("TransactionRowSkeleton__sender-desktop")).toBeNull();
	});
});
