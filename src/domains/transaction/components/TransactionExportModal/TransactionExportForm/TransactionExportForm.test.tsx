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
	includeFiatAmount: true,
	includeHeaderRow: true,
	includeSenderRecipient: true,
	includeTransactionId: true,
	transactionType: "all",
};

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
		const { asFragment } = renderResponsive(<TransactionExportForm />, breakpoint, {
			history,
			route: dashboardURL,
		});

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should emit cancel", () => {
		const onCancel = jest.fn();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportForm onCancel={onCancel} />
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

	it("should emit onExport", async () => {
		const onExport = jest.fn();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportForm onExport={onExport} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("TransactionExport__submit-button"));
		await waitFor(() => expect(onExport).toHaveBeenCalledWith(expect.objectContaining(defaultSettings)));
	});

	it("should select outgoing transactions", async () => {
		const onExport = jest.fn();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportForm onExport={onExport} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();

		userEvent.click(screen.getAllByTestId("ButtonGroupOption")[2]);

		userEvent.click(screen.getByTestId("TransactionExport__submit-button"));

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
				<TransactionExportForm onExport={onExport} />
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

		userEvent.click(screen.getByTestId("TransactionExport__submit-button"));

		await waitFor(() =>
			expect(onExport).toHaveBeenCalledWith(
				expect.objectContaining({
					...defaultSettings,
					dateRange: "lastMonth",
				}),
			),
		);
	});

	it("should select tab delimiter", async () => {
		const onExport = jest.fn();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportForm onExport={onExport} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();

		userEvent.click(screen.getAllByTestId("dropdown__toggle")[1]);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("dropdown__option--all-2"));

		userEvent.click(screen.getByTestId("TransactionExport__submit-button"));

		await waitFor(() =>
			expect(onExport).toHaveBeenCalledWith(
				expect.objectContaining({
					...defaultSettings,
					delimiter: "	",
				}),
			),
		);
	});
});
