import React from "react";
import { DTO, Contracts } from "@ardenthq/sdk-profiles";
import { Contract, ethers } from "ethers";
import userEvent from "@testing-library/user-event";
import { MigrationProvider, useMigrations } from "./Migration";
import * as useProfileWatcher from "@/app/hooks/use-profile-watcher";
import { render, screen, waitFor, getDefaultProfileId, env } from "@/utils/testing-library";
import * as contexts from "@/app/contexts";
import { MigrationTransactionStatus, Migration } from "@/domains/migration/migration.contracts";

const Test = () => {
	const { migrations, addTransaction } = useMigrations();

	const createAndAddTransaction = () => {
		const transaction = {
			amount: () => 123,
			id: () => "abc123",
			recipient: () => "0x123",
			sender: () => "AdDreSs",
		} as DTO.ExtendedSignedTransactionData;
		addTransaction(transaction);
	};

	if (migrations === undefined) {
		return <span data-testid="Migration__loading">Loading...</span>;
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
					<button data-testid="Migrations__add" type="button" onClick={createAndAddTransaction}>
						Add
					</button>
				</li>
			</ul>
		</div>
	);
};

let profile: Contracts.IProfile;

describe("Migration Context", () => {
	let configurationMock;
	let profileWatcherMock;
	let ethersLibraryContractSpy;

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
					migration.status === MigrationTransactionStatus.Waiting
						? ethers.constants.AddressZero
						: "0xWhatevs",
			})),
		);

		const ethersMock = Contract.mockImplementation(() => ({
			getMigrationsByArkTxHash: getMigrationsByArkTxHashMock,
		}));

		const clearStoredMigrationsMock = () => {
			environmentMock.mockRestore();
			ethersMock.mockRestore();
		};

		return {
			clearStoredMigrationsMock,
			getMigrationsByArkTxHashMock,
			getMigrationsMock,
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

		ethersLibraryContractSpy = Contract.mockImplementation(() => ({
			getMigrationsByArkTxHash: () => [],
		}));
	});

	afterEach(() => {
		configurationMock.mockRestore();
		profileWatcherMock.mockRestore();
		ethersLibraryContractSpy.mockRestore();
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

		expect(screen.getByTestId("Migration__loading")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.queryByTestId("Migration__loading")).not.toBeInTheDocument();
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

	it("should add a transaction", async () => {
		profileWatcherMock = vi.spyOn(useProfileWatcher, "useProfileWatcher").mockReturnValue(profile);

		const getMigrationsByArkTxHashMock = vi.fn().mockImplementation(() => ({
			amount: 123,
			arkTxHash: `0xabc123`,
			recipient: "0xabc",
		}));

		const ethersMock = Contract.mockImplementation(() => ({
			getMigrationsByArkTxHash: getMigrationsByArkTxHashMock,
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

		userEvent.click(screen.getByTestId("Migrations__add"));

		await waitFor(() => {
			expect(screen.getAllByTestId("MigrationItem")).toHaveLength(1);
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

		let reloadIntervalCallback;

		const setIntervalSpy = vi.spyOn(window, "setInterval").mockImplementation((callback) => {
			if (callback.name === "reloadIntervalCallback") {
				reloadIntervalCallback = callback;
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

		reloadIntervalCallback();

		// Contract method should have been called only when loaded
		expect(getMigrationsByArkTxHashMock).toHaveBeenCalledTimes(1);

		setIntervalSpy.mockRestore();

		clearStoredMigrationsMock();
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
				status: MigrationTransactionStatus.Waiting,
				timestamp: Date.now() / 1000,
			},
		]);

		let reloadIntervalCallback;

		const setIntervalSpy = vi.spyOn(window, "setInterval").mockImplementation((callback) => {
			if (callback.name === "reloadIntervalCallback") {
				reloadIntervalCallback = callback;
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

		reloadIntervalCallback();

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
});
