import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";
import { sortByDesc } from "@ardenthq/sdk-helpers";
import userEvent from "@testing-library/user-event";
import { TransactionTable } from "./TransactionTable";
import * as context from "@/app/contexts";
import * as polygonMigration from "@/utils/polygon-migration";
import * as useRandomNumberHook from "@/app/hooks/use-random-number";

import {
	env,
	getDefaultProfileId,
	getDefaultWalletId,
	render,
	renderResponsive,
	screen,
	waitFor,
} from "@/utils/testing-library";
import { requestMock, server } from "@/tests/mocks/server";

import { MigrationTransactionStatus } from "@/domains/migration/migration.contracts";
import { migrationWalletAddress } from "@/utils/polygon-migration";
import transactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions/byAddress/D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD-1-10.json";

describe("TransactionTable", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let transactions: DTO.ExtendedConfirmedTransactionData[];
	let polygonIndexerUrlSpy;

	beforeEach(async () => {
		polygonIndexerUrlSpy = vi
			.spyOn(polygonMigration, "polygonIndexerUrl")
			.mockReturnValue("https://mumbai.somehost.com/");

		server.use(requestMock("https://ark-test.arkvault.io/api/transactions", transactionsFixture));

		server.use(
			requestMock("https://mumbai.somehost.com/transactions", [
				{
					arkTxHash: "abc123",
					polygonTxHash: "0x33a45223a017970c476e2fd86da242e57c941ba825b6817efa2b1c105378f236",
				},
			]),
		);

		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().findById(getDefaultWalletId());

		const allTransactions = await wallet.transactionIndex().all();
		transactions = allTransactions.items();
	});

	afterEach(() => {
		polygonIndexerUrlSpy.mockRestore();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render responsive", (breakpoint) => {
		const { asFragment } = renderResponsive(
			<TransactionTable transactions={transactions} profile={profile} />,
			breakpoint,
		);

		expect(screen.getAllByTestId("TableRow")).toHaveLength(transactions.length);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with currency", () => {
		render(<TransactionTable transactions={transactions} exchangeCurrency="BTC" profile={profile} />);

		expect(screen.getAllByTestId("TransactionRow__currency")).toHaveLength(transactions.length);
	});

	it("should render compact", () => {
		const { asFragment } = render(<TransactionTable transactions={transactions} profile={profile} isCompact />);

		expect(screen.getAllByTestId("TableRow")).toHaveLength(transactions.length);
		expect(asFragment()).toMatchSnapshot();
	});

	describe("loading state", () => {
		let useRandomNumberSpy: vi.SpyInstance;

		beforeAll(() => {
			useRandomNumberSpy = vi.spyOn(useRandomNumberHook, "useRandomNumber").mockImplementation(() => 1);
		});

		afterAll(() => {
			useRandomNumberSpy.mockRestore();
		});

		it("should render", () => {
			const { asFragment } = render(
				<TransactionTable transactions={[]} isLoading skeletonRowsLimit={5} profile={profile} />,
			);

			expect(screen.getAllByTestId("TableRow")).toHaveLength(5);
			expect(asFragment()).toMatchSnapshot();
		});

		it("should render with currency column", () => {
			const { asFragment } = render(
				<TransactionTable
					transactions={[]}
					isLoading
					exchangeCurrency="BTC"
					skeletonRowsLimit={5}
					profile={profile}
				/>,
			);

			expect(screen.getAllByTestId("TableRow")).toHaveLength(5);
			expect(asFragment()).toMatchSnapshot();
		});

		it("should render compact", () => {
			const { asFragment } = render(
				<TransactionTable transactions={[]} isLoading isCompact skeletonRowsLimit={5} profile={profile} />,
			);

			expect(screen.getAllByTestId("TableRow")).toHaveLength(5);
			expect(asFragment()).toMatchSnapshot();
		});
	});

	it("should emit action on the row click", () => {
		const onClick = vi.fn();
		const sortedByDateDesc = sortByDesc(transactions, (transaction) => transaction.timestamp());

		render(<TransactionTable transactions={sortedByDateDesc} onRowClick={onClick} profile={profile} />);

		userEvent.click(screen.getAllByTestId("TableRow")[0]);

		expect(onClick).toHaveBeenCalledWith(sortedByDateDesc[0]);
	});

	it("should emit action on the compact row click", async () => {
		const onClick = vi.fn();

		render(<TransactionTable transactions={transactions} onRowClick={onClick} isCompact profile={profile} />);

		userEvent.click(screen.getAllByTestId("TableRow")[0]);

		await waitFor(() => expect(onClick).toHaveBeenCalledWith(transactions[1]));
	});

	it("should show the migration modal on row click and hide", async () => {
		const useMigrationsSpy = vi.spyOn(context, "useMigrations").mockImplementation(() => ({
			getTransactionStatus: () => Promise.resolve(MigrationTransactionStatus.Confirmed),
		}));

		const profile = env.profiles().findById(getDefaultProfileId());

		const transactionFixture = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.transfer({
					data: {
						amount: 1,
						to: migrationWalletAddress(),
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
		) as any;

		render(<TransactionTable transactions={[transactionFixture]} profile={profile} />);

		await expect(screen.findByTestId("TransactionMigrationLink")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("TransactionMigrationLink"));

		await expect(screen.findByTestId("MigrationDetailsModal")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("Modal__close-button"));

		await waitFor(() => {
			expect(screen.queryByTestId("MigrationDetailsModal")).not.toBeInTheDocument();
		});

		useMigrationsSpy.mockRestore();
	});

	it("should show the migration modal on compact row click", async () => {
		const useMigrationsSpy = vi.spyOn(context, "useMigrations").mockImplementation(() => ({
			getTransactionStatus: () => Promise.resolve(MigrationTransactionStatus.Confirmed),
		}));

		const profile = env.profiles().findById(getDefaultProfileId());

		const transactionFixture = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.transfer({
					data: {
						amount: 1,
						to: migrationWalletAddress(),
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
		) as any;

		renderResponsive(<TransactionTable transactions={[transactionFixture]} profile={profile} />, "xs");

		await expect(screen.findByTestId("TransactionMigrationLink")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("TransactionMigrationLink"));

		await expect(screen.findByTestId("MigrationDetailsModal")).resolves.toBeVisible();

		useMigrationsSpy.mockRestore();
	});
});
