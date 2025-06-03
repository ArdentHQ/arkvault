/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { Dashboard } from "./Dashboard";
import * as useRandomNumberHook from "@/app/hooks/use-random-number";
import {
	env,
	render,
	screen,
	mockProfileWithPublicAndTestNetworks,
	getMainsailProfileId,
} from "@/utils/testing-library";
import { expect } from "vitest";

const history = createHashHistory();
let profile: Contracts.IProfile;
let resetProfileNetworksMock: () => void;

const fixtureProfileId = getMainsailProfileId();
let dashboardURL: string;

describe("Dashboard", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(fixtureProfileId);

		await env.profiles().restore(profile);
		await profile.sync();

		vi.spyOn(useRandomNumberHook, "useRandomNumber").mockImplementation(() => 1);
	});

	afterAll(() => {
		useRandomNumberHook.useRandomNumber.mockRestore();
	});

	beforeEach(() => {
		dashboardURL = `/profiles/${fixtureProfileId}/dashboard`;
		navigate(dashboardURL);

		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("should show create address side panel", async () => {
		const onCreateAddress = vi.fn();
		render(
			<Route path="/profiles/:profileId/dashboard">
				<Dashboard onCreateAddress={onCreateAddress} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await userEvent.click(screen.getByText("Create"));

		expect(onCreateAddress).toBeCalledWith(true);
	});

	it("should show import wallet panel", async () => {
		const onImportAddress = vi.fn();
		render(
			<Route path="/profiles/:profileId/dashboard">
				<Dashboard onImportAddress={onImportAddress} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await userEvent.click(screen.getByText("Import"));

		expect(onImportAddress).toBeCalledWith(true);
	});
});
