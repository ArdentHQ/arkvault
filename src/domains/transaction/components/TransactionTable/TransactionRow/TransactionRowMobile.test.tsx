import { Contracts } from "@/app/lib/profiles";
import React from "react";

import { TransactionRowMobile } from "./TransactionRowMobile";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { env, getDefaultProfileId, screen, renderResponsive } from "@/utils/testing-library";
let profile: Contracts.IProfile;

describe.each(["xs", "sm"])("TransactionRowMobile", (breakpoint) => {
	const render = (content: React.ReactNode) => renderResponsive(content, breakpoint);
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

	it("should render", () => {
		const { asFragment } = render(
			<table>
				<tbody>
					<TransactionRowMobile transaction={fixture} profile={profile} />
				</tbody>
			</table>,
		);

		expect(asFragment()).toMatchSnapshot();
		expect(screen.getByTestId("TableRow__mobile")).toBeInTheDocument();
		expect(screen.getAllByRole("cell")).toHaveLength(1);
		expect(screen.getByTestId("TransactionRow__timestamp")).toBeInTheDocument();
		expect(screen.getAllByTestId("Address__alias")).toHaveLength(2);
		expect(screen.getAllByTestId("Amount")).toHaveLength(2);
	});

	it("should render skeleton responsive", () => {
		render(
			<table>
				<tbody>
					<TransactionRowMobile
						transaction={{
							...fixture,
							wallet: () => ({
								...fixture.wallet(),
								currency: () => "BTC",
								isLedger: () => false,
								network: () => ({ isTest: () => false }),
							}),
						}}
						profile={profile}
						isLoading
					/>
				</tbody>
			</table>,
		);

		expect(screen.getByTestId("TransactionRow__skeleton")).toBeInTheDocument();
	});

	it("should render with currency", () => {
		const { asFragment } = render(
			<table>
				<tbody>
					<TransactionRowMobile
						transaction={{
							...fixture,
							wallet: () => ({
								...fixture.wallet(),
								currency: () => "DARK",
								isLedger: () => false,
								network: () => ({
									coin: () => "DARK",
									id: () => "ark.devnet",
								}),
							}),
						}}
						exchangeCurrency="DARK"
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
					<TransactionRowMobile transaction={{ ...fixture, timestamp: () => {} }} profile={profile} />
				</tbody>
			</table>,
		);

		expect(screen.getByTestId("TransactionRow__timestamp")).toHaveTextContent(commonTranslations.NOT_AVAILABLE);
	});

	it("should render timestamp formatted with TimeAgo", () => {
		render(
			<table>
				<tbody>
					<TransactionRowMobile transaction={fixture} profile={profile} />
				</tbody>
			</table>,
		);

		expect(screen.getByTestId("TransactionRow__timestamp")).toBeInTheDocument();
		expect(screen.getByText("A few seconds ago")).toBeInTheDocument();
	});

	it("should not hide sender when hideSender is false", () => {
		render(
			<table>
				<tbody>
					<TransactionRowMobile transaction={fixture} profile={profile} hideSender={false} />
				</tbody>
			</table>,
		);

		expect(screen.getByTestId("TransactionRowAddressing__container_advanced_recipient")).toBeInTheDocument();
		expect(screen.getByTestId("TransactionRowAddressing__container_advanced_sender")).toBeInTheDocument();
	});

	it("shoult hide sender when hideSender is true", () => {
		render(
			<table>
				<tbody>
					<TransactionRowMobile transaction={fixture} profile={profile} hideSender={true} />
				</tbody>
			</table>,
		);

		expect(screen.getByTestId("TransactionRowAddressing__container")).toBeInTheDocument();
	});

	it("should render amount with the currency in parenthesis", () => {
		render(
			<table>
				<tbody>
					<TransactionRowMobile transaction={fixture} profile={profile} hideSender={true} />
				</tbody>
			</table>,
		);

		expect(screen.getByText("Amount (ARK)")).toBeInTheDocument();
	});

	it("should render skeleton with hideSender", () => {
		render(
			<table>
				<tbody>
					<TransactionRowMobile transaction={fixture} profile={profile} hideSender={false} isLoading />
				</tbody>
			</table>,
		);

		expect(screen.getByTestId("TransactionRow__skeleton-sender")).toBeInTheDocument();
	});
});
