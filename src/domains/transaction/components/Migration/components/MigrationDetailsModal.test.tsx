import React from "react";

import { DTO } from "@ardenthq/sdk-profiles";
import { DateTime } from "@ardenthq/sdk-intl";
import userEvent from "@testing-library/user-event";
import { MigrationDetailsModal } from "./MigrationDetailsModal";
import { translations } from "@/domains/migration/i18n";
import { render, screen, waitFor } from "@/utils/testing-library";
import * as context from "@/app/contexts";
import { MigrationTransactionStatus, Migration } from "@/domains/migration/migration.contracts";
import { httpClient } from "@/app/services";
import { server, requestMock } from "@/tests/mocks/server";
import * as polygonMigration from "@/utils/polygon-migration";

let transactionFixture: DTO.ExtendedConfirmedTransactionData;
let migrationFixture: Migration;
let polygonIndexerUrlSpy;

describe("MigrationDetailsModal", () => {
	beforeEach(() => {
		polygonIndexerUrlSpy = vi
			.spyOn(polygonMigration, "polygonIndexerUrl")
			.mockReturnValue("https://mumbai.somehost.com/");

		httpClient.clearCache();

		migrationFixture = {
			address: "AdDreSs",
			amount: 123,
			id: "ad68f6c81b7fe5146fe9dd71424740f96909feab7a12a19fe368b7ef4d828445",
			migrationAddress: "BuRnAdDreSs",
			status: MigrationTransactionStatus.Confirmed,
			timestamp: Date.now() / 1000,
		};

		transactionFixture = {
			amount: () => 123,
			id: () => migrationFixture.id,
			memo: () => "0x123456789",
			sender: () => "Address",
			timestamp: () => DateTime.make(),
		} as unknown as DTO.ExtendedConfirmedTransactionData;

		server.use(
			requestMock("https://mumbai.somehost.com/transactions", [
				{
					arkTxHash: migrationFixture.id,
					polygonTxHash: "0x33a45223a017970c476e2fd86da242e57c941ba825b6817efa2b1c105378f236",
				},
			]),
		);
	});

	afterEach(() => {
		polygonIndexerUrlSpy.mockRestore();
	});

	it("should render empty if transaction is not defined", () => {
		render(<MigrationDetailsModal transaction={undefined} onClose={vi.fn()} />);

		expect(screen.queryByTestId("MigrationDetailsModal")).not.toBeInTheDocument();
		expect(screen.queryByTestId("MigrationDetailsModal__loading")).not.toBeInTheDocument();
	});

	it("should show the success step if the migration has confirmed state", async () => {
		const useMigrationsSpy = vi.spyOn(context, "useMigrations").mockImplementation(() => ({
			getTransactionStatus: () => Promise.resolve(MigrationTransactionStatus.Confirmed),
		}));

		render(<MigrationDetailsModal transaction={transactionFixture} onClose={vi.fn()} />);

		await waitFor(() => {
			expect(screen.queryByTestId("MigrationDetailsModal__loading")).not.toBeInTheDocument();
		});

		expect(screen.getByText(translations.DETAILS_MODAL.STEP_SUCCESS.TITLE)).toBeInTheDocument();
		expect(screen.getByText(translations.DETAILS_MODAL.STEP_SUCCESS.DESCRIPTION)).toBeInTheDocument();
		expect(screen.getByTestId("MigrationDetailsModal__confirmed")).toBeInTheDocument();

		useMigrationsSpy.mockRestore();
	});

	it.each([MigrationTransactionStatus.Pending, MigrationTransactionStatus.Confirmed])(
		"should show the handle undefined `memo`",
		async (status) => {
			const transactionWithEmptyMemo = {
				amount: () => 123,
				id: () => "transaction-id",
				memo: () => {},
				sender: () => "Address",
				timestamp: () => DateTime.make(),
			} as unknown as DTO.ExtendedConfirmedTransactionData;

			const useMigrationsSpy = vi.spyOn(context, "useMigrations").mockImplementation(() => ({
				getTransactionStatus: () => Promise.resolve(status),
			}));

			render(<MigrationDetailsModal transaction={transactionWithEmptyMemo} onClose={vi.fn()} />);

			await waitFor(() => {
				expect(screen.queryByTestId("MigrationDetailsModal__loading")).not.toBeInTheDocument();
			});

			expect(screen.getByTestId(`MigrationDetailsModal__${status}`)).toBeInTheDocument();

			useMigrationsSpy.mockRestore();
		},
	);

	it("should show the pending step if the migration has pending state ", async () => {
		const useMigrationsSpy = vi.spyOn(context, "useMigrations").mockImplementation(() => ({
			getTransactionStatus: () => Promise.resolve(MigrationTransactionStatus.Pending),
		}));

		render(<MigrationDetailsModal transaction={transactionFixture} onClose={vi.fn()} />);

		await waitFor(() => {
			expect(screen.queryByTestId("MigrationDetailsModal__loading")).not.toBeInTheDocument();
		});

		expect(screen.getByText(translations.DETAILS_MODAL.STEP_PENDING.TITLE)).toBeInTheDocument();
		expect(screen.getByText(translations.DETAILS_MODAL.STEP_PENDING.DESCRIPTION)).toBeInTheDocument();
		expect(screen.getByTestId("MigrationDetailsModal__pending")).toBeInTheDocument();

		useMigrationsSpy.mockRestore();
	});

	it("should handle close button", async () => {
		const useMigrationsSpy = vi.spyOn(context, "useMigrations").mockImplementation(() => ({
			getTransactionStatus: () => Promise.resolve(MigrationTransactionStatus.Confirmed),
		}));

		const onCloseMock = vi.fn();

		render(<MigrationDetailsModal transaction={transactionFixture} onClose={onCloseMock} />);

		await waitFor(() => {
			expect(screen.queryByTestId("MigrationDetailsModal__loading")).not.toBeInTheDocument();
		});

		userEvent.click(screen.getByTestId("Modal__close-button"));

		expect(onCloseMock).toHaveBeenCalled();

		useMigrationsSpy.mockRestore();
	});
});
