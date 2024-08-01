/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";

import { NetworkStep } from "./NetworkStep";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	mockProfileWithOnlyPublicNetworks,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";
import * as useThemeHook from "@/app/hooks/use-theme";

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

	it.each([
		[true, "SelectNetworkDark"],
		[false, "SelectNetworkLight"],
	])("should render right header icon when dark mode is %s", async (isDarkMode, testId) => {
		const useThemeMock = vi.spyOn(useThemeHook, "useTheme").mockReturnValue({ isDarkMode } as never);

		const { result: form } = renderHook(() => useForm());

		render(
			<FormProvider {...form.current}>
				<NetworkStep profile={profile} title="title" subtitle="subtitle" />
			</FormProvider>,
		);

		expect(screen.getByTestId(`icon-${testId}`)).toBeInTheDocument();

		useThemeMock.mockRestore();
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
