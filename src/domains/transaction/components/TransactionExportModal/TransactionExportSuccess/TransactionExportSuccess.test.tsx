import { createHashHistory } from "history";
import nock from "nock";
import React from "react";
import { Route } from "react-router-dom";

import { TransactionExportSuccess } from "./TransactionExportSuccess";
import { getDefaultProfileId, screen, renderResponsive, render } from "@/utils/testing-library";

const history = createHashHistory();

const fixtureProfileId = getDefaultProfileId();
let dashboardURL: string;

describe("TransactionExportForm", () => {
	beforeAll(() => {
		nock.disableNetConnect();
		nock("https://ark-test.arkvault.io")
			.get("/api/delegates")
			.query({ page: "1" })
			.reply(200, require("tests/fixtures/coins/ark/devnet/delegates.json"))
			.persist();
	});

	beforeEach(() => {
		dashboardURL = `/profiles/${fixtureProfileId}/dashboard`;
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint: string) => {
		const { asFragment } = renderResponsive(<TransactionExportSuccess />, breakpoint, {
			history,
			route: dashboardURL,
		});

		expect(screen.getByTestId("TransactionExportSuccess__download-button")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render warnigg if count is zero", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportSuccess count={0} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("TransactionExportSuccess__download-button")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
