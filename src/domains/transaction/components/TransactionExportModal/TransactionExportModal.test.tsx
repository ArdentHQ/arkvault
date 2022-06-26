import { Contracts } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import nock from "nock";
import React from "react";
import { Route } from "react-router-dom";
import { env, getDefaultProfileId, render, screen, syncDelegates } from "@/utils/testing-library";

import { TransactionExportModal, ExportProgressStatus } from "./";
const history = createHashHistory();

const fixtureProfileId = getDefaultProfileId();
let dashboardURL: string;

describe("TransactionExportModal", () => {
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

	it("should render", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportModal isOpen wallet={profile.wallets().first()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render progress status", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportModal
					isOpen
					wallet={profile.wallets().first()}
					initialStatus={ExportProgressStatus.Progress}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render error status", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportModal
					isOpen
					wallet={profile.wallets().first()}
					initialStatus={ExportProgressStatus.Error}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render success status", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionExportModal
					isOpen
					wallet={profile.wallets().first()}
					initialStatus={ExportProgressStatus.Success}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
