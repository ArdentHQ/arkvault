import React from "react";
import { DTO } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import { Route } from "react-router-dom";
import { DateTime } from "@ardenthq/sdk-intl";
import userEvent from "@testing-library/user-event";
import { MigrationDetails } from "./MigrationDetails";
import { render, getDefaultProfileId, screen } from "@/utils/testing-library";
import * as contexts from "@/app/contexts";
import { MigrationTransactionStatus, Migration } from "@/domains/migration/migration.contracts";

let useMigrationsSpy;

const history = createHashHistory();
const migrationUrl = `/profiles/${getDefaultProfileId()}/migration`;
let transactionFixture: DTO.ExtendedConfirmedTransactionData;
let migrationTransactionFixture: Migration;

const renderComponent = ({ transaction, migrationTransaction, handleBack = vi.fn() }) => {
	history.push(migrationUrl);

	return render(
		<Route path="/profiles/:profileId/migration">
			<MigrationDetails
				transaction={transaction}
				migrationTransaction={migrationTransaction}
				handleBack={handleBack}
			/>
		</Route>,
		{
			history,
			route: migrationUrl,
		},
	);
};

describe("MigrationDetails", () => {
	beforeAll(() => {
		transactionFixture = {
			amount: () => 123,
			id: () => "transaction-id",
			memo: () => "0x123456789",
			sender: () => "Address",
			timestamp: () => DateTime.make(),
		} as DTO.ExtendedConfirmedTransactionData;

		migrationTransactionFixture = {
			id: "transaction-id",
			status: MigrationTransactionStatus.Confirmed,
		};
	});

	it("should render", () => {
		renderComponent({
			migrationTransaction: migrationTransactionFixture,
			transaction: transactionFixture,
		});

		expect(screen.getByTestId("MigrationDetails")).toBeInTheDocument();
	});

	it("should render if no migrations", () => {
		useMigrationsSpy = vi.spyOn(contexts, "useMigrations").mockReturnValue({
			migrations: undefined,
		});

		renderComponent({
			migrationTransaction: migrationTransactionFixture,
			transaction: transactionFixture,
		});

		expect(screen.getByTestId("MigrationDetails")).toBeInTheDocument();
	});

	it("should render confirmed details if confirmed", () => {
		renderComponent({
			migrationTransaction: migrationTransactionFixture,
			transaction: transactionFixture,
		});

		expect(screen.getByTestId("MigrationSuccessStep")).toBeInTheDocument();
	});

	it("should handle back", () => {
		const handleBack = vi.fn();

		renderComponent({
			handleBack,
			migrationTransaction: {
				migrationTransactionFixture,
				status: MigrationTransactionStatus.Pending,
			},
			transaction: transactionFixture,
		});

		expect(screen.getByTestId("MigrationPendingStep")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("MigrationAdd_back"));

		expect(handleBack).toHaveBeenCalled();
	});
});
