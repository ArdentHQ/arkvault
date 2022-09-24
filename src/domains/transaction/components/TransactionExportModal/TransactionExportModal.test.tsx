import { Contracts } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import nock from "nock";
import React from "react";
import userEvent from "@testing-library/user-event";
import { Route } from "react-router-dom";
import * as browserAccess from "browser-fs-access";
import { TransactionExportModal, ExportProgressStatus } from ".";
import { env, getDefaultProfileId, render, screen, syncDelegates, waitFor, within } from "@/utils/testing-library";

const history = createHashHistory();

const fixtureProfileId = getDefaultProfileId();
let dashboardURL: string;

const exportButton = () => screen.getByTestId("TransactionExport__submit-button");
const dateToggle = () =>
	within(screen.getByTestId("TransactionExportForm--daterange-options")).getByTestId("CollapseToggleButton");

describe("TransactionExportModal", () => {
	let profile: Contracts.IProfile;

	beforeAll(() => {
		nock.disableNetConnect();
		nock("https://ark-test.arkvault.io")
			.get("/api/delegates")
			.query({ page: "1" })
			.reply(200, require("tests/fixtures/coins/ark/devnet/delegates.json"))
			.get("/api/transactions")
			.query({ address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD", orderBy: "timestamp:asc" })
			.reply(200, require("tests/fixtures/coins/ark/devnet/transactions.json"))
			.get("/api/transactions")
			.query((query) => query.page === "1")
			.reply(200, () => {
				const { meta, data } = require("tests/fixtures/coins/ark/devnet/transactions.json");
				return {
					data: Array.from({ length: 100 }).fill(data[0]),
					meta,
				};
			})
			.get("/api/transactions")
			.query(true)
			.reply(200, require("tests/fixtures/coins/ark/devnet/transactions.json"))
			.persist();
	});

	beforeEach(async () => {
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
				<TransactionExportModal isOpen wallet={profile.wallets().first()} onClose={jest.fn()} />
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
		const walletSpy = jest.spyOn(profile.wallets().first().network(), "isLive").mockReturnValue(true);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportModal isOpen wallet={profile.wallets().first()} onClose={jest.fn()} />
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
				<TransactionExportModal
					isOpen
					wallet={profile.wallets().first()}
					onClose={jest.fn()}
				/>
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

		userEvent.click(screen.getByTestId("TransactionExport__submit-button"));

		await expect(screen.findByTestId("TransactionExportProgress__cancel-button")).resolves.toBeInTheDocument();

		userEvent.click(screen.getByTestId("TransactionExportProgress__cancel-button"));

		await expect(screen.findByTestId("TransactionExport__submit-button")).resolves.toBeInTheDocument();

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		expect(asFragment()).toMatchSnapshot();
	});

	// missing mocks
	it.skip("should render error status", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportModal
					isOpen
					wallet={profile.wallets().first()}
					onClose={jest.fn()}
				/>
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

		userEvent.click(screen.getByTestId("TransactionExport__submit-button"));

		await expect(screen.findByTestId("TransactionExportError__cancel-button")).resolves.toBeInTheDocument();

		userEvent.click(screen.getByTestId("TransactionExportError__back-button"));

		await expect(screen.findByTestId("TransactionExport__submit-button")).resolves.toBeInTheDocument();

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render success status", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportModal
					isOpen
					wallet={profile.wallets().first()}
					onClose={jest.fn()}
				/>
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

		userEvent.click(screen.getByTestId("TransactionExport__submit-button"));

		await waitFor(() => {
			expect(screen.getByTestId("TransactionExportSuccess__download-button")).toBeEnabled();
		});

		userEvent.click(screen.getByTestId("TransactionExportSuccess__back-button"));

		await expect(screen.findByTestId("TransactionExport__submit-button")).resolves.toBeInTheDocument();

		await waitFor(() => {
			expect(dateToggle()).toBeEnabled();
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render success and download file", async () => {
		const onClose = jest.fn();
		const browserAccessMock = jest.spyOn(browserAccess, "fileSave").mockResolvedValue({ name: "test.csv" });

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportModal
					isOpen
					wallet={profile.wallets().first()}
					onClose={onClose}
				/>
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

		userEvent.click(screen.getByTestId("TransactionExport__submit-button"));

		await waitFor(() => {
			expect(screen.getByTestId("TransactionExportSuccess__download-button")).toBeEnabled();
		});

		userEvent.click(screen.getByTestId("TransactionExportSuccess__download-button"));

		await waitFor(() => expect(onClose).toHaveBeenCalledWith());

		expect(asFragment()).toMatchSnapshot();

		browserAccessMock.mockRestore();
	});

	it("should render success and stay open if download fails", async () => {
		const onClose = jest.fn();
		const browserAccessMock = jest.spyOn(browserAccess, "fileSave").mockImplementation(() => {
			throw new Error("error");
		});

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportModal
					isOpen
					wallet={profile.wallets().first()}
					onClose={onClose}
				/>
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

		userEvent.click(screen.getByTestId("TransactionExport__submit-button"));

		await waitFor(() => {
			expect(screen.getByTestId("TransactionExportSuccess__download-button")).toBeEnabled();
		});

		userEvent.click(screen.getByTestId("TransactionExportSuccess__download-button"));

		await waitFor(() => expect(onClose).not.toHaveBeenCalledWith());

		expect(asFragment()).toMatchSnapshot();

		browserAccessMock.mockRestore();
	});

	it("should emit onClose", async () => {
		const onClose = jest.fn();

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
		const walletSpy = jest.spyOn(profile.wallets().first().network(), "isLive").mockReturnValue(true);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportModal isOpen wallet={profile.wallets().first()} onClose={jest.fn()} />
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
