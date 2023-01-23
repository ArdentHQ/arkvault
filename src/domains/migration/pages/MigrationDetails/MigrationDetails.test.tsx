import React from "react";
import { DTO } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import { Route } from "react-router-dom";
import { DateTime } from "@ardenthq/sdk-intl";
import userEvent from "@testing-library/user-event";
import { MigrationDetails } from "./MigrationDetails";
import { render, getDefaultProfileId, screen } from "@/utils/testing-library";
import * as contexts from "@/app/contexts";
import { MigrationTransactionStatus } from "@/domains/migration/migration.contracts";

let useMigrationsSpy;

const history = createHashHistory();
const migrationUrl = `/profiles/${getDefaultProfileId()}/migration`;
let transactionFixture: DTO.ExtendedConfirmedTransactionData;

const renderComponent = ({ transaction, handleBack = vi.fn() }) => {
	history.push(migrationUrl);

	return render(
		<Route path="/profiles/:profileId/migration">
			<MigrationDetails transaction={transaction} handleBack={handleBack} />
		</Route>,
		{
			history,
			route: migrationUrl,
		},
	);
};

describe("MigrationDetails", () => {
	beforeAll(async () => {
		// const profile = env.profiles().findById(getDefaultProfileId());

		// const wallet = profile.wallets().first();

		transactionFixture = {
			amount: () => 123,
			id: () => "transaction-id",
			memo: () => "0x123456789",
			sender: () => "Address",
			timestamp: () => DateTime.make(),
		} as DTO.ExtendedConfirmedTransactionData;
	});

	beforeEach(() => {
		useMigrationsSpy = vi.spyOn(contexts, "useMigrations").mockReturnValue({
			migrations: [
				{
					id: transactionFixture.id(),
					status: MigrationTransactionStatus.Confirmed,
				},
			],
		});
	});

	afterEach(() => {
		useMigrationsSpy.mockRestore();
	});

	it("should render", () => {
		renderComponent({
			transaction: transactionFixture,
		});

		expect(screen.getByTestId("MigrationDetails")).toBeInTheDocument();
	});

	it("should render confirmed details if confirmed", () => {
		renderComponent({
			transaction: transactionFixture,
		});

		expect(screen.getByTestId("MigrationSuccessStep")).toBeInTheDocument();
	});

	it("should handle back", () => {
		const handleBack = vi.fn();
		useMigrationsSpy = vi.spyOn(contexts, "useMigrations").mockReturnValue({
			migrations: [
				{
					id: transactionFixture.id(),
					status: MigrationTransactionStatus.Pending,
				},
			],
		});

		renderComponent({
			handleBack,
			transaction: transactionFixture,
		});

		expect(screen.getByTestId("MigrationPendingStep")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("MigrationAdd_back"));

		expect(handleBack).toHaveBeenCalled();
	});
});
