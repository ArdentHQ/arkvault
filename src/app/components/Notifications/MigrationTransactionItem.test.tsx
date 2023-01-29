import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { MigrationTransactionItem } from "./MigrationTransactionItem";
import { env, getDefaultProfileId, render, screen, waitFor, renderResponsive } from "@/utils/testing-library";
import { MigrationTransactionStatus } from "@/domains/migration/migration.contracts";
import * as useWalletAlias from "@/app/hooks/use-wallet-alias";
let profile: Contracts.IProfile;

describe("MigrationTransactionItem", () => {
	let transaction: any;

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		transaction = {
			address: "D5pVkhZbSb4UNXvfmF6j7zdau8yGxfKwSv",
			amount: 123,
			id: "id",
			migrationAddress: "0x0000000000000000000000000000000000000000",
			status: MigrationTransactionStatus.Confirmed,
			timestamp: Date.now() / 1000,
		};
	});

	it("should render notification item", async () => {
		render(
			<table>
				<tbody>
					<MigrationTransactionItem
						transaction={transaction}
						profile={profile}
						onClick={() => {}}
						onVisibilityChange={vi.fn()}
					/>
				</tbody>
			</table>,
		);

		await waitFor(() => expect(screen.getAllByTestId("MigrationTransactionItem__button")).toHaveLength(1));
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render in xs", (breakpoint) => {
		const { container } = renderResponsive(
			<table>
				<tbody>
					<MigrationTransactionItem
						transaction={transaction}
						profile={profile}
						onVisibilityChange={vi.fn()}
					/>
				</tbody>
			</table>,
			breakpoint,
		);

		expect(container).toMatchSnapshot();
	});

	it("should render notification item with wallet alias", async () => {
		const useWalletSpy = vi.spyOn(useWalletAlias, "useWalletAlias").mockReturnValue({
			getWalletAlias() {
				return {
					alias: "ARK Wallet 1",
				};
			},
		} as any);

		const findAddressSpy = vi.spyOn(profile.wallets(), "findByAddressWithNetwork").mockReturnValue({
			address: () => "D5pVkhZbSb4UNXvfmF6j7zdau8yGxfKwSv",
			network: () => {},
		} as any);

		render(
			<table>
				<tbody>
					<MigrationTransactionItem
						transaction={transaction}
						profile={profile}
						onClick={() => {}}
						onVisibilityChange={vi.fn()}
					/>
				</tbody>
			</table>,
		);
		await waitFor(() => expect(screen.getAllByTestId("Address__alias")).toHaveLength(1));

		expect(screen.getByTestId("Address__alias")).toHaveTextContent("ARK Wallet 1");

		findAddressSpy.mockRestore();
		useWalletSpy.mockRestore();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should emit events onClick in xs", async (breakpoint) => {
		const onClick = vi.fn();

		renderResponsive(
			<table>
				<tbody>
					<MigrationTransactionItem
						transaction={transaction}
						profile={profile}
						onClick={onClick}
						onVisibilityChange={vi.fn()}
					/>
				</tbody>
			</table>,
			breakpoint,
		);

		await waitFor(() => expect(screen.getAllByTestId("TableRow")).toHaveLength(1));

		userEvent.click(screen.getByTestId("TableRow"));

		await waitFor(() => expect(onClick).toHaveBeenCalledWith(transaction));
	});

	it("should emit onClick event when clickining on migration succesfsul link", async () => {
		const onClick = vi.fn();

		render(
			<table>
				<tbody>
					<MigrationTransactionItem
						transaction={transaction}
						profile={profile}
						onClick={onClick}
						onVisibilityChange={vi.fn()}
					/>
				</tbody>
			</table>,
		);

		await waitFor(() => expect(screen.getAllByTestId("TableRow")).toHaveLength(1));

		userEvent.click(screen.getByTestId("MigrationTransactionItem__button"));

		await waitFor(() => expect(onClick).toHaveBeenCalledWith(transaction));
	});
});
