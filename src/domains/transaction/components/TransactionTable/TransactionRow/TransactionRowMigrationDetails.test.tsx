import React from "react";

import { TransactionRowMigrationDetails } from "./TransactionRowMigrationDetails";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { render, screen } from "@/utils/testing-library";

describe("TransactionRowMigrationDetails", () => {
	const transaction = {
		...TransactionFixture,
		wallet: () => ({
			...TransactionFixture.wallet(),
			currency: () => "DARK",
			network: () => {},
		}),
	};

	it("should render", () => {
		render(<TransactionRowMigrationDetails transaction={transaction} isCompact={false} />);
		expect(screen.getByTestId("MigrationRowDetailsLabel")).toBeInTheDocument();
	});

	it("should render compact", () => {
		render(<TransactionRowMigrationDetails transaction={transaction} isCompact />);
		expect(screen.getByTestId("MigrationRowDetailsLabel")).toBeInTheDocument();
	});
});
