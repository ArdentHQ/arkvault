import React from "react";
import { DTO, Contracts } from "@ardenthq/sdk-profiles";
import { Contract, ethers } from "ethers";
import userEvent from "@testing-library/user-event";
import { DateTime } from "@ardenthq/sdk-intl";
import { MigrationProvider, useMigrations } from "./Migration";
import * as useProfileWatcher from "@/app/hooks/use-profile-watcher";
import { render, screen, waitFor, getDefaultProfileId, env } from "@/utils/testing-library";
import * as contexts from "@/app/contexts";
import * as polygonMigration from "@/utils/polygon-migration";
import { MigrationTransactionStatus, Migration } from "@/domains/migration/migration.contracts";

const Test = () => {
	const { migrations, storeTransaction, removeTransactions, contractIsPaused } = useMigrations();

	const createAndStoreTransaction = () => {
		const transaction = {
			amount: () => 123,
			id: () => "abc123",
			memo: () => "0x123",
			sender: () => "AdDreSs",
			timestamp: () => DateTime.make(),
		} as DTO.ExtendedSignedTransactionData;

		storeTransaction(transaction);
	};

	const removeTransaction = () => {
		if (migrations) {
			removeTransactions(migrations[0].address);
		}
	};

	if (migrations === undefined || contractIsPaused === undefined) {
		return (
			<>
				{contractIsPaused === undefined && (
					<span data-testid="Migration__contract_loading">Contract Loading...</span>
				)}
				{migrations === undefined && <span data-testid="Migration__loading">Loading...</span>}
			</>
		);
	}

	return (
		<div>
			<ul data-testid="Migrations">
				{migrations.map((migration) => (
					<li data-testid="MigrationItem" key={migration.id}>
						{migration.address}
					</li>
				))}

				<li>
					<button data-testid="Migrations__store" type="button" onClick={createAndStoreTransaction}>
						Add
					</button>
				</li>

				<li>
					<button data-testid="Migrations__remove" type="button" onClick={removeTransaction}>
						Remove
					</button>
				</li>

				{contractIsPaused ? (
					<span data-testid="Migration__contract_paused">Contract paused</span>
				) : (
					<span data-testid="Migration__contract_not_paused">Contract not paused</span>
				)}
			</ul>
		</div>
	);
};

let profile: Contracts.IProfile;

describe("Migration Context", () => {
	let configurationMock;
	let profileWatcherMock;
	let ethersLibraryContractSpy;
	let polygonMigrationSpy;

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

		const environmentMock = vi.spyOn(contexts, "useEnvironmentContext").mockReturnValue({
			...environmentMockData,
			env: {
				data: () => ({
					get: getMigrationsMock,
					set: () => {},
				}),
			},
		});

		const getMigrationsByArkTxHashMock = vi.fn().mockImplementation(() =>
			migrations.map((migration) => ({
				amount: migration.amount,
				arkTxHash: `0x${migration.id}`,
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
			useMigrations: () => ({ migrations: undefined }),
		}));
	});

	beforeEach(() => {
		configurationMock = vi.spyOn(contexts, "useConfiguration").mockReturnValue({
			profileHasSyncedOnce: true,
		});

		profileWatcherMock = vi.spyOn(useProfileWatcher, "useProfileWatcher").mockReturnValue(profile);

		polygonMigrationSpy = vi
			.spyOn(polygonMigration, "polygonContractAddress")
			.mockReturnValue("0x4a12a2ADc21F896E6F8e564a106A4cab8746a92f");

		ethersLibraryContractSpy = Contract.mockImplementation(() => ({
			getMigrationsByArkTxHash: () => [],
			paused: () => false,
		}));
	});

	afterEach(() => {
		configurationMock.mockRestore();
		profileWatcherMock.mockRestore();
		ethersLibraryContractSpy.mockRestore();
		polygonMigrationSpy.mockRestore();
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
		render(
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("Migration__loading")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByTestId("Migration__loading")).not.toBeInTheDocument();
		});
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
		const { clearStoredMigrationsMock } = mockStoredMigrations([
			{
				address: "AdDreSs",
				amount: 123,
				id: "123",
				migrationAddress: "BuRnAdDreSs",
				status: MigrationTransactionStatus.Confirmed,
				timestamp: Date.now() / 1000,
			},
		]);

		render(
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("Migrations")).toBeInTheDocument();
		});

		expect(screen.getAllByTestId("MigrationItem")).toHaveLength(1);

		clearStoredMigrationsMock();
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
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
		);

		expect(screen.getByTestId("Migration__contract_loading")).toBeInTheDocument();
		expect(screen.queryByTestId("Migration__contract_not_paused")).not.toBeInTheDocument();
		expect(screen.queryByTestId("Migration__contract_paused")).not.toBeInTheDocument();

		ethersMock.mockRestore();
	});

	it("should add and remove a transaction", async () => {
		profileWatcherMock = vi.spyOn(useProfileWatcher, "useProfileWatcher").mockReturnValue(profile);

		const getMigrationsByArkTxHashMock = vi.fn().mockImplementation(() => ({
			amount: 123,
			arkTxHash: `0xabc123`,
			memo: "0xabc",
		}));

		const ethersMock = Contract.mockImplementation(() => ({
			getMigrationsByArkTxHash: getMigrationsByArkTxHashMock,
			paused: () => false,
		}));

		render(
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("Migrations")).toBeInTheDocument();
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

	it("should not reload the migrations if no pending migrations", async () => {
		const { clearStoredMigrationsMock, getMigrationsByArkTxHashMock } = mockStoredMigrations([
			{
				address: "AdDreSs",
				amount: 111,
				id: "123",
				migrationAddress: "BuRnAdDreSs",
				status: MigrationTransactionStatus.Confirmed,
				timestamp: Date.now() / 1000,
			},
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
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
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
		polygonMigrationSpy = vi.spyOn(polygonMigration, "polygonContractAddress").mockReturnValue(undefined);

		const { clearStoredMigrationsMock, getMigrationsByArkTxHashMock } = mockStoredMigrations([]);

		render(
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
		);

		expect(getMigrationsByArkTxHashMock).toHaveBeenCalledTimes(0);

		clearStoredMigrationsMock();

		polygonMigrationSpy.mockRestore();
	});

	it("should reload the migrations if at least one migration is pending", async () => {
		const { clearStoredMigrationsMock, getMigrationsByArkTxHashMock } = mockStoredMigrations([
			{
				address: "AdDreSs",
				amount: 111,
				id: "123",
				migrationAddress: "BuRnAdDreSs",
				status: MigrationTransactionStatus.Confirmed,
				timestamp: Date.now() / 1000,
			},
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
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
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

	it("should not load migrations if profile is undefined", async () => {
		profileWatcherMock = vi.spyOn(useProfileWatcher, "useProfileWatcher").mockReturnValue(undefined);

		const { clearStoredMigrationsMock, getMigrationsByArkTxHashMock } = mockStoredMigrations([]);

		render(
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("Migration__loading")).toBeInTheDocument();
		});

		expect(getMigrationsByArkTxHashMock).not.toHaveBeenCalled();

		clearStoredMigrationsMock();
	});

	it("should reload paused state", async () => {
		const { clearStoredMigrationsMock, getPausedMock } = mockStoredMigrations([]);

		let reloadPausedStateCallback;

		const setIntervalSpy = vi.spyOn(window, "setInterval").mockImplementation((callback) => {
			if (callback.name === "reloadPausedStateCallback") {
				reloadPausedStateCallback = callback;
			}

			return 1;
		});

		render(
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
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
});
