import React from "react";

import userEvent from "@testing-library/user-event";
import * as useRandomNumberHook from "@/app/hooks/use-random-number";
import { render, screen, within, renderResponsive } from "@/utils/testing-library";
import { MigrationTransactionsTable } from "@/domains/migration/components/MigrationTransactionsTable";
import { MigrationTransactionStatus } from "@/domains/migration/migration.contracts";

const migrationTransactions = [
	{
		address: "AXzxJ8Ts3dQ2bvBR1tPE7GUee9iSEJb8HX",
		amount: 123,
		id: "id",
		migrationAddress: "0x0000000000000000000000000000000000000000",
		status: MigrationTransactionStatus.Confirmed,
		timestamp: new Date("2021-01-01").getTime() / 1000,
	},
	{
		address: "AXzxJ8Ts3dQ2bvBR1tPE7GUee9iSEJb8HX",
		amount: 123,
		migrationAddress: "0x0000000000000000000000000000000000000000",
		status: MigrationTransactionStatus.Waiting,
		timestamp: new Date("2021-01-01").getTime() / 1000,
	},
];

let useRandomNumberSpy: vi.SpyInstance;

describe("MigrationTransactionsTable", () => {
	beforeAll(() => {
		useRandomNumberSpy = vi.spyOn(useRandomNumberHook, "useRandomNumber").mockImplementation(() => 1);
	});

	afterAll(() => {
		useRandomNumberSpy.mockRestore();
	});

	it("should render", () => {
		const { container } = render(
			<MigrationTransactionsTable migrationTransactions={migrationTransactions} onClick={vi.fn()} />,
		);

		expect(screen.getAllByTestId("MigrationTransactionsRow")).toHaveLength(migrationTransactions.length);

		expect(container).toMatchSnapshot();
	});

	it("should render empty", () => {
		const { container } = render(<MigrationTransactionsTable migrationTransactions={[]} onClick={vi.fn()} />);

		expect(screen.getByTestId("MigrationTransactionsTable__empty-message")).toBeInTheDocument();
		expect(screen.queryAllByTestId("MigrationTransactionsRow")).toHaveLength(0);

		expect(container).toMatchSnapshot();
	});

	it.each(["xs", "sm"])("should render mobile", (breakpoint) => {
		const { asFragment } = renderResponsive(
			<MigrationTransactionsTable migrationTransactions={migrationTransactions} onClick={vi.fn()} />,
			breakpoint,
		);

		expect(screen.getAllByTestId("MigrationTransactionsRowMobile")).toHaveLength(migrationTransactions.length);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render compact", () => {
		const { container } = render(
			<MigrationTransactionsTable migrationTransactions={migrationTransactions} onClick={vi.fn()} isCompact />,
		);

		expect(screen.getAllByTestId("MigrationTransactionsRow")).toHaveLength(migrationTransactions.length);

		expect(container).toMatchSnapshot();
	});

	it.each([true, false])("should render skeletons (isCompact = %s)", (isCompact) => {
		const { container } = render(
			<MigrationTransactionsTable
				migrationTransactions={migrationTransactions}
				onClick={vi.fn()}
				isCompact={isCompact}
				isLoading
			/>,
		);

		expect(screen.getAllByTestId("MigrationTransactionsRowSkeleton")).toHaveLength(5);

		expect(container).toMatchSnapshot();
	});

	it.each(["xs", "sm"])("should render skeleton on mobile", (breakpoint) => {
		const { asFragment } = renderResponsive(
			<MigrationTransactionsTable migrationTransactions={migrationTransactions} onClick={vi.fn()} isLoading />,
			breakpoint,
		);

		expect(screen.getAllByTestId("MigrationTransactionsRowMobileSkeleton")).toHaveLength(5);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should execute onClick callback", () => {
		const onClick = vi.fn();

		render(<MigrationTransactionsTable migrationTransactions={migrationTransactions} onClick={onClick} />);

		expect(screen.getAllByTestId("MigrationTransactionsRow")).toHaveLength(migrationTransactions.length);

		userEvent.click(within(screen.getAllByTestId("MigrationTransactionsRow")[0]).getAllByRole("button")[0]);

		expect(onClick).toHaveBeenCalled();
	});
});
