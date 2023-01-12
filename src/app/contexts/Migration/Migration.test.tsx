import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { Contract } from "ethers";
import { MigrationProvider, useMigrations } from "./Migration";
import * as useProfileWatcher from "@/app/hooks/use-profile-watcher";
import { render, screen, waitFor, getDefaultProfileId, env } from "@/utils/testing-library";
import * as contexts from "@/app/contexts";
import { MigrationTransactionStatus } from "@/domains/migration/migration.contracts";

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

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());

		vi.mock("ethers");

		vi.unmock("@/app/contexts/Migration/Migration");
	});

	afterAll(() => {
		vi.unmock("ethers");

		vi.mock("@/app/contexts/Migration/Migration", () => ({
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
		const { BigNumber } = await vi.importActual("ethers");

		const ethersMock = Contract.mockImplementation(() => ({
			getMigrationsByArkTxHash: () => [
				{
					amount: BigNumber.from(124),
					arkTxHash: "0x456",
					recipient: "0x123",
				},
				{
					amount: BigNumber.from(450),
					arkTxHash: "0x012",
					recipient: "0x789",
				},
			],
		}));

		render(
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("Migrations")).toBeInTheDocument();
		});

		expect(screen.getAllByTestId("MigrationItem")).toHaveLength(2);

		ethersMock.mockRestore();
	});

	it("should not reload the migrations if no pending migrations", async () => {
		const reloadMigration = vi.fn();

		const migrations = {};
		migrations[profile.id()] = [
			{
				address: "AdDreSs",
				amount: 123,
				id: "0x123",
				migrationAddress: "0x456",
				status: MigrationTransactionStatus.Confirmed,
				timestamp: Date.now() / 1000,
			},
		];

		environmentMock = vi.spyOn(contexts, "useEnvironmentContext").mockReturnValue({
			...environmentMockData,
			env: {
				data: () => ({
					get: () => migrations,
					set: () => {},
				}),
			},
		});

		const setTimeoutSpy = vi.spyOn(window, "setTimeout").mockImplementation((callback) => {
			if (callback.name === "reloadMigrations") {
				reloadMigration();
			}

			return 1;
		});

		const { BigNumber } = await vi.importActual("ethers");

		const ethersMock = Contract.mockImplementation(() => ({
			getMigrationsByArkTxHash: () => [
				{
					amount: BigNumber.from(124),
					arkTxHash: "0x456",
					recipient: "0x123",
				},
				// Address zero is the pending migration
				{
					amount: BigNumber.from(450),
					arkTxHash: "0x012",
					recipient: "0x123",
				},
			],
		}));

		render(
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("Migrations")).toBeInTheDocument();
		});

		expect(screen.getAllByTestId("MigrationItem")).toHaveLength(2);

		expect(reloadMigration).not.toHaveBeenCalled();

		ethersMock.mockRestore();

		setTimeoutSpy.mockRestore();
	});

	it("should reload the migrations if at least one migration is pending", async () => {
		const migrations = {};
		migrations[profile.id()] = [
			{
				address: "AdDreSs",
				amount: 123,
				id: "0x123",
				migrationAddress: "0x456",
				status: MigrationTransactionStatus.Confirmed,
				timestamp: Date.now() / 1000,
			},
		];

		const getMigrationMock = vi.fn().mockImplementation(() => migrations);

		environmentMock.mockRestore();

		let reloadMigrationCallback: any;

		const setTimeoutSpy = vi.spyOn(window, "setTimeout").mockImplementation((callback) => {
			if (callback.name === "reloadMigrations") {
				reloadMigrationCallback = callback;
			}

			return 1;
		});

		environmentMock = vi.spyOn(contexts, "useEnvironmentContext").mockReturnValue({
			...environmentMockData,
			env: {
				data: () => ({
					get: getMigrationMock,
					set: () => {},
				}),
			},
		});

		const { BigNumber, constants } = await vi.importActual("ethers");

		const ethersMock = Contract.mockImplementation(() => ({
			getMigrationsByArkTxHash: () => [
				{
					amount: BigNumber.from(124),
					arkTxHash: "0x456",
					recipient: "0x123",
				},
				// Address zero is the pending migration
				{
					amount: BigNumber.from(450),
					arkTxHash: "0x012",
					recipient: constants.AddressZero,
				},
			],
		}));

		render(
			<MigrationProvider>
				<Test />
			</MigrationProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("Migrations")).toBeInTheDocument();
		});

		reloadMigrationCallback();

		expect(screen.getAllByTestId("MigrationItem")).toHaveLength(2);

		expect(getMigrationMock).toHaveBeenCalledTimes(3);

		ethersMock.mockRestore();

		setTimeoutSpy.mockRestore();
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
