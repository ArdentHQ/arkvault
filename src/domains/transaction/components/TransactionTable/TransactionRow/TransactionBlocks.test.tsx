import React from "react";

import { TransactionFixture } from "@/tests/fixtures/transactions";
import { renderHook } from "@testing-library/react";
import { useTranslation } from "react-i18next";
import userEvent from "@testing-library/user-event";
import { TransactionAmountLabel, TransactionFiatAmount } from "./TransactionAmount.blocks";
import { render, screen, env, getDefaultProfileId } from "@/utils/testing-library";

describe("TransactionAmount.blocks", () => {
	let fixture;
	let profile;

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());

		fixture = {
			...TransactionFixture,
			fee: () => 5,

			isMultiPayment: () => true,
			isReturn: () => false,
			recipients: () => [
				{ address: "address-1", amount: 10 },
				{ address: "address-2", amount: 20 },
				{ address: TransactionFixture.wallet().address(), amount: 30 },
			],
			value: () => 65,
			wallet: () => ({
				...TransactionFixture.wallet(),
				currency: () => "DARK",
				profile: () => profile,
			}),
		};
	});

	it("should show hint and amount for multiPayment transaction", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		render(<TransactionAmountLabel transaction={fixture} />);

		// should have a label
		expect(screen.getByTestId("AmountLabel__hint")).toBeInTheDocument();

		await userEvent.hover(screen.getByTestId("AmountLabel__hint"));

		const hintText = t("TRANSACTION.HINT_AMOUNT_EXCLUDING", { amount: 30, currency: "DARK" });

		expect(screen.getByText(hintText)).toBeInTheDocument();

		// should have an amount without returned amount
		expect(screen.getByText(/30 DARK/)).toBeInTheDocument();
	});

	it("should not show a hint for a return transaction", () => {
		render(<TransactionAmountLabel transaction={{ ...fixture, isReturn: () => true }} />);

		expect(screen.queryByTestId("AmountLabel__hint")).not.toBeInTheDocument();
	});

	it("should show fiat value for multiPayment transaction", () => {
		const exchangeMock = vi.spyOn(profile.exchangeRates(), "exchange").mockReturnValue(5);

		render(<TransactionFiatAmount transaction={fixture} exchangeCurrency="USD" />);

		expect(screen.getByText("$5.00")).toBeInTheDocument();

		exchangeMock.mockRestore();
	});
});
