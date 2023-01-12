import React from "react";
import { createHashHistory } from "history";
import userEvent from "@testing-library/user-event";
import { Route } from "react-router-dom";
import { MigrationPendingStep } from "./MigrationPendingStep";
import {
	renderResponsiveWithRoute,
	getDefaultProfileId,
	screen,
	env,
	getDefaultWalletId,
} from "@/utils/testing-library";
import { useTheme } from "@/app/hooks/use-theme";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";

const history = createHashHistory();
let migrationUrl: string;

let transaction: DTO.ExtendedSignedTransactionData;
let wallet: Contracts.IReadWriteWallet;

describe("MigrationPendingStep", () => {
	beforeAll(async () => {
		const profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().findById(getDefaultWalletId());

		migrationUrl = `/profiles/${getDefaultProfileId()}/migration/add`;
		history.push(migrationUrl);

		transaction = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.transfer({
					data: {
						amount: 1,
						to: wallet.address(),
					},
					fee: 1,
					nonce: "1",
					signatory: await wallet
						.coin()
						.signatory()
						.multiSignature({
							min: 2,
							publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
						}),
				}),
			wallet,
		);
	});

	it.each(["xs", "sm"])("should render in %s", (breakpoint) => {
		const { asFragment } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/migration/add">
				<MigrationPendingStep transaction={transaction} />
			</Route>,
			breakpoint,
			{
				history,
				route: migrationUrl,
			},
		);

		userEvent.click(screen.getByTestId("BackToDashboard__button"));

		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm"])("should render in %s in dark mode", (breakpoint) => {
		useTheme().setTheme("dark");

		const { asFragment } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/migration/add">
				<MigrationPendingStep transaction={transaction} />
			</Route>,
			breakpoint,
			{
				history,
				route: migrationUrl,
			},
		);

		userEvent.click(screen.getByTestId("BackToDashboard__button"));

		expect(asFragment()).toMatchSnapshot();
	});
});
