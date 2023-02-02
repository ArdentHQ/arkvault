import React, { useState } from "react";
import { DTO, Contracts } from "@ardenthq/sdk-profiles";
import { ethers } from "ethers";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { MigrationProvider, useMigrations } from "./Migration";
import * as useProfileWatcher from "@/app/hooks/use-profile-watcher";
import { render, screen, getDefaultProfileId, env, waitFor } from "@/utils/testing-library";
import * as polygonMigration from "@/utils/polygon-migration";
import { Migration, MigrationTransaction, MigrationTransactionStatus } from "@/domains/migration/migration.contracts";
import { httpClient } from "@/app/services";
import { server, requestMock } from "@/tests/mocks/server";
import * as useContractMock from "@/domains/migration/hooks/use-contract";
import * as useMigrationTransactionsMock from "@/domains/migration/hooks/use-migration-transactions";

const Test = ({ transactionToHandle }: { transactionToHandle?: MigrationTransaction }) => {
	const {
		isLoading,
		migrations,
		storeTransactions,
		contractIsPaused,
		markMigrationsAsRead,
		loadMigrationsError,
		onLoadMore,
		getMigrationById,
		resolveTransaction,
	} = useMigrations();

	const [selectedMigration, setSelectedMigration] = useState<Migration | undefined>(undefined);
	const [selectedTransaction, setSelectedTransaction] = useState<MigrationTransaction | undefined>(undefined);

	const createAndStoreTransaction = async () => {
		await storeTransactions([transactionToHandle]);
	};
	const getMigration = () => {
		setSelectedMigration(getMigrationById(transactionToHandle.id()));
	};

	const getTransaction = () => {
		setSelectedTransaction(resolveTransaction(migrations.find((m) => m.id === transactionToHandle.id())));
	};

	const markMigrationAsReadHandler = () => {
		markMigrationsAsRead([migrations[0]]);
	};

	if (isLoading) {
		return <span data-testid="Migration__loading">Contract Loading...</span>;
	}

	if (loadMigrationsError) {
		return <span data-testid="Migration__load_error">Load error</span>;
	}

	if (selectedMigration) {
		return <span data-testid="Migration__selected">{selectedMigration.id}</span>;
	}
	if (selectedTransaction) {
		return <span data-testid="Transaction__selected">{selectedTransaction.id()}</span>;
	}

	return (
		<div>
			<ul data-testid="Migrations">
				{migrations.map((migration) => (
					<li data-testid="MigrationItem" key={migration.id}>
						{migration.address}:{migration.status}
					</li>
				))}
			</ul>

			<ul>
				<li>
					<button
						data-testid="Migrations__store"
						type="button"
						onClick={async () => await createAndStoreTransaction()}
					>
						Add
					</button>
				</li>

				<li>
					<button data-testid="Migrations__markasread" type="button" onClick={markMigrationAsReadHandler}>
						Mark as read
					</button>
				</li>
				<li>
					<button data-testid="Migrations__loadmore" type="button" onClick={onLoadMore}>
						Load More
					</button>
				</li>
				<li>
					<button data-testid="Migrations__get" type="button" onClick={getMigration}>
						Get Migration
					</button>
				</li>
				<li>
					<button data-testid="Migrations__get_transaction" type="button" onClick={getTransaction}>
						Get Transaction
					</button>
				</li>
			</ul>

			{contractIsPaused ? (
				<span data-testid="Migration__contract_paused">Contract paused</span>
			) : (
				<span data-testid="Migration__contract_not_paused">Contract not paused</span>
			)}
		</div>
	);
};

let profile: Contracts.IProfile;

