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
});
