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
		const { asFragment } = renderWithForm(<TransactionExportForm />, {
			breakpoint,
		});

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should emit cancel", () => {
		const onCancel = jest.fn();

		renderWithForm(<TransactionExportForm onCancel={onCancel} />);

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("TransactionExportForm__cancel-button"));

		expect(onCancel).toHaveBeenCalledWith();
	});

	it("should render fiat column", () => {
		const onCancel = jest.fn();

		const { asFragment } = renderWithForm(<TransactionExportForm onCancel={onCancel} showFiatColumn={true} />);

		expect(screen.getByTestId("TransactionExportForm__toggle-include-fiat-amount")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should select outgoing transactions", () => {
		renderWithForm(<TransactionExportForm />);

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();

		userEvent.click(screen.getAllByTestId("ButtonGroupOption")[1]);
	});

	it("should select last month", () => {
		renderWithForm(<TransactionExportForm />);

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();

		userEvent.click(screen.getAllByTestId("dropdown__toggle")[0]);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("dropdown__option--all-1"));
	});

	it("should render custom date range", () => {
		renderWithForm(<TransactionExportForm onCancel={jest.fn()} />, {
			defaultValues: {
				from: new Date(),
				to: new Date(),
			},
			registerCallback: ({ register }) => {
				register("dateRange");
				register("from");
				register("to");
			},
		});

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();

		userEvent.click(screen.getAllByTestId("dropdown__toggle")[0]);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("dropdown__option--custom-0"));
	});

	it("should select tab delimiter", () => {
		renderWithForm(<TransactionExportForm />, {
			defaultValues: {
				delimiter: ",",
			},
		});

		expect(screen.getByTestId("TransactionExportForm")).toBeInTheDocument();

		userEvent.click(screen.getAllByTestId("dropdown__toggle")[1]);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("dropdown__option--2"));
	});
});
