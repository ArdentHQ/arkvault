import React, { useState } from "react";
import { DTO, Contracts } from "@ardenthq/sdk-profiles";
import { Contract, ethers } from "ethers";
import userEvent from "@testing-library/user-event";
import { DateTime } from "@ardenthq/sdk-intl";
import { vi } from "vitest";
import { Route } from "react-router-dom";
import { MigrationProvider, useMigrations } from "./Migration";
import * as useProfileWatcher from "@/app/hooks/use-profile-watcher";
import { render, screen, waitFor, getDefaultProfileId, env } from "@/utils/testing-library";
import * as contexts from "@/app/contexts";
import * as polygonMigration from "@/utils/polygon-migration";
import { MigrationTransactionStatus, Migration } from "@/domains/migration/migration.contracts";
import { httpClient } from "@/app/services";
import { server, requestMock } from "@/tests/mocks/server";
import * as waitForMock from "@/utils/wait-for";
const Test = () => {
	const {
		migrationsLoaded,
		migrations,
		storeTransactions,
		removeTransactions,
		contractIsPaused,
		markMigrationsAsRead,
		loadMigrationsError,
	} = useMigrations();

	const createAndStoreTransaction = async () => {
		const transaction = {
			amount: () => 123,
			id: () => "abc123",
			memo: () => "0x123",
			sender: () => "AdDreSs",
			timestamp: () => DateTime.make(),
		} as DTO.ExtendedSignedTransactionData;

		await storeTransactions([transaction]);
	};

	const removeTransaction = () => {
		if (migrations) {
			removeTransactions(migrations[0].address);
		}
	};

	const markMigrationAsReadHandler = () => {
		markMigrationsAsRead([migrations[0]]);
	};

	if (contractIsPaused === undefined) {
		return <span data-testid="Migration__contract_loading">Contract Loading...</span>;
	}

	if (loadMigrationsError) {
		return <span data-testid="Migration__load_error">Load error</span>;
	}

	return (
		<div>
			{migrationsLoaded ? (
				<ul data-testid="Migrations">
					{migrations.map((migration) => (
						<li data-testid="MigrationItem" key={migration.id}>
							{migration.address}

							{migration.readAt !== undefined}
						</li>
					))}
				</ul>
			) : (
				<span data-testid="Migration__loading">Loading...</span>
			)}

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
					<button data-testid="Migrations__remove" type="button" onClick={removeTransaction}>
						Remove
					</button>
				</li>

				<li>
					<button data-testid="Migrations__markasread" type="button" onClick={markMigrationAsReadHandler}>
						Mark as read
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
	let configurationMock;
	let profileWatcherMock;
	let ethersLibraryContractSpy;
	let polygonContractAddressSpy;
	let polygonIndexerUrlSpy;
	let migrationFixture;
	let migrationPendingFixture;

	const environmentMockData = {
		env: {
			data: () => ({
				get: () => ({}),
				set: () => {},
			}),
		},
		persist: vi.fn(),
	};

	const mockStoredMigrations = (migrations: Migration[]) => {
		const profileMigrations = {
			[profile.id()]: migrations,
		};

		const getMigrationsMock = vi.fn().mockReturnValue(profileMigrations);
		const setMigrationMock = vi.fn().mockImplementation(() => {});

		const environmentMock = vi.spyOn(contexts, "useEnvironmentContext").mockReturnValue({
			...environmentMockData,
			env: {
				data: () => ({
					get: getMigrationsMock,
					set: setMigrationMock,
				}),
			},
		});

		const getMigrationsByArkTxHashMock = vi.fn().mockImplementation(() =>
			migrations.map((migration) => ({
				amount: migration.amount,
				arkTxHash: `0x${migration.id}`,
				migrationId: migration.migrationId,
				recipient:
					migration.status === MigrationTransactionStatus.Pending
						? ethers.constants.AddressZero
						: "0xWhatevs",
			})),
		);
		const getPausedMock = vi.fn().mockImplementation(() => false);

		const ethersMock = Contract.mockImplementation(() => ({
			getMigrationsByArkTxHash: getMigrationsByArkTxHashMock,
			paused: getPausedMock,
		}));

		const clearStoredMigrationsMock = () => {
			environmentMock.mockRestore();
			ethersMock.mockRestore();
		};

		return {
			clearStoredMigrationsMock,
			getMigrationsByArkTxHashMock,
			getMigrationsMock,
			getPausedMock,
			setMigrationMock,
		};
	};

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());

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
		configurationMock = vi.spyOn(contexts, "useConfiguration").mockReturnValue({
			profileHasSyncedOnce: true,
		});

		profileWatcherMock = vi.spyOn(useProfileWatcher, "useProfileWatcher").mockReturnValue(profile);

		polygonContractAddressSpy = vi
			.spyOn(polygonMigration, "polygonContractAddress")
			.mockReturnValue("0x4a12a2ADc21F896E6F8e564a106A4cab8746a92f");

		polygonIndexerUrlSpy = vi
			.spyOn(polygonMigration, "polygonIndexerUrl")
			.mockReturnValue("https://mumbai.somehost.com/");

		ethersLibraryContractSpy = Contract.mockImplementation(() => ({
			getMigrationsByArkTxHash: () => [],
			paused: () => false,
		}));

		httpClient.clearCache();

		migrationFixture = {
			address: "AdDreSs",
			amount: 123,
			id: "ad68f6c81b7fe5146fe9dd71424740f96909feab7a12a19fe368b7ef4d828445",
			migrationAddress: "BuRnAdDreSs",
			status: MigrationTransactionStatus.Confirmed,
			timestamp: Date.now() / 1000,
		};

		migrationPendingFixture = {
			address: "AdDreSs2",
			amount: 456,
			id: "bc68f6c81b7fe5146fe9dd71424740f96909feab7a12a19fe368b7ef4d828445",
			migrationAddress: "BuRnAdDreSs",
			status: MigrationTransactionStatus.Pending,
			timestamp: Date.now() / 1000,
		};

		server.use(
			requestMock("https://mumbai.somehost.com/transactions", [
				{
					arkTxHash: migrationFixture.id,
					polygonTxHash: "0x33a45223a017970c476e2fd86da242e57c941ba825b6817efa2b1c105378f236",
				},
				{
					arkTxHash: migrationPendingFixture.id,
					polygonTxHash: "0x66a45223a017970c476e2fd86da242e57c941ba825b6817efa2b1c105378f211",
				},
			]),
		);
	});

	afterEach(() => {
		configurationMock.mockRestore();
		profileWatcherMock.mockRestore();
		ethersLibraryContractSpy.mockRestore();
		polygonContractAddressSpy.mockRestore();
		polygonIndexerUrlSpy.mockRestore();
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
		const { clearStoredMigrationsMock } = mockStoredMigrations([]);

		render(
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
		);

		expect(screen.getByTestId("Migration__contract_loading")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.queryByTestId("Migration__contract_loading")).not.toBeInTheDocument();
		});

		expect(screen.queryByTestId("Migration__loading")).not.toBeInTheDocument();

		clearStoredMigrationsMock();
	});

	it("should load contract state", async () => {
		render(
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
		);

		expect(screen.getByTestId("Migration__contract_loading")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.queryByTestId("Migration__contract_loading")).not.toBeInTheDocument();
		});
	});

	it("should list the migrations", async () => {
		const { clearStoredMigrationsMock } = mockStoredMigrations([migrationFixture]);

		render(
			<Route path="/profiles/:profileId/migration">
				<MigrationProvider>
					<Test />
				</MigrationProvider>
				,
			</Route>,
			{
				route: `/profiles/${profile.id()}/migration`,
			},
		);

		expect(screen.getByTestId("Migration__contract_loading")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.queryByTestId("Migration__contract_loading")).not.toBeInTheDocument();
		});

		expect(screen.queryByTestId("Migration__loading")).not.toBeInTheDocument();

		expect(screen.getByTestId("Migrations")).toBeInTheDocument();
		expect(screen.getAllByTestId("MigrationItem")).toHaveLength(1);

		clearStoredMigrationsMock();
	});

	it("should load the migration id for newly confirmed migrations", async () => {
		const { clearStoredMigrationsMock, getMigrationsByArkTxHashMock } = mockStoredMigrations([
			migrationPendingFixture,
		]);

		getMigrationsByArkTxHashMock.mockImplementation(() => [
			{
				amount: migrationPendingFixture.amount,
				arkTxHash: `0x${migrationPendingFixture.id}`,
				// A recipient means confirmed
				recipient: "0xWhatevs",
			},
		]);

		render(
			<Route path="/profiles/:profileId/migration">
				<MigrationProvider>
					<Test />
				</MigrationProvider>
				,
			</Route>,
			{
				route: `/profiles/${profile.id()}/migration`,
			},
		);

		expect(screen.getByTestId("Migration__contract_loading")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.queryByTestId("Migration__contract_loading")).not.toBeInTheDocument();
		});

		expect(screen.queryByTestId("Migration__loading")).not.toBeInTheDocument();

		expect(screen.getByTestId("Migrations")).toBeInTheDocument();
		expect(screen.getAllByTestId("MigrationItem")).toHaveLength(1);

		clearStoredMigrationsMock();
	});

	it("should load the migration when it has migrationId", async () => {
		const { clearStoredMigrationsMock } = mockStoredMigrations([
			{
				...migrationPendingFixture,
				migrationId: "0x123",
			},
		]);

		let reloadMigrationsCallback;

		const setIntervalSpy = vi.spyOn(window, "setInterval").mockImplementation((callback) => {
			if (callback.name === "reloadMigrationsCallback") {
				reloadMigrationsCallback = callback;
			}

			return 1;
		});

		render(
			<Route path="/profiles/:profileId/migration">
				<MigrationProvider>
					<Test />
				</MigrationProvider>
				,
			</Route>,
			{
				route: `/profiles/${profile.id()}/migration`,
			},
		);

		expect(screen.getByTestId("Migration__contract_loading")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.queryByTestId("Migration__contract_loading")).not.toBeInTheDocument();
		});

		expect(screen.queryByTestId("Migration__loading")).not.toBeInTheDocument();

		reloadMigrationsCallback();

		expect(screen.getByTestId("Migrations")).toBeInTheDocument();
		expect(screen.getAllByTestId("MigrationItem")).toHaveLength(1);

		clearStoredMigrationsMock();
		setIntervalSpy.mockRestore();
	});

	it("should handle load error", async () => {
		const waitForSpy = vi.spyOn(waitForMock, "waitFor").mockImplementation(() => Promise.resolve());

		const { clearStoredMigrationsMock, getMigrationsByArkTxHashMock } = mockStoredMigrations([
			migrationPendingFixture,
		]);

		getMigrationsByArkTxHashMock.mockImplementation(() => {
			throw new Error("error");
		});

		render(
			<Route path="/profiles/:profileId/migration">
				<MigrationProvider>
					<Test />
				</MigrationProvider>
				,
			</Route>,
			{
				route: `/profiles/${profile.id()}/migration`,
			},
		);

		expect(screen.getByTestId("Migration__contract_loading")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.queryByTestId("Migration__contract_loading")).not.toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByTestId("Migration__load_error")).toBeInTheDocument();
		});

		clearStoredMigrationsMock();
		waitForSpy.mockRestore();
	});

	it("should determine if a contract is paused", async () => {
		const ethersMock = Contract.mockImplementation(() => ({
			getMigrationsByArkTxHash: vi.fn(),
			paused: () => true,
		}));

		render(
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
		);

		expect(screen.getByTestId("Migration__contract_loading")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.queryByTestId("Migration__contract_loading")).not.toBeInTheDocument();
		});

		expect(screen.getByTestId("Migration__contract_paused")).toBeInTheDocument();

		ethersMock.mockRestore();
	});

	it("should determine if a contract is not paused", async () => {
		const ethersMock = Contract.mockImplementation(() => ({
			getMigrationsByArkTxHash: vi.fn(),
			paused: () => false,
		}));

		render(
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
		);

		expect(screen.getByTestId("Migration__contract_loading")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.queryByTestId("Migration__contract_loading")).not.toBeInTheDocument();
		});

		expect(screen.getByTestId("Migration__contract_not_paused")).toBeInTheDocument();

		ethersMock.mockRestore();
	});

	it("should handle exceptions on pause method", () => {
		const ethersMock = Contract.mockImplementation(() => ({
			getMigrationsByArkTxHash: vi.fn(),
			paused: () => {
				throw new Error("Error");
			},
		}));

		render(
			<Route path="/profiles/:profileId/migration">
				<MigrationProvider>
					<Test />
				</MigrationProvider>
				,
			</Route>,
			{
				route: `/profiles/${profile.id()}/migration`,
			},
		);

		expect(screen.getByTestId("Migration__contract_loading")).toBeInTheDocument();
		expect(screen.queryByTestId("Migration__contract_not_paused")).not.toBeInTheDocument();
		expect(screen.queryByTestId("Migration__contract_paused")).not.toBeInTheDocument();

		ethersMock.mockRestore();
	});

	it("should add and remove a transaction", async () => {
		profileWatcherMock = vi.spyOn(useProfileWatcher, "useProfileWatcher").mockReturnValue(profile);

		const getMigrationsByArkTxHashMock = vi.fn().mockImplementation(() => [
			{
				amount: 123,
				arkTxHash: `0xabc123`,
				memo: "0xabc",
			},
		]);

		const ethersMock = Contract.mockImplementation(() => ({
			getMigrationsByArkTxHash: getMigrationsByArkTxHashMock,
			paused: () => false,
		}));

		render(
			<Route path="/profiles/:profileId/migration">
				<MigrationProvider>
					<Test />
				</MigrationProvider>
				,
			</Route>,
			{
				route: `/profiles/${profile.id()}/migration`,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("Migrations__store")).toBeInTheDocument();
		});

		expect(screen.queryByTestId("MigrationItem")).not.toBeInTheDocument();

		userEvent.click(screen.getByTestId("Migrations__store"));

		await waitFor(() => {
			expect(screen.getAllByTestId("MigrationItem")).toHaveLength(1);
		});

		userEvent.click(screen.getByTestId("Migrations__remove"));

		await waitFor(() => {
			expect(screen.queryByTestId("MigrationItem")).not.toBeInTheDocument();
		});

		ethersMock.mockRestore();
	});

	it("should not add a transaction that already exists twice", async () => {
		profileWatcherMock = vi.spyOn(useProfileWatcher, "useProfileWatcher").mockReturnValue(profile);

		const getMigrationsByArkTxHashMock = vi.fn().mockImplementation(() => [
			{
				amount: 123,
				arkTxHash: `0xabc123`,
				memo: "0xabc",
			},
		]);

		const ethersMock = Contract.mockImplementation(() => ({
			getMigrationsByArkTxHash: getMigrationsByArkTxHashMock,
			paused: () => false,
		}));

		render(
			<Route path="/profiles/:profileId/migration">
				<MigrationProvider>
					<Test />
				</MigrationProvider>
				,
			</Route>,
			{
				route: `/profiles/${profile.id()}/migration`,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("Migrations__store")).toBeInTheDocument();
		});

		expect(screen.queryByTestId("MigrationItem")).not.toBeInTheDocument();

		userEvent.click(screen.getByTestId("Migrations__store"));

		await waitFor(() => {
			expect(screen.getAllByTestId("MigrationItem")).toHaveLength(1);
		});

		userEvent.click(screen.getByTestId("Migrations__store"));

		await waitFor(() => {
			expect(screen.getAllByTestId("MigrationItem")).toHaveLength(1);
		});

		ethersMock.mockRestore();
	});

	it("should mark migration as read", async () => {
		const { clearStoredMigrationsMock, setMigrationMock } = mockStoredMigrations([
			{
				address: "AdDreSs",
				amount: 111,
				id: "abc123",
				migrationAddress: "BuRnAdDreSs",
				status: MigrationTransactionStatus.Confirmed,
				timestamp: Date.now() / 1000,
			},
		]);

		render(
			<Route path="/profiles/:profileId/migration">
				<MigrationProvider>
					<Test />
				</MigrationProvider>
				,
			</Route>,
			{
				route: `/profiles/${profile.id()}/migration`,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("Migrations")).toBeInTheDocument();
		});

		expect(screen.getByTestId("Migrations__markasread")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("Migrations__markasread"));

		expect(setMigrationMock).toHaveBeenCalledWith(expect.any(String), expect.any(Object));

		clearStoredMigrationsMock();
	});

	it("should not reload the migrations if no pending migrations", async () => {
		const { clearStoredMigrationsMock, getMigrationsByArkTxHashMock } = mockStoredMigrations([
			migrationFixture,
			{
				address: "AdDreSs2",
				amount: 222,
				id: "456",
				migrationAddress: "BuRnAdDreSs",
				status: MigrationTransactionStatus.Confirmed,
				timestamp: Date.now() / 1000,
			},
		]);

		let reloadMigrationsCallback;

		const setIntervalSpy = vi.spyOn(window, "setInterval").mockImplementation((callback) => {
			if (callback.name === "reloadMigrationsCallback") {
				reloadMigrationsCallback = callback;
			}

			return 1;
		});

		render(
			<Route path="/profiles/:profileId/migration">
				<MigrationProvider>
					<Test />
				</MigrationProvider>
				,
			</Route>,
			{
				route: `/profiles/${profile.id()}/migration`,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("Migrations")).toBeInTheDocument();
		});

		expect(screen.getAllByTestId("MigrationItem")).toHaveLength(2);

		reloadMigrationsCallback();

		// Contract method should have been called only when loaded
		expect(getMigrationsByArkTxHashMock).toHaveBeenCalledTimes(1);

		setIntervalSpy.mockRestore();

		clearStoredMigrationsMock();
	});

	it("should not load the migrations if contractAddress is not defined", () => {
		polygonContractAddressSpy = vi.spyOn(polygonMigration, "polygonContractAddress").mockReturnValue(undefined);

		const { clearStoredMigrationsMock, getMigrationsByArkTxHashMock } = mockStoredMigrations([]);

		render(
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
		);

		expect(getMigrationsByArkTxHashMock).toHaveBeenCalledTimes(0);

		clearStoredMigrationsMock();

		polygonContractAddressSpy.mockRestore();
	});

	it("should reload the migrations if at least one migration is pending", async () => {
		const { clearStoredMigrationsMock, getMigrationsByArkTxHashMock } = mockStoredMigrations([
			migrationFixture,
			{
				address: "AdDreSs2",
				amount: 222,
				id: "456",
				migrationAddress: "BuRnAdDreSs",
				status: MigrationTransactionStatus.Pending,
				timestamp: Date.now() / 1000,
			},
		]);

		let reloadMigrationsCallback;

		const setIntervalSpy = vi.spyOn(window, "setInterval").mockImplementation((callback) => {
			if (callback.name === "reloadMigrationsCallback") {
				reloadMigrationsCallback = callback;
			}

			return 1;
		});

		render(
			<Route path="/profiles/:profileId/migration">
				<MigrationProvider>
					<Test />
				</MigrationProvider>
				,
			</Route>,
			{
				route: `/profiles/${profile.id()}/migration`,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("Migrations")).toBeInTheDocument();
		});

		expect(screen.getAllByTestId("MigrationItem")).toHaveLength(2);

		reloadMigrationsCallback();

		// Contract method should have been twice, once when page loaded
		// and once when interval was called
		expect(getMigrationsByArkTxHashMock).toHaveBeenCalledTimes(2);

		setIntervalSpy.mockRestore();

		clearStoredMigrationsMock();
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

	it("should not load migrations if profile is undefined", () => {
		profileWatcherMock = vi.spyOn(useProfileWatcher, "useProfileWatcher").mockReturnValue(undefined);

		const { clearStoredMigrationsMock, getMigrationsByArkTxHashMock } = mockStoredMigrations([]);

		render(
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
		);

		expect(screen.getByTestId("Migration__contract_loading")).toBeInTheDocument();

		expect(getMigrationsByArkTxHashMock).not.toHaveBeenCalled();

		clearStoredMigrationsMock();
	});

	it("should reload paused state", async () => {
		const { clearStoredMigrationsMock, getPausedMock } = mockStoredMigrations([migrationFixture]);

		let reloadPausedStateCallback;

		const setIntervalSpy = vi.spyOn(window, "setInterval").mockImplementation((callback) => {
			if (callback.name === "reloadPausedStateCallback") {
				reloadPausedStateCallback = callback;
			}

			return 1;
		});

		render(
			<Route path="/profiles/:profileId/migration">
				<MigrationProvider>
					<Test />
				</MigrationProvider>
				,
			</Route>,
			{
				route: `/profiles/${profile.id()}/migration`,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("Migrations")).toBeInTheDocument();
		});

		reloadPausedStateCallback();

		// Contract method should have been twice, once when page loaded
		// and once when interval was called
		expect(getPausedMock).toHaveBeenCalledTimes(2);

		setIntervalSpy.mockRestore();

		clearStoredMigrationsMock();
	});

	it.each([MigrationTransactionStatus.Pending, MigrationTransactionStatus.Confirmed])(
		"should determine transaction status",
		async (status) => {
			const { clearStoredMigrationsMock } = mockStoredMigrations([migrationFixture, migrationPendingFixture]);

			const Test = () => {
				const [transactionStatus, setTransactionStatus] = useState<any>();
				const { getTransactionStatus } = useMigrations();

				const loadTransactionStatus = async () => {
					const transactionStatus = await getTransactionStatus({
						id: () =>
							status === MigrationTransactionStatus.Pending
								? migrationPendingFixture.id
								: migrationFixture.id,
					} as any);

					setTransactionStatus(transactionStatus);
				};

				if (transactionStatus !== undefined) {
					return <div data-testid="Status">{transactionStatus}</div>;
				}

				return (
					<button data-testid="LoadStatus" type="button" onClick={loadTransactionStatus}>
						Load Status
					</button>
				);
			};

			render(
				<MigrationProvider>
					<Test />
				</MigrationProvider>,
			);

			expect(screen.getByTestId("LoadStatus")).toBeInTheDocument();

			userEvent.click(screen.getByTestId("LoadStatus"));

			await waitFor(() => {
				expect(screen.getByTestId("Status")).toBeInTheDocument();
			});

			expect(screen.getByTestId("Status")).toHaveTextContent(status);

			clearStoredMigrationsMock();
		},
	);
});
