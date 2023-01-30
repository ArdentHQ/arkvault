import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { Notifications } from "./Notifications";
import * as useNotifications from "./hooks/use-notifications";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";
import * as context from "@/app/contexts";
import { server, requestMock } from "@/tests/mocks/server";
import { MigrationTransactionStatus, Migration as MigrationType } from "@/domains/migration/migration.contracts";
import NotificationTransactionsFixtures from "@/tests/fixtures/coins/ark/devnet/notification-transactions.json";
import TransactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions.json";
let profile: Contracts.IProfile;

describe("Notifications", () => {
	beforeEach(async () => {
		server.use(
			requestMock("https://ark-test.arkvault.io/api/transactions", {
				data: NotificationTransactionsFixtures.data,
				meta: TransactionsFixture.meta,
			}),
		);

		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		profile
			.notifications()
			.releases()
			.push({
				meta: { version: "3.0.0" },
				name: "Wallet update",
			});

		await profile.notifications().transactions().sync();
	});

	it("should render with plugins", async () => {
		const { container } = render(<Notifications profile={profile} />);
		await waitFor(() => expect(screen.queryAllByTestId("TransactionRowMode")).not.toHaveLength(0));

		expect(container).toMatchSnapshot();
	});

	it("should render with transactions and plugins", async () => {
		const { container } = render(<Notifications profile={profile} />);

		await waitFor(() => expect(screen.getAllByTestId("NotificationItem")).toHaveLength(2));
		await waitFor(() => expect(screen.queryAllByTestId("TransactionRowMode")).toHaveLength(3));

		expect(container).toMatchSnapshot();
	});

	it("should render with empty list of migrations", () => {
		const useMigrationsSpy = vi.spyOn(context, "useMigrations").mockImplementation(() => ({ migrations: [] }));

		render(<Notifications profile={profile} />);

		expect(screen.queryByTestId("NotificationsMigrations")).not.toBeInTheDocument();

		useMigrationsSpy.mockRestore();
	});

	it("should render with migrations", () => {
		const migrations: MigrationType[] = [
			{
				address: "AdDreSs",
				amount: 123,
				id: "0x123",
				migrationAddress: "0x456",
				status: MigrationTransactionStatus.Confirmed,
				timestamp: Date.now() / 1000,
			},
		];

		const useMigrationsSpy = vi.spyOn(context, "useMigrations").mockImplementation(() => ({ migrations }));

		render(<Notifications profile={profile} />);

		expect(screen.getByTestId("NotificationsMigrations")).toBeInTheDocument();

		useMigrationsSpy.mockRestore();
	});

	it("should render with migrations but not transactions", () => {
		const migrations: MigrationType[] = [
			{
				address: "AdDreSs",
				amount: 123,
				id: "0x123",
				migrationAddress: "0x456",
				status: MigrationTransactionStatus.Confirmed,
				timestamp: Date.now() / 1000,
			},
		];

		const useNotificationsSpy = vi.spyOn(useNotifications, "useNotifications").mockReturnValue({
			markAllTransactionsAsRead: () => {},
			migrationTransactions: migrations,
			releases: [],
			transactions: [],
		} as any);

		const { container } = render(<Notifications profile={profile} />);

		expect(screen.getByTestId("NotificationsMigrations")).toBeInTheDocument();

		expect(container).toMatchSnapshot();

		useNotificationsSpy.mockRestore();
	});

	it("should mark migration as read", () => {
		const markMigrationsAsRead = vi.fn();

		vi.mock("react-visibility-sensor", () => ({
			default: ({ children, onChange }) => (
				<>
					<button data-testid="TriggerVisibility" onClick={(isVisible, ...rest) => onChange(true, ...rest)} />

					{children}
				</>
			),
		}));

		const migrations: MigrationType[] = [
			{
				address: "AdDreSs",
				amount: 123,
				id: "0x123",
				migrationAddress: "0x456",
				readAt: undefined,
				status: MigrationTransactionStatus.Confirmed,
				timestamp: Date.now() / 1000,
			},
		];

		const useNotificationsSpy = vi.spyOn(useNotifications, "useNotifications").mockReturnValue({
			markAllTransactionsAsRead: () => {},
			markMigrationsAsRead,
			migrationTransactions: migrations,
			releases: [],
			transactions: [],
		} as any);

		const { container } = render(<Notifications profile={profile} />);

		expect(screen.getByTestId("NotificationsMigrations")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("TriggerVisibility"));

		expect(container).toMatchSnapshot();

		useNotificationsSpy.mockRestore();

		vi.unmock("react-visibility-sensor");

		expect(markMigrationsAsRead).not.toHaveBeenCalled();
	});

	it("should not mark migration as read if already read", () => {
		const markMigrationsAsRead = vi.fn();

		vi.mock("react-visibility-sensor", () => ({
			default: ({ children, onChange }) => (
				<>
					<button data-testid="TriggerVisibility" onClick={(isVisible, ...rest) => onChange(true, ...rest)} />

					{children}
				</>
			),
		}));

		const migrations: MigrationType[] = [
			{
				address: "AdDreSs",
				amount: 123,
				id: "0x123",
				migrationAddress: "0x456",
				readAt: Date.now(),
				status: MigrationTransactionStatus.Confirmed,
				timestamp: Date.now() / 1000,
			},
		];

		const useNotificationsSpy = vi.spyOn(useNotifications, "useNotifications").mockReturnValue({
			markAllTransactionsAsRead: () => {},
			markMigrationsAsRead,
			migrationTransactions: migrations,
			releases: [],
			transactions: [],
		} as any);

		const { container } = render(<Notifications profile={profile} />);

		expect(screen.getByTestId("NotificationsMigrations")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("TriggerVisibility"));

		expect(container).toMatchSnapshot();

		useNotificationsSpy.mockRestore();

		vi.unmock("react-visibility-sensor");

		expect(markMigrationsAsRead).not.toHaveBeenCalled();
	});

	it("should render empty", () => {
		const useNotificationsSpy = vi.spyOn(useNotifications, "useNotifications").mockReturnValue({
			markAllTransactionsAsRead: () => {},
			migrationTransactions: [],
			releases: [],
			transactions: [],
		} as any);

		render(<Notifications profile={profile} />);

		expect(screen.getByTestId("Notifications__empty")).toBeInTheDocument();

		useNotificationsSpy.mockRestore();
	});

	it("should emit onNotificationAction event", async () => {
		const onNotificationAction = vi.fn();

		render(<Notifications profile={profile} onNotificationAction={onNotificationAction} />);
		await waitFor(() => expect(screen.getAllByTestId("NotificationItem")).toHaveLength(2));
		await waitFor(() => expect(screen.queryAllByTestId("TransactionRowMode")).toHaveLength(3));

		userEvent.click(screen.getAllByTestId("NotificationItem__action")[1]);

		await waitFor(() => expect(onNotificationAction).toHaveBeenCalledWith(expect.any(String)));
	});

	it("should emit transactionClick event", async () => {
		const onTransactionClick = vi.fn();

		const { container } = render(<Notifications profile={profile} onTransactionClick={onTransactionClick} />);

		await waitFor(() => expect(screen.getAllByTestId("NotificationItem")).toHaveLength(2));
		await waitFor(() => expect(screen.queryAllByTestId("TransactionRowMode")).toHaveLength(3));

		userEvent.click(screen.getAllByTestId("TransactionRowMode")[0]);

		await waitFor(() =>
			expect(onTransactionClick).toHaveBeenCalledWith(expect.any(DTO.ExtendedConfirmedTransactionData)),
		);

		expect(container).toMatchSnapshot();
	});

	it("should render with empty notifications", async () => {
		const emptyProfile = await env.profiles().create("test2");

		const { container } = render(<Notifications profile={emptyProfile} />);
		await waitFor(() => expect(screen.queryAllByTestId("TransactionRowMode")).toHaveLength(0));

		expect(container).toMatchSnapshot();
	});
});
