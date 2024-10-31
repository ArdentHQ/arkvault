import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";

import { TransactionRowMobile } from "./TransactionRowMobile";
import * as useRandomNumberHook from "@/app/hooks/use-random-number";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { env, getDefaultProfileId, screen, renderResponsive } from "@/utils/testing-library";
import {renderHook} from "@testing-library/react";
import {useTranslation} from "react-i18next";
import userEvent from "@testing-library/user-event";
let profile: Contracts.IProfile;

describe.each(["xs", "sm"])("TransactionRowMobile", (breakpoint) => {
	const render = (content: React.ReactNode) => renderResponsive(content, breakpoint);

	const fixture = {
		...TransactionFixture,
		wallet: () => ({
			...TransactionFixture.wallet(),
			currency: () => "DARK",
		}),
	};

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());

		vi.spyOn(useRandomNumberHook, "useRandomNumber").mockImplementation(() => 1);
	});

	afterAll(() => {
		useRandomNumberHook.useRandomNumber.mockRestore();
	});

	it("should render", () => {
		const { asFragment } = render(
			<table>
				<tbody>
					<TransactionRowMobile transaction={fixture as any} profile={profile} />
				</tbody>
			</table>,
		);

		expect(asFragment()).toMatchSnapshot();
		expect(screen.getByTestId("TableRow__mobile")).toBeInTheDocument();
		expect(screen.getAllByRole("cell")).toHaveLength(1);
		expect(screen.getByRole("link", { name: "ea63b…5c79b" })).toBeInTheDocument();
		expect(screen.getByTestId("TransactionRow__timestamp")).toBeInTheDocument();
		expect(screen.getAllByTestId("Address__address")).toHaveLength(1);
		expect(screen.getAllByTestId("Amount")).toHaveLength(2);
	});

	it("should render skeleton responsive", () => {
		const { asFragment } = render(
			<table>
				<tbody>
					<TransactionRowMobile
						transaction={
							{
								...fixture,
								wallet: () => ({
									...fixture.wallet(),
									currency: () => "BTC",
									isLedger: () => false,
									network: () => ({ isTest: () => false }),
								}),
							} as any
						}
						profile={profile}
						isLoading
					/>
				</tbody>
			</table>,
		);

		expect(asFragment()).toMatchSnapshot();
		expect(screen.getByTestId("TransactionRow__skeleton")).toBeInTheDocument();
	});

	it("should render with currency", () => {
		const { asFragment } = render(
			<table>
				<tbody>
					<TransactionRowMobile
						transaction={
							{
								...fixture,
								wallet: () => ({
									...fixture.wallet(),
									currency: () => "BTC",
									isLedger: () => false,
									network: () => ({ isTest: () => false }),
								}),
							} as any
						}
						exchangeCurrency="BTC"
						profile={profile}
					/>
				</tbody>
			</table>,
		);

		expect(asFragment()).toMatchSnapshot();
		expect(screen.getAllByTestId("Amount")).toHaveLength(2);
		expect(screen.queryByText(commonTranslations.NOT_AVAILABLE)).not.toBeInTheDocument();
	});

	it("should render N/A if timestamp is not available", () => {
		render(
			<table>
				<tbody>
					<TransactionRowMobile transaction={{ ...fixture, timestamp: () => {} } as any} profile={profile} />
				</tbody>
			</table>,
		);

		expect(screen.getByTestId("TransactionRow__timestamp")).toHaveTextContent(commonTranslations.NOT_AVAILABLE);
	});

	it("should render timestamp formatted with TimeAgo", () => {
		render(
			<table>
				<tbody>
					<TransactionRowMobile transaction={fixture as any} profile={profile} />
				</tbody>
			</table>,
		);

		expect(screen.getByTestId("TransactionRow__timestamp")).toBeInTheDocument();
		expect(screen.getByText("A few seconds ago")).toBeInTheDocument();
	});

	it('should handle sent to self with multiPayment transaction', async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		render(
			<table>
				<tbody>
				<TransactionRowMobile
					transaction={{
						...fixture,
						fee: () => 5,
						isMultiPayment: () => true,
						isReturn: () => true,
						recipients: () => [
							{address: "address-1", amount: 10},
							{address: "address-2", amount: 20},
							{address: fixture.wallet().address(), amount: 30},
						],
						total: () => 65,
					}}
					exchangeCurrency="USD"
					profile={profile}
				/>
				</tbody>
			</table>,
		);

		// should have a label
		expect(screen.getByTestId("AmountLabel__hint")).toBeInTheDocument();

		await userEvent.hover(screen.getByTestId("AmountLabel__hint"));

		const hintText = t("TRANSACTION.HINT_AMOUNT_EXCLUDING", { amount: 30, currency: "DARK" })

		expect(screen.getByText(hintText)).toBeInTheDocument();

		// should have an amount without returned amount
		expect(screen.getByText(/35 DARK/)).toBeInTheDocument();
	});
});
