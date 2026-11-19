import { Contracts } from "@/app/lib/profiles";
import React from "react";
import userEvent from "@testing-library/user-event";
import * as browserAccess from "browser-fs-access";
import { TransactionExportSidePanel } from ".";
import { env, getDefaultProfileId, render, screen, syncValidators, waitFor, within } from "@/utils/testing-library";
import { requestMock, server } from "@/tests/mocks/server";

import transactionsFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions.json";

const fixtureProfileId = getDefaultProfileId();
let dashboardURL: string;

const exportButton = () => screen.getByTestId("TransactionExport__submit-button");
const downloadButton = () => screen.getByTestId("TransactionExportSuccess__download-button");

const dateToggle = () =>
	within(screen.getByTestId("TransactionExportForm--daterange")).getByTestId("CollapseToggleButton");

describe("TransactionExportSidePanel", () => {
	let profile: Contracts.IProfile;

	const renderPanel = (onOpenChange = vi.fn()) =>
		render(<TransactionExportSidePanel open onOpenChange={onOpenChange} wallets={[profile.wallets().first()]} />, {
			route: dashboardURL,
		});

	beforeEach(async () => {
		const { meta, data } = transactionsFixture;

		server.use(
			requestMock("https://ark-test.arkvault.io/api/transactions", {
				data: [data[0]],
				meta,
			}),
		);

		dashboardURL = `/profiles/${fixtureProfileId}/dashboard`;
		profile = env.profiles().findById(getDefaultProfileId());

		await syncValidators(profile);

		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should render", async () => {
		const { asFragment } = renderPanel();

		expect(screen.getByTestId("TransactionExportSidePanel")).toBeInTheDocument();

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with fiat column", async () => {
		const walletSpy = vi.spyOn(profile.wallets().first().network(), "isLive").mockReturnValue(true);

		renderPanel();

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		expect(screen.getByTestId("TransactionExportForm__toggle-include-fiat-amount")).toBeInTheDocument();

		walletSpy.mockRestore();
	});

	it("should enable export button", async () => {
		renderPanel();

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		expect(exportButton()).not.toBeDisabled();
	});

	it("should render error status and retry", async () => {
		const transactionIndexMock = vi.spyOn(profile.transactionAggregate(), "received").mockImplementation(() => {
			throw new Error("error");
		});

		renderPanel();

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		await userEvent.click(exportButton());

		await expect(screen.findByTestId("TransactionExportError")).resolves.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("TransactionExportError__retry-button"));

		await expect(screen.findByTestId("TransactionExportError")).resolves.toBeInTheDocument();

		transactionIndexMock.mockRestore();
	});

	it("should close from error status", async () => {
		const onOpenChange = vi.fn();
		const transactionIndexMock = vi.spyOn(profile.transactionAggregate(), "received").mockImplementation(() => {
			throw new Error("error");
		});

		renderPanel(onOpenChange);

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		await userEvent.click(exportButton());

		await expect(screen.findByTestId("TransactionExportError__close-button")).resolves.toBeInTheDocument();

		expect(screen.queryByTestId("TransactionExportError__download")).not.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("TransactionExportError__close-button"));

		await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));

		transactionIndexMock.mockRestore();
	});

	it("should download partial file and close from error status", async () => {
		const onOpenChange = vi.fn();
		const realResult = await profile.transactionAggregate().all({ limit: 1 });
		const realItem = realResult.items()[0];

		const receivedMock = vi.spyOn(profile.transactionAggregate(), "received");
		receivedMock
			.mockResolvedValueOnce({
				items: () => Array.from({ length: 100 }, () => realItem),
			} as any)
			.mockRejectedValueOnce(new Error("Network error"));

		const browserAccessMock = vi
			.spyOn(browserAccess, "fileSave")
			.mockResolvedValue({ kind: "file", name: "test.csv" } as any);

		renderPanel(onOpenChange);

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		await userEvent.click(exportButton());

		await expect(screen.findByTestId("TransactionExportError__download")).resolves.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("TransactionExportError__download"));

		await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));

		browserAccessMock.mockRestore();
		receivedMock.mockRestore();
	});

	it("should render success status", async () => {
		const { asFragment } = renderPanel();

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		await userEvent.click(exportButton());

		await waitFor(() => {
			expect(downloadButton()).toBeEnabled();
		});

		expect(screen.getByTestId("TransactionExportSuccess")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should close from success status", async () => {
		const onOpenChange = vi.fn();

		renderPanel(onOpenChange);

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		await userEvent.click(exportButton());

		await waitFor(() => {
			expect(downloadButton()).toBeEnabled();
		});

		await userEvent.click(screen.getByTestId("TransactionExportSuccess__close-button"));

		await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
	});

	it("should download file and close", async () => {
		const onOpenChange = vi.fn();
		const browserAccessMock = vi.spyOn(browserAccess, "fileSave").mockResolvedValue({ name: "test.csv" });

		renderPanel(onOpenChange);

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		await userEvent.click(exportButton());

		await waitFor(() => {
			expect(downloadButton()).toBeEnabled();
		});

		await userEvent.click(downloadButton());

		await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));

		browserAccessMock.mockRestore();
	});

	it("should stay open if download fails", async () => {
		const onOpenChange = vi.fn();
		const browserAccessMock = vi.spyOn(browserAccess, "fileSave").mockImplementation(() => {
			throw new Error("error");
		});

		renderPanel(onOpenChange);

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		await userEvent.click(exportButton());

		await waitFor(() => {
			expect(downloadButton()).toBeEnabled();
		});

		await userEvent.click(downloadButton());

		expect(onOpenChange).not.toHaveBeenCalled();
		expect(screen.getByTestId("TransactionExportSuccess")).toBeInTheDocument();

		browserAccessMock.mockRestore();
	});

	it("should cancel export while in progress", async () => {
		const receivedMock = vi
			.spyOn(profile.transactionAggregate(), "received")
			.mockImplementation(() => new Promise(() => {}));

		renderPanel();

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		await userEvent.click(exportButton());

		await expect(screen.findByTestId("TransactionExportProgress")).resolves.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("TransactionExportProgress__cancel-button"));

		await expect(screen.findByTestId("TransactionExport__submit-button")).resolves.toBeInTheDocument();

		receivedMock.mockRestore();
	});

	it("should emit onOpenChange when cancelled", async () => {
		const onOpenChange = vi.fn();

		renderPanel(onOpenChange);

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		await userEvent.click(screen.getByTestId("TransactionExportForm__cancel-button"));

		await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
	});

	it("should disable export button if all column toggles are off", async () => {
		const walletSpy = vi.spyOn(profile.wallets().first().network(), "isLive").mockReturnValue(true);

		renderPanel();

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		await userEvent.click(screen.getByTestId("TransactionExportForm__toggle-include-header-row"));

		await userEvent.click(screen.getByTestId("TransactionExportForm__toggle-include-tx-id"));
		await userEvent.click(screen.getByTestId("TransactionExportForm__toggle-include-date"));
		await userEvent.click(screen.getByTestId("TransactionExportForm__toggle-include-sender-recipient"));
		await userEvent.click(screen.getByTestId("TransactionExportForm__toggle-include-crypto-amount"));
		await userEvent.click(screen.getByTestId("TransactionExportForm__toggle-include-fiat-amount"));

		await waitFor(() => {
			expect(exportButton()).toBeDisabled();
		});

		walletSpy.mockRestore();
	});
});
