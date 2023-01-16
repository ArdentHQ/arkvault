import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { Contract, ethers } from "ethers";
import { MigrationProvider, useMigrations } from "./Migration";
import * as useProfileWatcher from "@/app/hooks/use-profile-watcher";
import { render, screen, waitFor, getDefaultProfileId, env } from "@/utils/testing-library";
import * as contexts from "@/app/contexts";
import { MigrationTransactionStatus, Migration } from "@/domains/migration/migration.contracts";

const Test = () => {
	const { migrations } = useMigrations();

	if (migrations === undefined) {
		return <span data-testid="Migration__loading">Loading...</span>;
	}

	return (
		<ul data-testid="Migrations">
			{migrations.map((migration) => (
				<li data-testid="MigrationItem" key={migration.id}>
					{migration.address}
				</li>
			))}
		</ul>
	);
};

let profile: Contracts.IProfile;

describe("Migration Context", () => {
	let environmentMock;
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
		environmentMock = vi.spyOn(contexts, "useEnvironmentContext").mockReturnValue(environmentMockData);
		configurationMock = vi.spyOn(contexts, "useConfiguration").mockReturnValue({
			profileHasSyncedOnce: true,
		});

		profileWatcherMock = vi.spyOn(useProfileWatcher, "useProfileWatcher").mockReturnValue(profile);

		ethersLibraryContractSpy = Contract.mockImplementation(() => ({
			getMigrationsByArkTxHash: () => [],
		}));
	});

	afterEach(() => {
		environmentMock.mockRestore();
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

		const getMigrationMock = vi.fn().mockImplementation(() => []);

		environmentMock.mockRestore();

		environmentMock = vi.spyOn(contexts, "useEnvironmentContext").mockReturnValue({
			...environmentMockData,
			env: {
				data: () => ({
					get: getMigrationMock,
					set: () => {},
				}),
			},
		});

		render(
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("Migration__loading")).toBeInTheDocument();
		});

		expect(getMigrationMock).not.toHaveBeenCalled();
	});
});
