import { Contracts } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import React from "react";
import userEvent from "@testing-library/user-event";
import { Route } from "react-router-dom";
import * as browserAccess from "browser-fs-access";
import { TransactionExportModal } from ".";
import { env, getDefaultProfileId, render, screen, syncDelegates, waitFor, within } from "@/utils/testing-library";
import { requestMock, server } from "@/tests/mocks/server";

import transactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions.json";

const history = createHashHistory();

const fixtureProfileId = getDefaultProfileId();
let dashboardURL: string;

const exportButton = () => screen.getByTestId("TransactionExport__submit-button");
const downloadButton = () => screen.getByTestId("TransactionExportSuccess__download-button");

const dateToggle = () =>
	within(screen.getByTestId("dropdown__toggle-TransactionExportForm--daterange-options")).getByTestId(
		"CollapseToggleButton",
	);

describe("TransactionExportModal", () => {
	let profile: Contracts.IProfile;

	beforeEach(async () => {
		const { meta, data } = transactionsFixture;

		server.use(
			requestMock("https://ark-test.arkvault.io/api/transactions", {
				data: [data[0]],
				meta,
			}),
		);

		dashboardURL = `/profiles/${fixtureProfileId}/dashboard`;
		history.push(dashboardURL);
		profile = env.profiles().findById(getDefaultProfileId());

		await syncDelegates(profile);

		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should render", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportModal isOpen wallet={profile.wallets().first()} onClose={vi.fn()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with fiat column", async () => {
		const walletSpy = vi.spyOn(profile.wallets().first().network(), "isLive").mockReturnValue(true);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportModal isOpen wallet={profile.wallets().first()} onClose={vi.fn()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		expect(screen.getByTestId("TransactionExportForm__toggle-include-fiat-amount")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		walletSpy.mockRestore();
	});

	it("should render progress status", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportModal isOpen wallet={profile.wallets().first()} onClose={vi.fn()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		expect(exportButton()).not.toBeDisabled();

		userEvent.click(exportButton());

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render error status", async () => {
		const transactionIndexMock = vi.spyOn(profile.wallets().first(), "transactionIndex").mockImplementation(() => {
			throw new Error("error");
		});

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportModal isOpen wallet={profile.wallets().first()} onClose={vi.fn()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		userEvent.click(exportButton());

		await expect(screen.findByTestId("TransactionExportError__back-button")).resolves.toBeInTheDocument();

		userEvent.click(screen.getByTestId("TransactionExportError__back-button"));

		await expect(screen.findByTestId("TransactionExport__submit-button")).resolves.toBeInTheDocument();

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		expect(asFragment()).toMatchSnapshot();

		transactionIndexMock.mockRestore();
	});

	it("should render success status", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportModal isOpen wallet={profile.wallets().first()} onClose={vi.fn()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		userEvent.click(exportButton());

		await waitFor(() => {
			expect(downloadButton()).toBeEnabled();
		});

		userEvent.click(screen.getByTestId("TransactionExportSuccess__back-button"));

		await expect(screen.findByTestId("TransactionExport__submit-button")).resolves.toBeInTheDocument();

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render success and download file", async () => {
		const onClose = vi.fn();
		const browserAccessMock = vi.spyOn(browserAccess, "fileSave").mockResolvedValue({ name: "test.csv" });

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportModal isOpen wallet={profile.wallets().first()} onClose={onClose} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		userEvent.click(exportButton());

		await waitFor(() => {
			expect(downloadButton()).toBeEnabled();
		});

		userEvent.click(downloadButton());

		await waitFor(() => expect(onClose).toHaveBeenCalledWith());

		expect(asFragment()).toMatchSnapshot();

		browserAccessMock.mockRestore();
	});

	it("should render success and stay open if download fails", async () => {
		const onClose = vi.fn();
		const browserAccessMock = vi.spyOn(browserAccess, "fileSave").mockImplementation(() => {
			throw new Error("error");
		});

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportModal isOpen wallet={profile.wallets().first()} onClose={onClose} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		userEvent.click(exportButton());

		await waitFor(() => {
			expect(downloadButton()).toBeEnabled();
		});

		userEvent.click(downloadButton());

		await waitFor(() => expect(onClose).not.toHaveBeenCalledWith());

		expect(asFragment()).toMatchSnapshot();

		browserAccessMock.mockRestore();
	});

	it("should emit onClose", async () => {
		const onClose = vi.fn();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportModal isOpen wallet={profile.wallets().first()} onClose={onClose} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		userEvent.click(screen.getByTestId("Modal__close-button"));

		await waitFor(() => expect(onClose).toHaveBeenCalledWith());
	});

	it("should disable export button if all column toggles are off", async () => {
		const walletSpy = vi.spyOn(profile.wallets().first().network(), "isLive").mockReturnValue(true);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportModal isOpen wallet={profile.wallets().first()} onClose={vi.fn()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		userEvent.click(screen.getByTestId("TransactionExportForm__toggle-include-header-row"));

		userEvent.click(screen.getByTestId("TransactionExportForm__toggle-include-tx-id"));
		userEvent.click(screen.getByTestId("TransactionExportForm__toggle-include-date"));
		userEvent.click(screen.getByTestId("TransactionExportForm__toggle-include-sender-recipient"));
		userEvent.click(screen.getByTestId("TransactionExportForm__toggle-include-crypto-amount"));
		userEvent.click(screen.getByTestId("TransactionExportForm__toggle-include-fiat-amount"));

		await waitFor(() => {
			expect(exportButton()).toBeDisabled();
		});

		walletSpy.mockRestore();
	});
});
