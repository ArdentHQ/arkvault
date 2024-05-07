/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import userEvent from "@testing-library/user-event";
import { NetworkStep } from "./NetworkStep";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	mockProfileWithOnlyPublicNetworks,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";
let profile: Contracts.IProfile;

const fixtureProfileId = getDefaultProfileId();

describe("SelectNetworkStep", () => {
	beforeEach(() => {
		profile = env.profiles().findById(fixtureProfileId);

		for (const wallet of profile.wallets().values()) {
			profile.wallets().forget(wallet.id());
		}
	});

	it("should render", () => {
		const { result: form } = renderHook(() => useForm());
		const { asFragment } = render(
			<FormProvider {...form.current}>
				<NetworkStep profile={profile} title="title" subtitle="subtitle" />
			</FormProvider>,
		);

		expect(screen.getByTestId("NetworkStep")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should handle select", async () => {
		const mockProfileWithOnlyPublicNetworksReset = mockProfileWithPublicAndTestNetworks(profile);

		const { result: form } = renderHook(() => useForm());

		render(
			<FormProvider {...form.current}>
				<NetworkStep profile={profile} title="title" subtitle="subtitle" />
			</FormProvider>,
		);

		expect(screen.getByTestId("NetworkStep")).toBeInTheDocument();
		expect(screen.getByTestId("SelectDropdown")).toBeInTheDocument();

		const selectDropdown = screen.getByTestId("SelectDropdown__input");
		expect(selectDropdown).toBeInTheDocument();
		userEvent.type(selectDropdown, "ARK");
		userEvent.keyboard("{enter}");

		expect(screen.getByTestId("select-list__input")).toHaveValue("ark.mainnet");

		mockProfileWithOnlyPublicNetworksReset();
	});

	it("should render without test networks", async () => {
		const mockProfileWithOnlyPublicNetworksReset = mockProfileWithOnlyPublicNetworks(profile);

		const { result: form } = renderHook(() => useForm());
		const { asFragment } = render(
			<FormProvider {...form.current}>
				<NetworkStep profile={profile} title="title" subtitle="subtitle" />
			</FormProvider>,
		);

		expect(screen.getByTestId("NetworkStep")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		mockProfileWithOnlyPublicNetworksReset();
	});

	it("should render with test networks", async () => {
		const mockProfileWithOnlyPublicNetworksReset = mockProfileWithPublicAndTestNetworks(profile);

		const { result: form } = renderHook(() => useForm());
		const { asFragment } = render(
			<FormProvider {...form.current}>
				<NetworkStep profile={profile} title="title" subtitle="subtitle" />
			</FormProvider>,
		);

		expect(screen.getByTestId("NetworkStep")).toBeInTheDocument();
		expect(screen.getByTestId("SelectDropdown")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		mockProfileWithOnlyPublicNetworksReset();
	});
});
