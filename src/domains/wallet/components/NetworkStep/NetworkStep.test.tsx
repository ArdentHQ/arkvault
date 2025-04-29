/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@/app/lib/profiles";
import { renderHook } from "@testing-library/react";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";

import { NetworkStep } from "./NetworkStep";
import {
	env,
	render,
	screen,
	mockProfileWithOnlyPublicNetworks,
	mockProfileWithPublicAndTestNetworks,
	getMainsailProfileId,
} from "@/utils/testing-library";

let profile: Contracts.IProfile;

const fixtureProfileId = getMainsailProfileId();

describe("SelectNetworkStep", () => {
	beforeEach(() => {
		profile = env.profiles().findById(fixtureProfileId);

		for (const wallet of profile.wallets().values()) {
			profile.wallets().forget(wallet.id());
		}
	});

	it("should render", () => {
		const { result: form } = renderHook(() => useForm());
		render(
			<FormProvider {...form.current}>
				<NetworkStep profile={profile} title="title" subtitle="subtitle" />
			</FormProvider>,
		);

		expect(screen.getByTestId("NetworkStep")).toBeInTheDocument();
	});

	it("should render without test networks", async () => {
		const mockProfileWithOnlyPublicNetworksReset = mockProfileWithOnlyPublicNetworks(profile);

		const { result: form } = renderHook(() => useForm());
		render(
			<FormProvider {...form.current}>
				<NetworkStep profile={profile} title="title" subtitle="subtitle" />
			</FormProvider>,
		);

		expect(screen.getByTestId("NetworkStep")).toBeInTheDocument();

		mockProfileWithOnlyPublicNetworksReset();
	});

	it("should render with test networks", async () => {
		vi.restoreAllMocks();
		const mockProfileWithOnlyPublicNetworksReset = mockProfileWithPublicAndTestNetworks(profile);

		const { result: form } = renderHook(() => useForm());
		render(
			<FormProvider {...form.current}>
				<NetworkStep profile={profile} title="title" subtitle="subtitle" />
			</FormProvider>,
		);

		expect(screen.getByTestId("NetworkStep")).toBeInTheDocument();
		expect(screen.queryByTestId("SelectDropdown")).not.toBeInTheDocument();

		mockProfileWithOnlyPublicNetworksReset();
	});
});
