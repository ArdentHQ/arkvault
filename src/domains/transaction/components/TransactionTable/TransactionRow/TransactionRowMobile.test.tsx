import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";

import { TransactionRowMobile } from "./TransactionRowMobile";
import * as useRandomNumberHook from "@/app/hooks/use-random-number";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { env, getDefaultProfileId, screen, renderResponsive } from "@/utils/testing-library";
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
		expect(screen.getByRole("link", { name: "ea63bf…b5c79b" })).toBeInTheDocument();
		expect(screen.getByTestId("TransactionRow__timestamp")).toBeInTheDocument();
		expect(screen.getAllByTestId("Address__address")).toHaveLength(2);
		expect(screen.getByTestId("Amount")).toBeInTheDocument();
	});

	it("should render skeleton responsive", () => {
		const { asFragment } = render(
			<table>
				<tbody>
					<TransactionRowMobile profile={profile} isLoading />
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

	it("should omit the currency for transactions from test networks", () => {
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
									network: () => ({ isTest: () => true }),
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
		expect(screen.getAllByTestId("Amount")).toHaveLength(1);
		expect(screen.getByText(commonTranslations.NOT_AVAILABLE)).toBeInTheDocument();
	});
});
