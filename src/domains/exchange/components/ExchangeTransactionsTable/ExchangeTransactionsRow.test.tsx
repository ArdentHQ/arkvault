import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { ExchangeTransactionsRow } from "./ExchangeTransactionsRow";
import { ExchangeProvider } from "@/domains/exchange/contexts/Exchange";
import { env, getDefaultProfileId, render, screen, within } from "@/utils/testing-library";

let profile: Contracts.IProfile;
let exchangeTransaction: Contracts.IExchangeTransaction;

let dateNowSpy: vi.SpyInstance;

const stubData = {
	input: {
		address: "inputAddress",
		amount: 1,
		ticker: "btc",
	},
	orderId: "id",
	output: {
		address: "outputAddress",
		amount: 100,
		ticker: "ark",
	},
	provider: "changenow",
};

describe("ExchangeTransactionsRow", () => {
	beforeAll(() => {
		dateNowSpy = vi.spyOn(Date, "now").mockImplementation(() => new Date("2021-01-01").getTime());

		profile = env.profiles().findById(getDefaultProfileId());
		exchangeTransaction = profile.exchangeTransactions().create(stubData);
	});

	afterAll(() => {
		dateNowSpy.mockRestore();
	});

	const Wrapper = ({ children }: { children: React.ReactNode }) => (
		<ExchangeProvider>
			<table>
				<tbody>{children}</tbody>
			</table>
		</ExchangeProvider>
	);

	it.each([
		["New", "clock"],
		["Finished", "circle-check-mark"],
		["Expired", "clock-error"],
		["Refunded", "circle-exclamation-mark"],
		["Verifying", "circle-exclamation-mark"],
		["Failed", "circle-cross"],
	])("should render (%s)", (status, icon) => {
		profile
			.exchangeTransactions()
			.update(exchangeTransaction.id(), { status: Contracts.ExchangeTransactionStatus[status] });

		const { container } = render(
			<Wrapper>
				<ExchangeTransactionsRow exchangeTransaction={exchangeTransaction} />
			</Wrapper>,
		);

		// eslint-disable-next-line testing-library/no-node-access
		expect(document.querySelector(`svg#${icon}`)).toBeInTheDocument();
		expect(screen.getAllByTestId("TableRow")).toHaveLength(profile.exchangeTransactions().count());

		expect(container).toMatchSnapshot();
	});

	it("should render compact", () => {
		const { container } = render(
			<Wrapper>
				<ExchangeTransactionsRow exchangeTransaction={exchangeTransaction} isCompact />
			</Wrapper>,
		);

		expect(screen.getAllByTestId("TableRow")).toHaveLength(profile.exchangeTransactions().count());

		expect(container).toMatchSnapshot();
	});

	it("should execute onClick callback", async () => {
		const onClick = vi.fn();

		render(
			<Wrapper>
				<ExchangeTransactionsRow exchangeTransaction={exchangeTransaction} onClick={onClick} />
			</Wrapper>,
		);

		expect(screen.getAllByTestId("TableRow")).toHaveLength(profile.exchangeTransactions().count());

		await userEvent.click(within(screen.getAllByTestId("TableRow")[0]).getAllByRole("button")[0]);

		expect(onClick).toHaveBeenCalledWith(exchangeTransaction.provider(), exchangeTransaction.orderId());
	});

	it("should execute onRemove callback", async () => {
		const onRemove = vi.fn();

		render(
			<Wrapper>
				<ExchangeTransactionsRow exchangeTransaction={exchangeTransaction} onRemove={onRemove} />
			</Wrapper>,
		);

		expect(screen.getAllByTestId("TableRow")).toHaveLength(profile.exchangeTransactions().count());

		await userEvent.click(within(screen.getAllByTestId("TableRow")[0]).getAllByRole("button")[1]);

		expect(onRemove).toHaveBeenCalledWith(exchangeTransaction);
	});

	it("should render N/A if no orderId", () => {
		const stubDatWithNoId = { ...stubData, orderId: "" };
		exchangeTransaction = profile.exchangeTransactions().create(stubDatWithNoId);

		render(
			<Wrapper>
				<ExchangeTransactionsRow exchangeTransaction={exchangeTransaction} />
			</Wrapper>,
		);

		expect(screen.getByText("N/A")).toBeInTheDocument();
	});
});
