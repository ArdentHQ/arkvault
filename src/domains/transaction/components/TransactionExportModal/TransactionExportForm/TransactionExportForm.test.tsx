import { Contracts } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import userEvent from "@testing-library/user-event";
import nock from "nock";
import React from "react";

import { TransactionExportForm } from ".";
import { env, getDefaultProfileId, renderWithForm, screen, syncDelegates } from "@/utils/testing-library";

const history = createHashHistory();

const fixtureProfileId = getDefaultProfileId();
let dashboardURL: string;

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
		const { asFragment } = renderWithForm(<TransactionExportForm wallet={profile.wallets().first()} />, {
			breakpoint,
		});

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should emit cancel", () => {
		const onCancel = jest.fn();

		renderWithForm(<TransactionExportForm wallet={profile.wallets().first()} onCancel={onCancel} />);

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("TransactionExportForm__cancel-button"));

		expect(onCancel).toHaveBeenCalledWith();
	});

	it("should render fiat column if wallet is live", () => {
		const onCancel = jest.fn();

		jest.spyOn(profile.wallets().first().network(), "isLive").mockReturnValue(true);

		const { asFragment } = renderWithForm(
			<TransactionExportForm onCancel={onCancel} wallet={profile.wallets().first()} />,
		);

		expect(screen.getByTestId("TransactionExportForm__toggle-include-fiat-amount")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should select outgoing transactions", () => {
		renderWithForm(<TransactionExportForm wallet={profile.wallets().first()} />);

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();

		userEvent.click(screen.getAllByTestId("ButtonGroupOption")[1]);
	});

	it("should select last month", () => {
		renderWithForm(<TransactionExportForm wallet={profile.wallets().first()} />);

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();

		userEvent.click(screen.getAllByTestId("dropdown__toggle")[0]);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("dropdown__option--all-1"));
	});

	it("should render custom date range", () => {
		renderWithForm(<TransactionExportForm wallet={profile.wallets().first()} />);

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();

		userEvent.click(screen.getAllByTestId("dropdown__toggle")[0]);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("dropdown__option--custom-0"));
	});

	it("should select tab delimiter", () => {
		renderWithForm(<TransactionExportForm wallet={profile.wallets().first()} />);

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();

		userEvent.click(screen.getAllByTestId("dropdown__toggle")[1]);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("dropdown__option--2"));
	});
});
