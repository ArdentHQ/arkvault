import React from "react";

import { TransactionFixture } from "@/tests/fixtures/transactions";
import { renderHook } from "@testing-library/react";
import { useTranslation } from "react-i18next";
import userEvent from "@testing-library/user-event";
import {
	TransactionAmountLabel,
	TransactionFiatAmount,
	TransactionTotalLabel,
	TransactionTypeLabel,
	isOverflowing,
} from "./TransactionAmount.blocks";
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

	it("should return true if element is overflowing", async () => {
		expect(isOverflowing({ clientWidth: 10, scrollWidth: 15 } as HTMLSpanElement)).toBe(true);
	});

	it("should return false if element is not overflowing", async () => {
		expect(isOverflowing({ clientWidth: 10, scrollWidth: 5 } as HTMLSpanElement)).toBe(false);
	});

	it("should return false if element is not provided", async () => {
		expect(isOverflowing()).toBe(false);
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

	it("should use token for TransactionAmountLabel when token is present", () => {
		const tokenFixture = {
			...fixture,
			isMultiPayment: () => false,
			isReturn: () => false,
			isSent: () => true,
			token: () => ({
				token: () => ({
					displaySymbol: () => "USDC",
					symbol: () => "USDC",
					value: () => 100,
				}),
				value: () => 100,
			}),
			value: () => 50,
			wallet: () => ({
				...TransactionFixture.wallet(),
				currency: () => "ARK",
				profile: () => profile,
			}),
		};

		render(<TransactionAmountLabel transaction={tokenFixture as any} />);

		expect(screen.getByText(/100.00 USDC/)).toBeInTheDocument();
	});

	it("should show fiat value for multiPayment transaction", () => {
		const exchangeMock = vi.spyOn(profile.exchangeRates(), "exchange").mockReturnValue(5);

		render(<TransactionFiatAmount transaction={fixture} exchangeCurrency="USD" />);

		expect(screen.getByText("$5.00")).toBeInTheDocument();

		exchangeMock.mockRestore();
	});

	it("should show fiat amount without hint when returnedAmount is zero", () => {
		const fixtureWithZeroReturned = {
			...fixture,
			recipients: () => [
				{ address: "address-1", amount: 10 },
				{ address: "address-2", amount: 20 },
			],
		};

		const exchangeMock = vi.spyOn(profile.exchangeRates(), "exchange").mockReturnValue(5);

		render(<TransactionFiatAmount transaction={fixtureWithZeroReturned as any} exchangeCurrency="USD" />);

		expect(screen.getByText("$5.00")).toBeInTheDocument();
		expect(screen.queryByTestId("AmountLabel__hint")).not.toBeInTheDocument();

		exchangeMock.mockRestore();
	});

	it("should use token symbol for token transfers", () => {
		const tokenTransferFixture = {
			...TransactionFixture,
			isTokenTransfer: () => true,
			token: () => ({
				token: () => ({
					displaySymbol: () => "DARK2…",
					symbol: () => "DARK20",
				}),
			}),
		};

		render(<TransactionTotalLabel showTicker={true} transaction={tokenTransferFixture} profile={profile} />);

		expect(screen.getByText(/DARK2/)).toBeInTheDocument();
	});

	it("should use wallet currency for non-token transfers", () => {
		const regularFixture = {
			...TransactionFixture,
			isTokenTransfer: () => false,
			token: () => {},
		};

		render(<TransactionTotalLabel transaction={regularFixture} profile={profile} />);

		expect(screen.getByText(/ARK/)).toBeInTheDocument();
	});

	it("should handle validator resignation with isSuccess", () => {
		const validatorResignationFixture = {
			...TransactionFixture,
			isSent: () => false,
			isValidatorResignation: () => true,
			wallet: () => ({
				...TransactionFixture.wallet(),
				validatorFee: () => 0,
			}),
		};

		const { container } = render(
			<TransactionTotalLabel
				transaction={
					{
						...validatorResignationFixture,
						isSuccess: () => true,
					} as any
				}
				profile={profile}
			/>,
		);

		expect(container).toBeInTheDocument();
	});

	it("should render without styles when hideStyles is true", () => {
		render(<TransactionTotalLabel transaction={fixture} hideStyles={true} profile={profile} />);

		expect(screen.getByText(/DARK/)).toBeInTheDocument();
	});

	it("should show hint in TransactionTotalLabel when returnedAmount is greater than 0", () => {
		render(<TransactionTotalLabel transaction={fixture} profile={profile} />);

		expect(screen.getByTestId("AmountLabel__hint")).toBeInTheDocument();
	});

	it("should use wallet currency when token property is not present", () => {
		const baseFixture = {
			...TransactionFixture,
			fee: () => 21,
			isMultiPayment: () => false,
			isReturn: () => false,
			isSent: () => false,
			value: () => 50,
			wallet: () => ({
				...TransactionFixture.wallet(),
				currency: () => "ARK",
				profile: () => profile,
			}),
		};

		const fixtureWithoutToken = Object.fromEntries(
			Object.entries(baseFixture).filter(([key]) => key !== "token"),
		) as any;

		render(<TransactionAmountLabel transaction={fixtureWithoutToken} />);

		expect(screen.getByText(/50.00 ARK/)).toBeInTheDocument();
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
		const scrollWidthSpy = vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(300);
		const clientWidthSpy = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(40);

		renderResponsive(
			<TransactionTypeLabel tooltipContent="Very Long Transaction Type Name" props={defaultProps}>
				Very Long Transaction Type Name
			</TransactionTypeLabel>,
			"lg",
		);

		expect(screen.getByTestId("TransactionRow__type")).toBeInTheDocument();

		const span = screen.getByText("Very Long Transaction Type Name");
		await userEvent.hover(span);

		expect(screen.getByRole("tooltip")).toBeInTheDocument();

		scrollWidthSpy.mockRestore();
		clientWidthSpy.mockRestore();
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
