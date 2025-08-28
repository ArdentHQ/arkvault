import React from "react";

import { TransactionFixture } from "@/tests/fixtures/transactions";
import { renderHook } from "@testing-library/react";
import { useTranslation } from "react-i18next";
import userEvent from "@testing-library/user-event";
import { TransactionAmountLabel, TransactionFiatAmount, TransactionTypeLabel } from "./TransactionAmount.blocks";
import { render, renderResponsive, screen, env, getDefaultProfileId } from "@/utils/testing-library";

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

describe("TransactionTypeLabel", () => {
	const defaultProps = {
		color: "secondary",
		noBorder: true,
		size: "xs",
	};

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should render label without tooltip when text is not truncated", () => {
		renderResponsive(
			<TransactionTypeLabel tooltipContent="Full Transaction Type" props={defaultProps}>
				Transfer
			</TransactionTypeLabel>,
			"lg",
		);

		expect(screen.getByTestId("TransactionRow__type")).toBeInTheDocument();
		expect(screen.getByText("Transfer")).toBeInTheDocument();

		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
	});

	it("should render label without tooltip when no tooltipContent is provided", () => {
		renderResponsive(
			<TransactionTypeLabel props={defaultProps}>Very Long Transaction Type Name</TransactionTypeLabel>,
			"lg",
		);

		expect(screen.getByTestId("TransactionRow__type")).toBeInTheDocument();
		expect(screen.getByText("Very Long Transaction Type Name")).toBeInTheDocument();

		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
	});

	it("should render tooltip when text is truncated and tooltipContent is provided", async () => {
		renderResponsive(
			<TransactionTypeLabel tooltipContent="Very Long Transaction Type Name" props={defaultProps}>
				Very Long Transaction Type Name
			</TransactionTypeLabel>,
			"lg",
		);

		expect(screen.getByTestId("TransactionRow__type")).toBeInTheDocument();

		await userEvent.hover(screen.getByTestId("TransactionRow__type"));

		expect(screen.getByText("Very Long Transaction Type Name")).toBeInTheDocument();
	});

	it("should pass through label properties correctly", () => {
		const customProps = {
			color: "primary" as const,
			noBorder: false,
			size: "sm" as const,
		};

		renderResponsive(<TransactionTypeLabel props={customProps}>Transfer</TransactionTypeLabel>, "lg");

		const label = screen.getByTestId("TransactionRow__type");
		expect(label).toBeInTheDocument();
		expect(label).toHaveClass("max-w-20", "rounded", "px-1", "py-[3px]", "lg:max-w-40", "dark:border");
	});

	it("should handle window resize events and recheck truncation", () => {
		const addEventListenerSpy = vi.spyOn(window, "addEventListener");
		const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

		const { unmount } = renderResponsive(
			<TransactionTypeLabel tooltipContent="Test Content" props={defaultProps}>
				Test
			</TransactionTypeLabel>,
			"lg",
		);

		expect(addEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));

		unmount();

		expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));
	});

	it("should update truncation state when children change", () => {
		const { rerender } = renderResponsive(
			<TransactionTypeLabel tooltipContent="Short" props={defaultProps}>
				Short
			</TransactionTypeLabel>,
			"lg",
		);

		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

		rerender(
			<TransactionTypeLabel tooltipContent="Very Long Transaction Type Name" props={defaultProps}>
				Very Long Transaction Type Name
			</TransactionTypeLabel>,
		);

		expect(screen.getByTestId("TransactionRow__type")).toBeInTheDocument();
	});

	it("should apply correct CSS classes to inner span", () => {
		renderResponsive(<TransactionTypeLabel props={defaultProps}>Test Content</TransactionTypeLabel>, "lg");

		const span = screen.getByText("Test Content");
		expect(span).toHaveClass("block", "truncate", "whitespace-nowrap");
	});

	it("should maintain data-testid on the label", () => {
		renderResponsive(<TransactionTypeLabel props={defaultProps}>Test Content</TransactionTypeLabel>, "lg");

		expect(screen.getByTestId("TransactionRow__type")).toBeInTheDocument();
	});
});
