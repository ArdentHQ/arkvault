/* eslint-disable testing-library/no-node-access */
import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";
import React from "react";
import { useTranslation } from "react-i18next";

import { ExchangeStatus } from "./StatusStep.blocks";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

let profile: Contracts.IProfile;
let exchangeTransaction: Contracts.IExchangeTransaction;

describe("ExchangeStatus", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		exchangeTransaction = profile.exchangeTransactions().create({
			input: {
				address: "inputAddress",
				amount: 1,
				ticker: "btc",
			},
			orderId: "orderId",
			output: {
				address: "outputAddress",
				amount: 100,
				ticker: "ark",
			},
			provider: "provider",
		});
	});

	it("should show failed status", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		exchangeTransaction.setStatus(Contracts.ExchangeTransactionStatus.Failed);
		const { container } = render(<ExchangeStatus exchangeTransaction={exchangeTransaction} />);

		expect(document.querySelector("svg#circle-cross")).toBeInTheDocument();
		expect(container).toHaveTextContent(t("EXCHANGE.TRANSACTION_STATUS.FAILED"));

		expect(container).toMatchSnapshot();
	});

	it("should show refunded status", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		exchangeTransaction.setStatus(Contracts.ExchangeTransactionStatus.Refunded);
		const { container } = render(<ExchangeStatus exchangeTransaction={exchangeTransaction} />);

		expect(document.querySelector("svg#circle-exclamation-mark")).toBeInTheDocument();
		expect(container).toHaveTextContent(t("EXCHANGE.TRANSACTION_STATUS.REFUNDED"));

		expect(container).toMatchSnapshot();
	});

	it("should show verifying status", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		exchangeTransaction.setStatus(Contracts.ExchangeTransactionStatus.Verifying);
		const { container } = render(<ExchangeStatus exchangeTransaction={exchangeTransaction} />);

		expect(document.querySelector("svg#circle-exclamation-mark")).toBeInTheDocument();
		expect(container).toHaveTextContent(t("EXCHANGE.TRANSACTION_STATUS.VERIFYING"));

		expect(container).toMatchSnapshot();
	});

	it("should show expired status", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		exchangeTransaction.setStatus(Contracts.ExchangeTransactionStatus.Expired);
		const { container } = render(<ExchangeStatus exchangeTransaction={exchangeTransaction} />);

		expect(document.querySelector("svg#circle-cross")).toBeInTheDocument();
		expect(container).toHaveTextContent(t("EXCHANGE.TRANSACTION_STATUS.EXPIRED"));

		expect(container).toMatchSnapshot();
	});

	it("should show exchange status", () => {
		exchangeTransaction.setStatus(Contracts.ExchangeTransactionStatus.Confirming);
		const { rerender } = render(<ExchangeStatus exchangeTransaction={exchangeTransaction} />);

		expect(screen.queryByTestId("StatusIcon__check-mark")).not.toBeInTheDocument();
		expect(screen.getAllByTestId("StatusIcon__spinner")).toHaveLength(1);
		expect(screen.getAllByTestId("StatusIcon__empty")).toHaveLength(2);

		exchangeTransaction.setStatus(Contracts.ExchangeTransactionStatus.Exchanging);
		rerender(<ExchangeStatus exchangeTransaction={exchangeTransaction} />);

		expect(screen.getAllByTestId("StatusIcon__check-mark")).toHaveLength(1);
		expect(screen.getAllByTestId("StatusIcon__spinner")).toHaveLength(1);
		expect(screen.getAllByTestId("StatusIcon__empty")).toHaveLength(1);

		exchangeTransaction.setStatus(Contracts.ExchangeTransactionStatus.Sending);
		rerender(<ExchangeStatus exchangeTransaction={exchangeTransaction} />);

		expect(screen.getAllByTestId("StatusIcon__check-mark")).toHaveLength(2);
		expect(screen.getAllByTestId("StatusIcon__spinner")).toHaveLength(1);
		expect(screen.queryByTestId("StatusIcon__empty")).not.toBeInTheDocument();

		exchangeTransaction.setStatus(Contracts.ExchangeTransactionStatus.Finished);
		rerender(<ExchangeStatus exchangeTransaction={exchangeTransaction} />);

		expect(screen.getAllByTestId("StatusIcon__check-mark")).toHaveLength(3);
		expect(screen.queryByTestId("StatusIcon__spinner")).not.toBeInTheDocument();
		expect(screen.queryByTestId("StatusIcon__empty")).not.toBeInTheDocument();
	});
});
