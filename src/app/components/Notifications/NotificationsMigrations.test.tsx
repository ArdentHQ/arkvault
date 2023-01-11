import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import userEvent from "@testing-library/user-event";
import { NotificationsMigrations } from "./NotificationsMigrations";
import { MigrationTransactionStatus } from "@/domains/migration/migration.contracts";
import { render, screen, getDefaultProfileId, env } from "@/utils/testing-library";

let profile: Contracts.IProfile;
let transactions: any[];

describe("NotificationsMigrations", () => {
	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());

		transactions = [
			{
				address: "AXzxJ8Ts3dQ2bvBR1tPE7GUee9iSEJb8HX",
				amount: 123,
				id: "id",
				migrationAddress: "0x0000000000000000000000000000000000000000",
				status: MigrationTransactionStatus.Confirmed,
				timestamp: Date.now() / 1000,
			},
			{
				address: "AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX",
				amount: 123,
				migrationAddress: "0x0000000000000000000000000000000000000000",
				status: MigrationTransactionStatus.Confirmed,
				timestamp: Date.now() / 1000,
			},
		];
	});

	it("should render notification migrations", () => {
		render(
			<div>
				<NotificationsMigrations profile={profile} transactions={transactions} />
			</div>,
		);

		expect(screen.getByTestId("NotificationsMigrations")).toBeInTheDocument();

		expect(screen.getAllByTestId("TableRow")).toHaveLength(2);
	});

	it("can click a migration item", () => {
		render(
			<div>
				<NotificationsMigrations profile={profile} transactions={transactions} />
			</div>,
		);

		expect(screen.getByTestId("NotificationsMigrations")).toBeInTheDocument();

		userEvent.click(screen.getAllByTestId("TableRow")[0]);
	});
});
