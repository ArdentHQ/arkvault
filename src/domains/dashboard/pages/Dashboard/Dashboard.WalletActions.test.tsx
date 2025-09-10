import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

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
import * as ReactRouter from "react-router";

let profile: Contracts.IProfile;
let resetProfileNetworksMock: () => void;

const fixtureProfileId = getMainsailProfileId();
let dashboardURL: string;
let useSearchParamsMock;

describe("Dashboard", () => {
	beforeAll(async () => {
		useSearchParamsMock = vi
			.spyOn(ReactRouter, "useSearchParams")
			.mockReturnValue([new URLSearchParams(), vi.fn()]);

		profile = env.profiles().findById(fixtureProfileId);

		await env.profiles().restore(profile);
		await profile.sync();

		vi.spyOn(useRandomNumberHook, "useRandomNumber").mockImplementation(() => 1);
	});

	afterAll(() => {
		useRandomNumberHook.useRandomNumber.mockRestore();
		useSearchParamsMock.mockRestore();
	});

	beforeEach(() => {
		dashboardURL = `/profiles/${fixtureProfileId}/dashboard`;

		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("should show create address side panel", async () => {
		const onCreateAddress = vi.fn();
		render(<Dashboard onCreateAddress={onCreateAddress} />, {
			route: dashboardURL,
		});

		await userEvent.click(screen.getByText("Create"));

		expect(onCreateAddress).toBeCalledWith(true);
	});

	it("should show import wallet panel", async () => {
		const onImportAddress = vi.fn();
		render(<Dashboard onImportAddress={onImportAddress} />, {
			route: dashboardURL,
		});

		await userEvent.click(screen.getByText("Import"));

		expect(onImportAddress).toBeCalledWith(true);
	});
});