describe("Migration Context", () => {
	let useContractSpy;
	let useTransactionsSpy;
	const useTransactionsDefault = {
		hasMore: false,
		isLoadingMoreTransactions: false,
		latestTransactions: [],
		limit: 11,
		loadMigrationWalletTransactions: vi.fn(),
		page: 1,
		transactionsLoaded: false,
	};
	let profileWatcherMock;
	let polygonIndexerUrlSpy;
	let isValidMigrationTransactionSpy;
	let transactionFixture;
	let secondTransactionFixture;
	let getContractMigrationsSpy;

	const mockTransactions = (
		transactions: MigrationTransaction[],
		useTransactionsOverrides = {},
		status = [MigrationTransactionStatus.Pending, MigrationTransactionStatus.Confirmed],
	) => {
		useTransactionsSpy = vi.spyOn(useMigrationTransactionsMock, "useMigrationTransactions").mockReturnValue({
			...useTransactionsDefault,
			latestTransactions: transactions,
			...useTransactionsOverrides,
		});

		const contractMigrations = transactions.map((transaction, index) => ({
			arkTxHash: `0x${transaction.id()}`,
			recipient:
				status[index] === MigrationTransactionStatus.Pending
					? ethers.constants.AddressZero
					: transaction.recipient(),
		}));

		getContractMigrationsSpy.mockReturnValue(contractMigrations);

		const polygonMigrations = transactions.map((transaction, index) => ({
			arkTxHash: transaction.id(),
			polygonTxHash: `0x33a45223a017970c476e2fd86da242e57c941ba825b6817efa2b1c105378f236${index}`,
		}));

		server.use(requestMock("https://mumbai.somehost.com/transactions", polygonMigrations));
	};

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		const wallet = profile.wallets().first();

		transactionFixture = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.transfer({
					data: {
						amount: 1,
						to: polygonMigration.migrationWalletAddress(),
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

		secondTransactionFixture = new DTO.ExtendedSignedTransactionData(
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

		vi.mock("ethers");

		vi.unmock("@/app/contexts/Migration/Migration");
	});

	afterAll(() => {
		vi.unmock("ethers");

		vi.mock("@/app/contexts/Migration/Migration", () => ({
			MigrationProvider: ({ children }) => React.createElement("div", {}, children),
			useMigrations: () => ({ migrations: [], migrationsLoaded: false }),
		}));
	});

	beforeEach(() => {
		getContractMigrationsSpy = vi.fn().mockReturnValue([]);

		useContractSpy = vi.spyOn(useContractMock, "useContract").mockReturnValue({
			contract: {},
			contractIsPaused: false,
			getContractMigrations: getContractMigrationsSpy,
		});

		useTransactionsSpy = vi
			.spyOn(useMigrationTransactionsMock, "useMigrationTransactions")
			.mockReturnValue(useTransactionsDefault);

		profileWatcherMock = vi.spyOn(useProfileWatcher, "useProfileWatcher").mockReturnValue(profile);

		polygonIndexerUrlSpy = vi
			.spyOn(polygonMigration, "polygonIndexerUrl")
			.mockReturnValue("https://mumbai.somehost.com/");

		isValidMigrationTransactionSpy = vi
			.spyOn(polygonMigration, "isValidMigrationTransaction")
			.mockReturnValue(true);

		httpClient.clearCache();
	});

	afterEach(() => {
		profileWatcherMock.mockRestore();
		polygonIndexerUrlSpy.mockRestore();
		isValidMigrationTransactionSpy.mockRestore();
		useContractSpy.mockRestore();
		useTransactionsSpy.mockRestore();
	});

	it("should render the wrapper properly", () => {
		const { container } = render(
			<MigrationProvider>
				<span data-testid="MigrationProvider__content">Migration Provider content</span>
			</MigrationProvider>,
		);

		expect(screen.getByTestId("MigrationProvider__content")).toBeInTheDocument();

		expect(container).toBeInTheDocument();
	});

	it("should load the migrations", async () => {
		mockTransactions([transactionFixture, secondTransactionFixture]);

		render(
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
		);

		expect(screen.getByTestId("Migration__loading")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.queryByTestId("Migration__loading")).not.toBeInTheDocument();
		});

		expect(screen.getAllByTestId("MigrationItem")).toHaveLength(2);
	});

	it("should store a new migration", async () => {
		mockTransactions([transactionFixture]);

		render(
			<MigrationProvider>
				<Test transactionToHandle={secondTransactionFixture} />
			</MigrationProvider>,
		);

		expect(screen.getByTestId("Migration__loading")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.queryByTestId("Migration__loading")).not.toBeInTheDocument();
		});

		expect(screen.getAllByTestId("MigrationItem")).toHaveLength(1);

		mockTransactions([transactionFixture, secondTransactionFixture]);

		userEvent.click(screen.getByTestId("Migrations__store"));

		await waitFor(() => {
			expect(screen.queryAllByTestId("MigrationItem")).toHaveLength(2);
		});
	});

	it("should reload migrations details if has pending migrations", async () => {
		mockTransactions([transactionFixture]);

		let reloadMigrationsCallback;

		const originalSetInterval = window.setInterval;
		const setIntervalSpy = vi.spyOn(window, "setInterval").mockImplementation((callback, time) => {
			if (callback.name === "reloadMigrationsCallback") {
				reloadMigrationsCallback = callback;
				return;
			}

			originalSetInterval(callback, time);
		});

		render(
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
		);

		expect(screen.getByTestId("Migration__loading")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.queryByTestId("Migration__loading")).not.toBeInTheDocument();
		});

		expect(getContractMigrationsSpy).toHaveBeenCalledTimes(1);

		reloadMigrationsCallback();

		expect(getContractMigrationsSpy).toHaveBeenCalledTimes(2);

		setIntervalSpy.mockRestore();
	});

	it("should not add a reload interval if no profile", async () => {
		profileWatcherMock = vi.spyOn(useProfileWatcher, "useProfileWatcher").mockReturnValue(undefined);

		mockTransactions([]);

		let reloadMigrationsCallback;

		const originalSetInterval = window.setInterval;
		const setIntervalSpy = vi.spyOn(window, "setInterval").mockImplementation((callback, time) => {
			if (callback.name === "reloadMigrationsCallback") {
				reloadMigrationsCallback = callback;
				return;
			}

			originalSetInterval(callback, time);
		});

		render(
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
		);

		expect(reloadMigrationsCallback).toBeUndefined();

		setIntervalSpy.mockRestore();
	});

	it("should reload migrations details if has a migrations with undefined status", async () => {
		mockTransactions([transactionFixture], {}, [undefined]);

		let reloadMigrationsCallback;

		const originalSetInterval = window.setInterval;
		const setIntervalSpy = vi.spyOn(window, "setInterval").mockImplementation((callback, time) => {
			if (callback.name === "reloadMigrationsCallback") {
				reloadMigrationsCallback = callback;
				return;
			}

			originalSetInterval(callback, time);
		});

		render(
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
		);

		expect(screen.getByTestId("Migration__loading")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.queryByTestId("Migration__loading")).not.toBeInTheDocument();
		});

		expect(getContractMigrationsSpy).toHaveBeenCalledTimes(1);

		reloadMigrationsCallback();

		expect(getContractMigrationsSpy).toHaveBeenCalledTimes(1);

		setIntervalSpy.mockRestore();
	});

	it("should not reload migrations details if all migrations are confirmed", async () => {
		mockTransactions([transactionFixture], {}, [MigrationTransactionStatus.Confirmed]);

		let reloadMigrationsCallback;

		const originalSetInterval = window.setInterval;
		const setIntervalSpy = vi.spyOn(window, "setInterval").mockImplementation((callback, time) => {
			if (callback.name === "reloadMigrationsCallback") {
				reloadMigrationsCallback = callback;
				return;
			}

			originalSetInterval(callback, time);
		});

		render(
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
		);

		expect(screen.getByTestId("Migration__loading")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.queryByTestId("Migration__loading")).not.toBeInTheDocument();
		});

		expect(getContractMigrationsSpy).toHaveBeenCalledTimes(1);

		reloadMigrationsCallback();

		expect(getContractMigrationsSpy).toHaveBeenCalledTimes(1);

		setIntervalSpy.mockRestore();
	});

	it("should update the status of the migrations", async () => {
		// When loaded first transaction is pending
		mockTransactions([transactionFixture, secondTransactionFixture], {}, [
			MigrationTransactionStatus.Pending,
			MigrationTransactionStatus.Confirmed,
		]);

		let reloadMigrationsCallback;

		const originalSetInterval = window.setInterval;
		const setIntervalSpy = vi.spyOn(window, "setInterval").mockImplementation((callback, time) => {
			if (callback.name === "reloadMigrationsCallback") {
				reloadMigrationsCallback = callback;
				return;
			}

			originalSetInterval(callback, time);
		});

		render(
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
		);

		expect(screen.getByTestId("Migration__loading")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.queryByTestId("Migration__loading")).not.toBeInTheDocument();
		});

		expect(screen.getAllByTestId("MigrationItem")[0]).toHaveTextContent(`${transactionFixture.sender()}:pending`);

		// Once realoded the first transaction is now confirmed
		mockTransactions([transactionFixture, secondTransactionFixture], {}, [
			MigrationTransactionStatus.Confirmed,
			MigrationTransactionStatus.Confirmed,
		]);

		reloadMigrationsCallback();

		await waitFor(() => {
			expect(screen.getAllByTestId("MigrationItem")[0]).toHaveTextContent(
				`${transactionFixture.sender()}:confirmed`,
			);
		});

		setIntervalSpy.mockRestore();
	});

	it("should call the method to load more transactions", async () => {
		const loadMoreTransactionsSpy = vi.fn();

		mockTransactions([transactionFixture], {
			loadMigrationWalletTransactions: loadMoreTransactionsSpy,
		});

		render(
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
		);

		expect(screen.getByTestId("Migration__loading")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.queryByTestId("Migration__loading")).not.toBeInTheDocument();
		});

		userEvent.click(screen.getByTestId("Migrations__loadmore"));

		expect(loadMoreTransactionsSpy).toHaveBeenCalled();
	});

	it("should get a migration by id", async () => {
		mockTransactions([transactionFixture]);

		render(
			<MigrationProvider>
				<Test transactionToHandle={transactionFixture} />
			</MigrationProvider>,
		);

		expect(screen.getByTestId("Migration__loading")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.queryByTestId("Migration__loading")).not.toBeInTheDocument();
		});

		expect(screen.getAllByTestId("MigrationItem")).toHaveLength(1);

		mockTransactions([transactionFixture, secondTransactionFixture]);

		userEvent.click(screen.getByTestId("Migrations__get"));

		await waitFor(() => {
			expect(screen.getByTestId("Migration__selected")).toHaveTextContent(transactionFixture.id());
		});
	});

	it("should resolve a transaction", async () => {
		mockTransactions([transactionFixture]);

		render(
			<MigrationProvider>
				<Test transactionToHandle={transactionFixture} />
			</MigrationProvider>,
		);

		expect(screen.getByTestId("Migration__loading")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.queryByTestId("Migration__loading")).not.toBeInTheDocument();
		});

		expect(screen.getAllByTestId("MigrationItem")).toHaveLength(1);

		userEvent.click(screen.getByTestId("Migrations__get_transaction"));

		await waitFor(() => {
			expect(screen.getByTestId("Transaction__selected")).toHaveTextContent(transactionFixture.id());
		});
	});

	it("should handle rpc error when loading initial status", async () => {
		mockTransactions([transactionFixture]);

		getContractMigrationsSpy.mockImplementation(() => {
			throw new Error("RPC Error");
		});

		render(
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
		);

		expect(screen.getByTestId("Migration__loading")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.queryByTestId("Migration__loading")).not.toBeInTheDocument();
		});

		expect(screen.getByTestId("Migration__load_error")).toBeInTheDocument();
	});

	it("should handle rpc error when loading migration details", async () => {
		mockTransactions([transactionFixture]);

		let reloadMigrationsCallback;

		const originalSetInterval = window.setInterval;
		const setIntervalSpy = vi.spyOn(window, "setInterval").mockImplementation((callback, time) => {
			if (callback.name === "reloadMigrationsCallback") {
				reloadMigrationsCallback = callback;
				return;
			}

			originalSetInterval(callback, time);
		});

		render(
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
		);

		expect(screen.getByTestId("Migration__loading")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.queryByTestId("Migration__loading")).not.toBeInTheDocument();
		});

		expect(screen.queryByTestId("Migration__load_error")).not.toBeInTheDocument();

		getContractMigrationsSpy.mockImplementation(() => {
			throw new Error("RPC Error");
		});

		reloadMigrationsCallback();

		await waitFor(() => {
			expect(screen.getByTestId("Migration__load_error")).to.toBeInTheDocument();
		});

		setIntervalSpy.mockRestore();
	});

	// it("should load the migration id for newly confirmed migrations", async () => {
	// 	const { clearStoredMigrationsMock, getMigrationsByArkTxHashMock } = mockStoredMigrations([
	// 		migrationPendingFixture,
	// 	]);

	// 	getMigrationsByArkTxHashMock.mockImplementation(() => [
	// 		{
	// 			amount: migrationPendingFixture.amount,
	// 			arkTxHash: `0x${migrationPendingFixture.id}`,
	// 			// A recipient means confirmed
	// 			recipient: "0xWhatevs",
	// 		},
	// 	]);

	// 	render(
	// 		<Route path="/profiles/:profileId/migration">
	// 			<MigrationProvider>
	// 				<Test />
	// 			</MigrationProvider>
	// 			,
	// 		</Route>,
	// 		{
	// 			route: `/profiles/${profile.id()}/migration`,
	// 		},
	// 	);

	// 	expect(screen.getByTestId("Migration__contract_loading")).toBeInTheDocument();

	// 	await waitFor(() => {
	// 		expect(screen.queryByTestId("Migration__contract_loading")).not.toBeInTheDocument();
	// 	});

	// 	expect(screen.queryByTestId("Migration__loading")).not.toBeInTheDocument();

	// 	expect(screen.getByTestId("Migrations")).toBeInTheDocument();
	// 	expect(screen.getAllByTestId("MigrationItem")).toHaveLength(1);

	// 	clearStoredMigrationsMock();
	// });

	// it("should load the migration when it has migrationId", async () => {
	// 	const { clearStoredMigrationsMock } = mockStoredMigrations([
	// 		{
	// 			...migrationPendingFixture,
	// 			migrationId: "0x123",
	// 		},
	// 	]);

	// 	let reloadMigrationsCallback;

	// 	const setIntervalSpy = vi.spyOn(window, "setInterval").mockImplementation((callback) => {
	// 		if (callback.name === "reloadMigrationsCallback") {
	// 			reloadMigrationsCallback = callback;
	// 		}

	// 		return 1;
	// 	});

	// 	render(
	// 		<Route path="/profiles/:profileId/migration">
	// 			<MigrationProvider>
	// 				<Test />
	// 			</MigrationProvider>
	// 			,
	// 		</Route>,
	// 		{
	// 			route: `/profiles/${profile.id()}/migration`,
	// 		},
	// 	);

	// 	expect(screen.getByTestId("Migration__contract_loading")).toBeInTheDocument();

	// 	await waitFor(() => {
	// 		expect(screen.queryByTestId("Migration__contract_loading")).not.toBeInTheDocument();
	// 	});

	// 	expect(screen.queryByTestId("Migration__loading")).not.toBeInTheDocument();

	// 	reloadMigrationsCallback();

	// 	expect(screen.getByTestId("Migrations")).toBeInTheDocument();
	// 	expect(screen.getAllByTestId("MigrationItem")).toHaveLength(1);

	// 	clearStoredMigrationsMock();
	// 	setIntervalSpy.mockRestore();
	// });

	// it("should handle load error", async () => {
	// 	const waitForSpy = vi.spyOn(waitForMock, "waitFor").mockImplementation(() => Promise.resolve());

	// 	const { clearStoredMigrationsMock, getMigrationsByArkTxHashMock } = mockStoredMigrations([
	// 		migrationPendingFixture,
	// 	]);

	// 	getMigrationsByArkTxHashMock.mockImplementation(() => {
	// 		throw new Error("error");
	// 	});

	// 	render(
	// 		<Route path="/profiles/:profileId/migration">
	// 			<MigrationProvider>
	// 				<Test />
	// 			</MigrationProvider>
	// 			,
	// 		</Route>,
	// 		{
	// 			route: `/profiles/${profile.id()}/migration`,
	// 		},
	// 	);

	// 	expect(screen.getByTestId("Migration__contract_loading")).toBeInTheDocument();

	// 	await waitFor(() => {
	// 		expect(screen.queryByTestId("Migration__contract_loading")).not.toBeInTheDocument();
	// 	});

	// 	await waitFor(() => {
	// 		expect(screen.getByTestId("Migration__load_error")).toBeInTheDocument();
	// 	});

	// 	clearStoredMigrationsMock();
	// 	waitForSpy.mockRestore();
	// });

	// it("should determine if a contract is paused", async () => {
	// 	const ethersMock = Contract.mockImplementation(() => ({
	// 		getMigrationsByArkTxHash: vi.fn(),
	// 		paused: () => true,
	// 	}));

	// 	render(
	// 		<MigrationProvider>
	// 			<Test />
	// 		</MigrationProvider>,
	// 	);

	// 	expect(screen.getByTestId("Migration__contract_loading")).toBeInTheDocument();

	// 	await waitFor(() => {
	// 		expect(screen.queryByTestId("Migration__contract_loading")).not.toBeInTheDocument();
	// 	});

	// 	expect(screen.getByTestId("Migration__contract_paused")).toBeInTheDocument();

	// 	ethersMock.mockRestore();
	// });

	// it("should determine if a contract is not paused", async () => {
	// 	const ethersMock = Contract.mockImplementation(() => ({
	// 		getMigrationsByArkTxHash: vi.fn(),
	// 		paused: () => false,
	// 	}));

	// 	render(
	// 		<MigrationProvider>
	// 			<Test />
	// 		</MigrationProvider>,
	// 	);

	// 	expect(screen.getByTestId("Migration__contract_loading")).toBeInTheDocument();

	// 	await waitFor(() => {
	// 		expect(screen.queryByTestId("Migration__contract_loading")).not.toBeInTheDocument();
	// 	});

	// 	expect(screen.getByTestId("Migration__contract_not_paused")).toBeInTheDocument();

	// 	ethersMock.mockRestore();
	// });

	// it("should handle exceptions on pause method", () => {
	// 	const ethersMock = Contract.mockImplementation(() => ({
	// 		getMigrationsByArkTxHash: vi.fn(),
	// 		paused: () => {
	// 			throw new Error("Error");
	// 		},
	// 	}));

	// 	render(
	// 		<Route path="/profiles/:profileId/migration">
	// 			<MigrationProvider>
	// 				<Test />
	// 			</MigrationProvider>
	// 			,
	// 		</Route>,
	// 		{
	// 			route: `/profiles/${profile.id()}/migration`,
	// 		},
	// 	);

	// 	expect(screen.getByTestId("Migration__contract_loading")).toBeInTheDocument();
	// 	expect(screen.queryByTestId("Migration__contract_not_paused")).not.toBeInTheDocument();
	// 	expect(screen.queryByTestId("Migration__contract_paused")).not.toBeInTheDocument();

	// 	ethersMock.mockRestore();
	// });

	// it("should not add a transaction that already exists twice", async () => {
	// 	profileWatcherMock = vi.spyOn(useProfileWatcher, "useProfileWatcher").mockReturnValue(profile);

	// 	const getMigrationsByArkTxHashMock = vi.fn().mockImplementation(() => [
	// 		{
	// 			amount: 123,
	// 			arkTxHash: `0xabc123`,
	// 			memo: "0xabc",
	// 		},
	// 	]);

	// 	const ethersMock = Contract.mockImplementation(() => ({
	// 		getMigrationsByArkTxHash: getMigrationsByArkTxHashMock,
	// 		paused: () => false,
	// 	}));

	// 	render(
	// 		<Route path="/profiles/:profileId/migration">
	// 			<MigrationProvider>
	// 				<Test />
	// 			</MigrationProvider>
	// 			,
	// 		</Route>,
	// 		{
	// 			route: `/profiles/${profile.id()}/migration`,
	// 		},
	// 	);

	// 	await waitFor(() => {
	// 		expect(screen.getByTestId("Migrations__store")).toBeInTheDocument();
	// 	});

	// 	expect(screen.queryByTestId("MigrationItem")).not.toBeInTheDocument();

	// 	userEvent.click(screen.getByTestId("Migrations__store"));

	// 	await waitFor(() => {
	// 		expect(screen.getAllByTestId("MigrationItem")).toHaveLength(1);
	// 	});

	// 	userEvent.click(screen.getByTestId("Migrations__store"));

	// 	await waitFor(() => {
	// 		expect(screen.getAllByTestId("MigrationItem")).toHaveLength(1);
	// 	});

	// 	ethersMock.mockRestore();
	// });

	// it("should mark migration as read", async () => {
	// 	const { clearStoredMigrationsMock, setMigrationMock } = mockStoredMigrations([
	// 		{
	// 			address: "AdDreSs",
	// 			amount: 111,
	// 			id: "abc123",
	// 			migrationAddress: "BuRnAdDreSs",
	// 			status: MigrationTransactionStatus.Confirmed,
	// 			timestamp: Date.now() / 1000,
	// 		},
	// 	]);

	// 	render(
	// 		<Route path="/profiles/:profileId/migration">
	// 			<MigrationProvider>
	// 				<Test />
	// 			</MigrationProvider>
	// 			,
	// 		</Route>,
	// 		{
	// 			route: `/profiles/${profile.id()}/migration`,
	// 		},
	// 	);

	// 	await waitFor(() => {
	// 		expect(screen.getByTestId("Migrations")).toBeInTheDocument();
	// 	});

	// 	expect(screen.getByTestId("Migrations__markasread")).toBeInTheDocument();

	// 	userEvent.click(screen.getByTestId("Migrations__markasread"));

	// 	expect(setMigrationMock).toHaveBeenCalledWith(expect.any(String), expect.any(Object));

	// 	clearStoredMigrationsMock();
	// });

	// it("should not reload the migrations if no pending migrations", async () => {
	// 	const { clearStoredMigrationsMock, getMigrationsByArkTxHashMock } = mockStoredMigrations([
	// 		migrationFixture,
	// 		{
	// 			address: "AdDreSs2",
	// 			amount: 222,
	// 			id: "456",
	// 			migrationAddress: "BuRnAdDreSs",
	// 			migrationId: "abc123",
	// 			status: MigrationTransactionStatus.Confirmed,
	// 			timestamp: Date.now() / 1000,
	// 		},
	// 	]);

	// 	let reloadMigrationsCallback;

	// 	const setIntervalSpy = vi.spyOn(window, "setInterval").mockImplementation((callback) => {
	// 		if (callback.name === "reloadMigrationsCallback") {
	// 			reloadMigrationsCallback = callback;
	// 		}

	// 		return 1;
	// 	});

	// 	render(
	// 		<Route path="/profiles/:profileId/migration">
	// 			<MigrationProvider>
	// 				<Test />
	// 			</MigrationProvider>
	// 			,
	// 		</Route>,
	// 		{
	// 			route: `/profiles/${profile.id()}/migration`,
	// 		},
	// 	);

	// 	await waitFor(() => {
	// 		expect(screen.getByTestId("Migrations")).toBeInTheDocument();
	// 	});

	// 	expect(screen.getAllByTestId("MigrationItem")).toHaveLength(2);

	// 	reloadMigrationsCallback();

	// 	// Contract method should have been called only when loaded
	// 	expect(getMigrationsByArkTxHashMock).toHaveBeenCalledTimes(1);

	// 	setIntervalSpy.mockRestore();

	// 	clearStoredMigrationsMock();
	// });

	// it("should not load the migrations if contractAddress is not defined", () => {
	// 	polygonContractAddressSpy = vi.spyOn(polygonMigration, "polygonContractAddress").mockReturnValue(undefined);

	// 	const { clearStoredMigrationsMock, getMigrationsByArkTxHashMock } = mockStoredMigrations([]);

	// 	render(
	// 		<MigrationProvider>
	// 			<Test />
	// 		</MigrationProvider>,
	// 	);

	// 	expect(getMigrationsByArkTxHashMock).toHaveBeenCalledTimes(0);

	// 	clearStoredMigrationsMock();

	// 	polygonContractAddressSpy.mockRestore();
	// });

	// it("should reload the migrations if at least one migration is pending", async () => {
	// 	const { clearStoredMigrationsMock, getMigrationsByArkTxHashMock } = mockStoredMigrations([
	// 		migrationFixture,
	// 		{
	// 			address: "AdDreSs2",
	// 			amount: 222,
	// 			id: "456",
	// 			migrationAddress: "BuRnAdDreSs",
	// 			status: MigrationTransactionStatus.Pending,
	// 			timestamp: Date.now() / 1000,
	// 		},
	// 	]);

	// 	let reloadMigrationsCallback;

	// 	const setIntervalSpy = vi.spyOn(window, "setInterval").mockImplementation((callback) => {
	// 		if (callback.name === "reloadMigrationsCallback") {
	// 			reloadMigrationsCallback = callback;
	// 		}

	// 		return 1;
	// 	});

	// 	render(
	// 		<Route path="/profiles/:profileId/migration">
	// 			<MigrationProvider>
	// 				<Test />
	// 			</MigrationProvider>
	// 			,
	// 		</Route>,
	// 		{
	// 			route: `/profiles/${profile.id()}/migration`,
	// 		},
	// 	);

	// 	await waitFor(() => {
	// 		expect(screen.getByTestId("Migrations")).toBeInTheDocument();
	// 	});

	// 	expect(screen.getAllByTestId("MigrationItem")).toHaveLength(2);

	// 	reloadMigrationsCallback();

	// 	// Contract method should have been twice, once when page loaded
	// 	// and once when interval was called
	// 	expect(getMigrationsByArkTxHashMock).toHaveBeenCalledTimes(2);

	// 	setIntervalSpy.mockRestore();

	// 	clearStoredMigrationsMock();
	// });

	it("should throw without provider", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const Test = () => {
			useMigrations();
			return <p>Content</p>;
		};

		expect(() => render(<Test />, { withProviders: false })).toThrow(
			"[useMigrations] Component not wrapped within a Provider",
		);

		consoleSpy.mockRestore();
	});

	// it("should not load migrations if profile is undefined", () => {
	// 	profileWatcherMock = vi.spyOn(useProfileWatcher, "useProfileWatcher").mockReturnValue(undefined);

	// 	const { clearStoredMigrationsMock, getMigrationsByArkTxHashMock } = mockStoredMigrations([]);

	// 	render(
	// 		<MigrationProvider>
	// 			<Test />
	// 		</MigrationProvider>,
	// 	);

	// 	expect(screen.getByTestId("Migration__contract_loading")).toBeInTheDocument();

	// 	expect(getMigrationsByArkTxHashMock).not.toHaveBeenCalled();

	// 	clearStoredMigrationsMock();
	// });

	// it("should reload paused state", async () => {
	// 	const { clearStoredMigrationsMock, getPausedMock } = mockStoredMigrations([migrationFixture]);

	// 	let reloadPausedStateCallback;

	// 	const setIntervalSpy = vi.spyOn(window, "setInterval").mockImplementation((callback) => {
	// 		if (callback.name === "reloadPausedStateCallback") {
	// 			reloadPausedStateCallback = callback;
	// 		}

	// 		return 1;
	// 	});

	// 	render(
	// 		<Route path="/profiles/:profileId/migration">
	// 			<MigrationProvider>
	// 				<Test />
	// 			</MigrationProvider>
	// 			,
	// 		</Route>,
	// 		{
	// 			route: `/profiles/${profile.id()}/migration`,
	// 		},
	// 	);

	// 	await waitFor(() => {
	// 		expect(screen.getByTestId("Migrations")).toBeInTheDocument();
	// 	});

	// 	reloadPausedStateCallback();

	// 	// Contract method should have been twice, once when page loaded
	// 	// and once when interval was called
	// 	expect(getPausedMock).toHaveBeenCalledTimes(2);

	// 	setIntervalSpy.mockRestore();

	// 	clearStoredMigrationsMock();
	// });

	// it.each([MigrationTransactionStatus.Pending, MigrationTransactionStatus.Confirmed])(
	// 	"should determine transaction status",
	// 	async (status) => {
	// 		const { clearStoredMigrationsMock } = mockStoredMigrations([migrationFixture, migrationPendingFixture]);

	// 		const Test = () => {
	// 			const [transactionStatus, setTransactionStatus] = useState<any>();
	// 			const { getTransactionStatus } = useMigrations();

	// 			const loadTransactionStatus = async () => {
	// 				const transactionStatus = await getTransactionStatus({
	// 					id: () =>
	// 						status === MigrationTransactionStatus.Pending
	// 							? migrationPendingFixture.id
	// 							: migrationFixture.id,
	// 				} as any);

	// 				setTransactionStatus(transactionStatus);
	// 			};

	// 			if (transactionStatus !== undefined) {
	// 				return <div data-testid="Status">{transactionStatus}</div>;
	// 			}

	// 			return (
	// 				<button data-testid="LoadStatus" type="button" onClick={loadTransactionStatus}>
	// 					Load Status
	// 				</button>
	// 			);
	// 		};

	// 		render(
	// 			<MigrationProvider>
	// 				<Test />
	// 			</MigrationProvider>,
	// 		);

	// 		expect(screen.getByTestId("LoadStatus")).toBeInTheDocument();

	// 		userEvent.click(screen.getByTestId("LoadStatus"));

	// 		await waitFor(() => {
	// 			expect(screen.getByTestId("Status")).toBeInTheDocument();
	// 		});

	// 		expect(screen.getByTestId("Status")).toHaveTextContent(status);

	// 		clearStoredMigrationsMock();
	// 	},
	// );
});
