import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { ExchangeTransactionsTable } from "./ExchangeTransactionsTable";
import { ExchangeProvider } from "@/domains/exchange/contexts/Exchange";
import { env, getDefaultProfileId, render, screen, within, renderResponsive } from "@/utils/testing-library";

let profile: Contracts.IProfile;

let dateNowSpy: vi.SpyInstance;

const stubData = {
	input: {
		address: "inputAddress",
		amount: 1,
		ticker: "btc",
	},
	output: {
		address: "outputAddress",
		amount: 100,
		ticker: "ark",
	},
	provider: "changenow",
};

describe("ExchangeTransactionsTable", () => {
	beforeAll(() => {
		dateNowSpy = vi.spyOn(Date, "now").mockImplementation(() => new Date("2021-01-01").getTime());

		profile = env.profiles().findById(getDefaultProfileId());

		profile.exchangeTransactions().create({ ...stubData, orderId: "1" });
		profile.exchangeTransactions().create({ ...stubData, orderId: "2" });
		profile.exchangeTransactions().create({ ...stubData, orderId: "3" });
	});

	afterAll(() => {
		dateNowSpy.mockRestore();
	});

	it("should render", () => {
		const { container } = render(
			<ExchangeProvider>
				<ExchangeTransactionsTable
					exchangeTransactions={profile.exchangeTransactions().values()}
					onClick={vi.fn()}
					onRemove={vi.fn()}
				/>
			</ExchangeProvider>,
		);

		expect(screen.getAllByTestId("TableRow")).toHaveLength(profile.exchangeTransactions().count());

		expect(container).toMatchSnapshot();
	});

	it.each(["xs", "sm"])("should render mobile", (breakpoint) => {
		const { asFragment } = renderResponsive(
			<ExchangeProvider>
				<ExchangeTransactionsTable
					exchangeTransactions={profile.exchangeTransactions().values()}
					onClick={vi.fn()}
					onRemove={vi.fn()}
				/>
			</ExchangeProvider>,
			breakpoint,
		);

		expect(screen.getAllByTestId("TableRow__mobile")).toHaveLength(profile.exchangeTransactions().count());
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["md", "lg", "xl"])("should render desktop", (breakpoint) => {
		const { asFragment } = renderResponsive(
			<ExchangeProvider>
				<ExchangeTransactionsTable
					exchangeTransactions={profile.exchangeTransactions().values()}
					onClick={vi.fn()}
					onRemove={vi.fn()}
				/>
			</ExchangeProvider>,
			breakpoint,
		);

		expect(screen.queryAllByTestId("TableRow__mobile")).toHaveLength(0);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render compact", () => {
		const { container } = render(
			<ExchangeProvider>
				<ExchangeTransactionsTable
					exchangeTransactions={profile.exchangeTransactions().values()}
					onClick={vi.fn()}
					onRemove={vi.fn()}
					isCompact
				/>
			</ExchangeProvider>,
		);

		expect(screen.getAllByTestId("TableRow")).toHaveLength(profile.exchangeTransactions().count());

		expect(container).toMatchSnapshot();
	});

	it("should execute onClick callback", async () => {
		const onClick = vi.fn();

		render(
			<ExchangeProvider>
				<ExchangeTransactionsTable
					exchangeTransactions={profile.exchangeTransactions().values()}
					onClick={onClick}
					onRemove={vi.fn()}
				/>
			</ExchangeProvider>,
		);

		expect(screen.getAllByTestId("TableRow")).toHaveLength(profile.exchangeTransactions().count());

		await userEvent.click(within(screen.getAllByTestId("TableRow")[0]).getAllByRole("button")[0]);

		// reverse() is called because display items are sorted by creation date desc.
		const exchangeTransaction = profile.exchangeTransactions().values().reverse()[0];

		expect(onClick).toHaveBeenCalledWith(exchangeTransaction.provider(), exchangeTransaction.orderId());
	});

	it("should execute onRemove callback", async () => {
		const onRemove = vi.fn();

		render(
			<ExchangeProvider>
				<ExchangeTransactionsTable
					exchangeTransactions={profile.exchangeTransactions().values()}
					onClick={vi.fn()}
					onRemove={onRemove}
				/>
			</ExchangeProvider>,
		);

		expect(screen.getAllByTestId("TableRow")).toHaveLength(profile.exchangeTransactions().count());

		await userEvent.click(within(screen.getAllByTestId("TableRow")[0]).getAllByRole("button")[1]);

		expect(onRemove).toHaveBeenCalledWith(profile.exchangeTransactions().values()[0]);
	});
});
