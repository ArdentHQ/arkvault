import React from "react";

import { TransactionFixture } from "@/tests/fixtures/transactions";
import { env, render, screen } from "@/utils/testing-library";
import { renderHook } from "@testing-library/react";
import { useTranslation } from "react-i18next";
import userEvent from "@testing-library/user-event";
import { TransactionAmountLabel, TransactionFiatAmount } from "./TransactionAmount.blocks";

describe("TransactionAmount.blocks", () => {
	const fixture = {
		...TransactionFixture,
		fee: () => 5,
		isMultiPayment: () => true,
		isReturn: () => true,
		recipients: () => [
			{ address: "address-1", amount: 10 },
			{ address: "address-2", amount: 20 },
			{ address: TransactionFixture.wallet().address(), amount: 30 },
		],
		total: () => 65,
		wallet: () => ({
			...TransactionFixture.wallet(),
			currency: () => "DARK",
		}),
	};

	it("should show hint and amount for multiPayment transaction", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		render(<TransactionAmountLabel transaction={fixture as any} />);

		// should have a label
		expect(screen.getByTestId("AmountLabel__hint")).toBeInTheDocument();

		await userEvent.hover(screen.getByTestId("AmountLabel__hint"));

		const hintText = t("TRANSACTION.HINT_AMOUNT_EXCLUDING", { amount: 30, currency: "DARK" });

		expect(screen.getByText(hintText)).toBeInTheDocument();

		// should have an amount without returned amount
		expect(screen.getByText(/35 DARK/)).toBeInTheDocument();
	});

	it("should show fiat value for multiPayment transaction", () => {
		const exchangeMock = vi.spyOn(env.exchangeRates(), "exchange").mockReturnValue(5);

		render(<TransactionFiatAmount transaction={fixture as any} exchangeCurrency="USD" />);

		expect(screen.getByText("$5.00")).toBeInTheDocument();

		exchangeMock.mockRestore();
	});
});