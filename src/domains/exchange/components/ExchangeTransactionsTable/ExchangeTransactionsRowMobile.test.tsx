import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect } from "react";

import { ExchangeTransactionsRowMobile } from "./ExchangeTransactionsRowMobile";
import { useExchangeContext, ExchangeProvider } from "@/domains/exchange/contexts/Exchange";
import { env, getDefaultProfileId, render, screen, within, waitFor } from "@/utils/testing-library";

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

const WrapperWithProviders = ({ children }) => {
	const { fetchProviders } = useExchangeContext();

	useEffect(() => {
		fetchProviders();
	}, []);

	return <>{children}</>;
};

describe("ExchangeTransactionsRowMobile", () => {
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
				<ExchangeTransactionsRowMobile exchangeTransaction={exchangeTransaction} />
			</Wrapper>,
		);

		// eslint-disable-next-line testing-library/no-node-access
		expect(document.querySelector(`svg#${icon}`)).toBeInTheDocument();
		expect(screen.getAllByTestId("TableRow__mobile")).toHaveLength(profile.exchangeTransactions().count());

		expect(container).toMatchSnapshot();
	});

	it("should execute onClick callback", async () => {
		const onClick = vi.fn();

		render(
			<Wrapper>
				<ExchangeTransactionsRowMobile exchangeTransaction={exchangeTransaction} onClick={onClick} />
			</Wrapper>,
		);

		expect(screen.getAllByTestId("TableRow__mobile")).toHaveLength(profile.exchangeTransactions().count());

		await userEvent.click(within(screen.getAllByTestId("TableRow__mobile")[0]).getAllByRole("button")[0]);

		expect(onClick).toHaveBeenCalledWith(exchangeTransaction.provider(), exchangeTransaction.orderId());
	});

	it("should execute onRemove callback", async () => {
		const onRemove = vi.fn();

		render(
			<Wrapper>
				<ExchangeTransactionsRowMobile exchangeTransaction={exchangeTransaction} onRemove={onRemove} />
			</Wrapper>,
		);

		expect(screen.getAllByTestId("TableRow__mobile")).toHaveLength(profile.exchangeTransactions().count());

		await userEvent.click(within(screen.getAllByTestId("TableRow__mobile")[0]).getAllByRole("button")[1]);

		expect(onRemove).toHaveBeenCalledWith(exchangeTransaction);
	});

	it("should render transaction provider", async () => {
		const { container } = render(
			<ExchangeProvider>
				<WrapperWithProviders>
					<ExchangeTransactionsRowMobile exchangeTransaction={exchangeTransaction} />
				</WrapperWithProviders>
				,
			</ExchangeProvider>,
		);

		await waitFor(() => expect(container).toHaveTextContent("ChangeNOW"));

		expect(container).toMatchSnapshot();
	});

	it("should render NA if no orderId", async () => {
		const exchangeTransactionSpy = vi.spyOn(exchangeTransaction, "orderId").mockImplementation(() => null);

		const { container } = render(
			<ExchangeProvider>
				<ExchangeTransactionsRowMobile exchangeTransaction={exchangeTransaction} />
			</ExchangeProvider>,
		);

		await waitFor(() => expect(container).toHaveTextContent("N/A"));

		expect(container).toMatchSnapshot();

		exchangeTransactionSpy.mockRestore();
	});
});
