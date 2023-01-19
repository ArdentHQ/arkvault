import React from "react";

import { DTO } from "@ardenthq/sdk-profiles";
import { DateTime } from "@ardenthq/sdk-intl";
import userEvent from "@testing-library/user-event";
import { MigrationDetailsModal } from "./MigrationDetailsModal";
import { translations } from "@/domains/migration/i18n";
import { render, screen } from "@/utils/testing-library";
import * as context from "@/app/contexts";
import { MigrationTransactionStatus } from "@/domains/migration/migration.contracts";

let transactionFixture: DTO.ExtendedConfirmedTransactionData;

describe("MigrationDetailsModal", () => {
	beforeAll(() => {
		transactionFixture = {
			amount: () => 123,
			id: () => "transaction-id",
			memo: () => "0x123456789",
			sender: () => "Address",
			timestamp: () => DateTime.make(),
		} as unknown as DTO.ExtendedConfirmedTransactionData;
	});

	it("should render empty if transaction is not defined", () => {
		render(<MigrationDetailsModal transaction={undefined} onClose={vi.fn()} />);

		expect(screen.queryByTestId("MigrationDetailsModal")).not.toBeInTheDocument();
	});

	it("should show the success step if the migration has confirmed state", async () => {
		const useMigrationsSpy = vi.spyOn(context, "useMigrations").mockImplementation(() => ({
			getTransactionStatus: () => Promise.resolve(MigrationTransactionStatus.Confirmed),
		}));

		render(<MigrationDetailsModal transaction={transactionFixture} onClose={vi.fn()} />);

		await expect(screen.findByTestId("MigrationDetailsModal")).resolves.toBeVisible();

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

			await expect(screen.findByTestId("MigrationDetailsModal")).resolves.toBeVisible();

			expect(screen.getByTestId("MigrationDetailsModal__confirmed")).toBeInTheDocument();

			useMigrationsSpy.mockRestore();
		},
	);

	it("should show the pending step if the migration has pending state ", async () => {
		const useMigrationsSpy = vi.spyOn(context, "useMigrations").mockImplementation(() => ({
			getTransactionStatus: () => Promise.resolve(MigrationTransactionStatus.Pending),
		}));

		render(<MigrationDetailsModal transaction={transactionFixture} onClose={vi.fn()} />);

		await expect(screen.findByTestId("MigrationDetailsModal")).resolves.toBeVisible();

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

		await expect(screen.findByTestId("MigrationDetailsModal")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("Modal__close-button"));

		expect(onCloseMock).toHaveBeenCalled();

		useMigrationsSpy.mockRestore();
	});
});
