import { Contracts } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import userEvent from "@testing-library/user-event";
import nock from "nock";
import React from "react";
import { Route } from "react-router-dom";

import { TransactionExportForm } from ".";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	syncDelegates,
	waitFor,
	renderResponsive,
} from "@/utils/testing-library";

const history = createHashHistory();

const fixtureProfileId = getDefaultProfileId();
let dashboardURL: string;

const defaultSettings = {
	dateRange: "currentMonth",
	delimiter: ",",
	includeCryptoAmount: true,
	includeDate: true,
	includeHeaderRow: true,
	includeSenderRecipient: true,
	includeTransactionId: true,
	transactionType: "received",
};

const ExportButton = "TransactionExport__submit-button";

describe("TransactionExportForm", () => {
	let profile: Contracts.IProfile;

	beforeAll(() => {
		nock.disableNetConnect();
		nock("https://ark-test.arkvault.io")
			.get("/api/delegates")
			.query({ page: "1" })
			.reply(200, require("tests/fixtures/coins/ark/devnet/delegates.json"))
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

	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint: string) => {
		const { asFragment } = renderResponsive(
			<TransactionExportForm wallet={profile.wallets().first()} />,
			breakpoint,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should emit cancel", () => {
		const onCancel = jest.fn();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportForm onCancel={onCancel} wallet={profile.wallets().first()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("TransactionExportForm__cancel-button"));

		expect(onCancel).toHaveBeenCalledWith();
	});

	it("should render fiat column if wallet is live", () => {
		const onCancel = jest.fn();
		jest.spyOn(profile.wallets().first().network(), "isLive").mockReturnValue(true);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportForm onCancel={onCancel} wallet={profile.wallets().first()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("TransactionExportForm__toggle-include-fiat-amount")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should emit onExport", async () => {
		const onExport = jest.fn();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportForm onExport={onExport} wallet={profile.wallets().first()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();

		userEvent.click(screen.getByTestId(ExportButton));
		await waitFor(() => expect(onExport).toHaveBeenCalledWith(expect.objectContaining(defaultSettings)));
	});

	it("should select outgoing transactions", async () => {
		const onExport = jest.fn();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportForm onExport={onExport} wallet={profile.wallets().first()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();

		userEvent.click(screen.getAllByTestId("ButtonGroupOption")[1]);

		userEvent.click(screen.getByTestId(ExportButton));

		await waitFor(() =>
			expect(onExport).toHaveBeenCalledWith(
				expect.objectContaining({
					...defaultSettings,
					transactionType: "sent",
				}),
			),
		);
	});

	it("should select last month", async () => {
		const onExport = jest.fn();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportForm onExport={onExport} wallet={profile.wallets().first()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();

		userEvent.click(screen.getAllByTestId("dropdown__toggle")[0]);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("dropdown__option--all-1"));

		userEvent.click(screen.getByTestId(ExportButton));

		await waitFor(() =>
			expect(onExport).toHaveBeenCalledWith(
				expect.objectContaining({
					...defaultSettings,
					dateRange: "lastMonth",
				}),
			),
		);
	});

	it("should render custom date range", async () => {
		const onExport = jest.fn();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportForm onExport={onExport} wallet={profile.wallets().first()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();

		userEvent.click(screen.getAllByTestId("dropdown__toggle")[0]);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("dropdown__option--custom-0"));

		userEvent.click(screen.getByTestId(ExportButton));

		await waitFor(() =>
			expect(onExport).toHaveBeenCalledWith(
				expect.objectContaining({
					...defaultSettings,
					dateRange: "custom",
					from: new Date("2020-06-24T00:00:00.000Z"),
					to: new Date("2020-07-01T00:00:00.000Z"),
				}),
			),
		);
	});

	it("should select tab delimiter", async () => {
		const onExport = jest.fn();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportForm onExport={onExport} wallet={profile.wallets().first()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();

		userEvent.click(screen.getAllByTestId("dropdown__toggle")[1]);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("dropdown__option--2"));

		userEvent.click(screen.getByTestId(ExportButton));

		await waitFor(() =>
			expect(onExport).toHaveBeenCalledWith(
				expect.objectContaining({
					...defaultSettings,
					delimiter: "	",
				}),
			),
		);
	});

	it("should not emit onExport if all column toggles are off", async () => {
		const onExport = jest.fn();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportForm onExport={onExport} wallet={profile.wallets().first()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();

		userEvent.click(screen.getAllByTestId("dropdown__toggle")[1]);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("dropdown__option--2"));

		userEvent.click(screen.getByTestId("TransactionExportForm__toggle-include-tx-id"));
		userEvent.click(screen.getByTestId("TransactionExportForm__toggle-include-date"));
		userEvent.click(screen.getAllByTestId("TransactionExportForm__toggle-include-crypto-amount")[0]);
		userEvent.click(screen.getByTestId("TransactionExport__submit-button"));

		await waitFor(() => expect(onExport).not.toHaveBeenCalledWith(expect.anything()));
	});
});
