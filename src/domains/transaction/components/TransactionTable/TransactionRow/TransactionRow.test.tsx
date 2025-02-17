import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";

import { TransactionRow } from "./TransactionRow";
import * as useRandomNumberHook from "@/app/hooks/use-random-number";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { env, getDefaultProfileId, render, screen, renderResponsive } from "@/utils/testing-library";
let profile: Contracts.IProfile;

describe("TransactionRow", () => {
	const fixture = {
		...TransactionFixture,
		isSuccess: () => true,
		wallet: () => ({
			...TransactionFixture.wallet(),
			currency: () => "DARK",
			network: () => ({
				coin: () => "DARK",
				id: () => "ark.devnet",
			}),
			username: () => "test_username",
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
					<TransactionRow
						transaction={fixture as any}
						profile={profile}
						exchangeCurrency={"USD"}
						onClick={() => {}}
					/>
				</tbody>
			</table>,
		);

		expect(asFragment()).toMatchSnapshot();
		expect(screen.getAllByRole("cell")).toHaveLength(8);
		expect(screen.getByTestId("TransactionRow__id")).toBeInTheDocument();
		expect(screen.getByTestId("TransactionRow__timestamp")).toBeInTheDocument();
		expect(screen.getByTestId("TransactionRow__type")).toBeInTheDocument();
		expect(screen.getAllByTestId("Address__address")).toHaveLength(4);
		expect(screen.getAllByTestId("Amount")).toHaveLength(3);
	});

	it.each(["xs", "sm"])("should render responsive", (breakpoint) => {
		const { asFragment } = renderResponsive(
			<table>
				<tbody>
					<TransactionRow
						transaction={fixture as any}
						profile={profile}
						exchangeCurrency="USD"
						onClick={() => {}}
					/>
				</tbody>
			</table>,
			breakpoint,
		);

		expect(asFragment()).toMatchSnapshot();
		expect(screen.getByTestId("TableRow__mobile")).toBeInTheDocument();
		expect(screen.getAllByRole("cell")).toHaveLength(1);
		expect(screen.getByTestId("TransactionRow__timestamp")).toBeInTheDocument();
		expect(screen.getAllByTestId("Address__address")).toHaveLength(2);
		expect(screen.getAllByTestId("Amount")).toHaveLength(2);
	});

	it("should render skeleton", () => {
		const { asFragment } = render(
			<table>
				<tbody>
					<TransactionRow profile={profile} isLoading />
				</tbody>
			</table>,
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render skeleton with hideSender in mobile", () => {
		render(
			<table>
				<tbody>
					<TransactionRow profile={profile} isLoading hideSender={false} />
				</tbody>
			</table>,
		);

		expect(screen.getByTestId("TransactionRowSkeleton__recipient-mobile")).toBeInTheDocument();
	});

	it("should render skeleton with hideSender in desktop", () => {
		renderResponsive(
			<table>
				<tbody>
					<TransactionRow profile={profile} isLoading hideSender={false} />
				</tbody>
			</table>,
			"lg",
		);

		expect(screen.getByTestId("TransactionRowSkeleton__sender-desktop")).toBeInTheDocument();
	});

	it("should render with currency", () => {
		const { asFragment } = render(
			<table>
				<tbody>
					<TransactionRow
						transaction={
							{
								...fixture,
								amount: () => 0,
								wallet: () => ({
									...fixture.wallet(),
									currency: () => "DARK",
									isLedger: () => false,
									network: () => ({
										coin: () => "DARK",
										id: () => "ark.devnet",
									}),
								}),
							} as any
						}
						exchangeCurrency="DARK"
						profile={profile}
						onClick={() => {}}
					/>
				</tbody>
			</table>,
		);

		expect(asFragment()).toMatchSnapshot();
		expect(screen.getAllByTestId("Amount")).toHaveLength(3);
		expect(screen.queryByText(commonTranslations.NOT_AVAILABLE)).not.toBeInTheDocument();
	});

	it("should omit the currency for transactions from test networks", () => {
		const { asFragment } = render(
			<table>
				<tbody>
					<TransactionRow
						transaction={
							{
								...fixture,
								amount: () => 0,
								wallet: () => ({
									...fixture.wallet(),
									currency: () => "shouldUseDarkColors",
									isLedger: () => false,
									network: () => ({
										coin: () => "DARK",
										id: () => "ark.devnet",
									}),
								}),
							} as any
						}
						exchangeCurrency="DARK"
						profile={profile}
						onClick={() => {}}
					/>
				</tbody>
			</table>,
		);

		expect(asFragment()).toMatchSnapshot();
		expect(screen.getAllByTestId("Amount")).toHaveLength(3);
		expect(screen.queryByText(commonTranslations.NOT_AVAILABLE)).not.toBeInTheDocument();
	});

	it("should render timestamp formatted with TimeAgo", () => {
		render(
			<table>
				<tbody>
					<TransactionRow
						transaction={fixture as any}
						profile={profile}
						exchangeCurrency="USD"
						onClick={() => {}}
					/>
				</tbody>
			</table>,
		);

		expect(screen.getByTestId("TransactionRow__timestamp")).toBeInTheDocument();
		expect(screen.getAllByText("A few seconds ago")).toHaveLength(2);
	});

	it("should render N/A if timestamp is not available", () => {
		render(
			<table>
				<tbody>
					<TransactionRow
						transaction={{ ...fixture, timestamp: () => {} } as any}
						profile={profile}
						exchangeCurrency="USD"
						onClick={() => {}}
					/>
				</tbody>
			</table>,
		);

		expect(screen.getByTestId("TransactionRow__timestamp")).toHaveTextContent(commonTranslations.NOT_AVAILABLE);
		expect(screen.getAllByText(commonTranslations.NOT_AVAILABLE)).toHaveLength(2);
	});

	it("should send default exchange currency if not provided", () => {
		render(
			<table>
				<tbody>
					<TransactionRow transaction={fixture as any} profile={profile} onClick={() => {}} />
				</tbody>
			</table>,
		);

		expect(screen.getByTestId("TransactionRow__exchange-currency")).toHaveTextContent("0");
	});
});
