import React from "react";

import { Contract } from "ethers";
import { MigrationProvider, useMigrations } from "./Migration";
import { render, screen, waitFor } from "@/utils/testing-library";
import * as contexts from "@/app/contexts";

describe("Migration Context", () => {
	let environmentMock;
	const environmentMockData = {
		env: {
			data: () => ({
				get: () => [],
				set: () => {},
			}),
		},
		isEnvironmentBooted: true,
		persist: vi.fn(),
	};

	beforeEach(() => {
		environmentMock = vi.spyOn(contexts, "useEnvironmentContext").mockReturnValue(environmentMockData);
	});

	afterEach(() => {
		environmentMock.mockRestore();
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
		const Test = () => {
			const { migrations } = useMigrations();

			return <div>{migrations === undefined && <span data-testid="Migration__loading">Loading...</span>}</div>;
		};

		render(<Test />);

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

		const Test = () => {
			const { migrations } = useMigrations();

			if (migrations === undefined) {
				return <></>;
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

		render(<Test />);

		await waitFor(() => {
			expect(screen.getByTestId("Migrations")).toBeInTheDocument();
		});

		expect(screen.getAllByTestId("MigrationItem")).toHaveLength(2);

		ethersMock.mockRestore();
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
