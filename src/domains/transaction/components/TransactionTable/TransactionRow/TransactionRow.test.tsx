import { Contracts } from "@/app/lib/profiles";
import React from "react";

import { TransactionRow } from "./TransactionRow";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { env, getDefaultProfileId, render, screen, renderResponsive } from "@/utils/testing-library";
let profile: Contracts.IProfile;

describe("TransactionRow", () => {
	let fixture;

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());

		fixture = {
			...TransactionFixture,
			isSuccess: () => true,
			wallet: () => ({
				...TransactionFixture.wallet(),
				currency: () => "ARK",
				network: () => ({
					coin: () => "Mainsail",
					id: () => "mainsail.devnet",
				}),
				profile: () => profile,
				username: () => "test_username",
			}),
		};
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render responsive (%s)", (breakpoint) => {
		const { asFragment } = renderResponsive(
			<table>
				<tbody>
					<TransactionRow
						transaction={fixture}
						profile={profile}
						exchangeCurrency={"USD"}
						onClick={() => { }}
					/>
				</tbody>
			</table>,
			breakpoint
		);

		expect(screen.getByTestId("TransactionRow__id")).toBeInTheDocument();
		expect(screen.getByTestId("TransactionRow__timestamp")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm"])("should render responsive", (breakpoint) => {
		const { asFragment } = renderResponsive(
			<table>
				<tbody>
					<TransactionRow transaction={fixture} profile={profile} exchangeCurrency="USD" onClick={() => { }} />
				</tbody>
			</table>,
			breakpoint,
		);

		expect(asFragment()).toMatchSnapshot();
		expect(screen.getByTestId("TableRow__mobile")).toBeInTheDocument();
		expect(screen.getAllByRole("cell")).toHaveLength(1);
		expect(screen.getByTestId("TransactionRow__timestamp")).toBeInTheDocument();
		expect(screen.getAllByTestId("Address__alias")).toHaveLength(2);
		expect(screen.getAllByTestId("Amount")).toHaveLength(2);
	});

	it("should render skeleton", () => {
		render(
			<table>
				<tbody>
					<TransactionRow profile={profile} isLoading />
				</tbody>
			</table>,
		);

		expect(screen.getByTestId("TransactionRowSkeleton__sender-desktop")).toBeInTheDocument();
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
		const { asFragment } = renderResponsive(
			<table>
				<tbody>
					<TransactionRow
						transaction={{
							...fixture,
							amount: () => 0,
							wallet: () => ({
								...fixture.wallet(),
								currency: () => "ARK",
								isLedger: () => false,
								network: () => ({
									coin: () => "ARK",
									id: () => "mainsail.devnet",
								}),
							}),
						}}
						exchangeCurrency="ARK"
						profile={profile}
						onClick={() => { }}
					/>
				</tbody>
			</table>,
			"xl"
		);

		expect(asFragment()).toMatchSnapshot();
		expect(screen.getAllByTestId("Amount")).toHaveLength(3);
		expect(screen.queryByText(commonTranslations.NOT_AVAILABLE)).not.toBeInTheDocument();
	});

	it("should omit the currency for transactions from test networks", () => {
		const { asFragment } = renderResponsive(
			<table>
				<tbody>
					<TransactionRow
						transaction={{
							...fixture,
							amount: () => 0,
							wallet: () => ({
								...fixture.wallet(),
								currency: () => "shouldUseARKColors",
								isLedger: () => false,
								network: () => ({
									coin: () => "ARK",
									id: () => "mainsail.devnet",
								}),
							}),
						}}
						exchangeCurrency="ARK"
						profile={profile}
						onClick={() => { }}
					/>
				</tbody>
			</table>,
			"xl"
		);

		expect(asFragment()).toMatchSnapshot();
		expect(screen.getAllByTestId("Amount")).toHaveLength(3);
		expect(screen.queryByText(commonTranslations.NOT_AVAILABLE)).not.toBeInTheDocument();
	});

	it("should render timestamp formatted with TimeAgo", () => {
		render(
			<table>
				<tbody>
					<TransactionRow transaction={fixture} profile={profile} exchangeCurrency="USD" onClick={() => { }} />
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
						transaction={{ ...fixture, timestamp: () => { } }}
						profile={profile}
						exchangeCurrency="USD"
						onClick={() => { }}
					/>
				</tbody>
			</table>,
		);

		expect(screen.getByTestId("TransactionRow__timestamp")).toHaveTextContent(commonTranslations.NOT_AVAILABLE);
		expect(screen.getAllByText(commonTranslations.NOT_AVAILABLE)).toHaveLength(2);
	});

	it("should send default exchange currency if not provided", () => {
		renderResponsive(
			<table>
				<tbody>
					<TransactionRow transaction={fixture} profile={profile} onClick={() => { }} />
				</tbody>
			</table>,
			"xl"
		);

		expect(screen.getByTestId("TransactionRow__exchange-currency")).toHaveTextContent("0");
	});
});
