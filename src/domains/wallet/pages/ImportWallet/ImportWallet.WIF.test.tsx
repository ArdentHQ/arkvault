/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Route } from "react-router-dom";

import { MethodStep } from "./MethodStep";
import { EnvironmentProvider } from "@/app/contexts";
import { OptionsValue } from "@/domains/wallet/hooks/use-import-options";
import { assertNetwork } from "@/utils/assertions";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

let profile: Contracts.IProfile;
const fixtureProfileId = getDefaultProfileId();

const randomAddress = "D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyib";

const history = createHashHistory();

const methodStep = () => screen.getByTestId("ImportWallet__method-step");
const wifInput = () => screen.getByTestId("ImportWallet__wif-input");

const testNetwork = "ark.devnet";

describe("ImportWallet WIF", () => {
	let resetProfileNetworksMock: () => void;
	let form: ReturnType<typeof useForm>;
	const wif = "wif.1111";

	beforeEach(async () => {
		profile = env.profiles().findById(fixtureProfileId);

		await env.profiles().restore(profile);

		const walletId = profile.wallets().findByAddressWithNetwork(randomAddress, testNetwork)?.id();

		if (walletId) {
			profile.wallets().forget(walletId);
		}

		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	const Component = () => {
		const network = profile.availableNetworks().find((net) => net.coin() === "ARK" && net.id() === testNetwork);
		assertNetwork(network);

		network.importMethods = () => ({
			wif: {
				canBeEncrypted: true,
				default: true,
				permissions: ["read", "write"],
			},
		});

		form = useForm({
			defaultValues: { network, wif },
			shouldUnregister: false,
		});

		form.register("importOption");
		form.register("network");
		form.register("wif");
		form.register("value");

		return (
			<EnvironmentProvider env={env}>
				<FormProvider {...form}>
					<MethodStep profile={profile} />
				</FormProvider>
			</EnvironmentProvider>
		);
	};

	const testFormValues = async (form) => {
		await waitFor(() => {
			expect(form.getValues()).toMatchObject({
				importOption: {
					canBeEncrypted: true,
					label: "WIF",
					value: OptionsValue.WIF,
				},
				value: wif,
			});
		});
	};

	it("should import with valid wif", async () => {
		const coin = profile.coins().get("ARK", testNetwork);
		const coinMock = vi.spyOn(coin.address(), "fromWIF").mockResolvedValue({ address: "whatever", type: "bip39" });

		history.push(`/profiles/${profile.id()}`);

		const { container } = render(
			<Route path="/profiles/:profileId">
				<Component />
			</Route>,
			{ history, withProviders: false },
		);

		expect(methodStep()).toBeInTheDocument();

		await waitFor(() => expect(wifInput()));

		await userEvent.clear(wifInput());
		await userEvent.type(wifInput(), wif);

		await testFormValues(form);

		await waitFor(() => {
			expect(wifInput()).toHaveValue(wif);
		});

		// Trigger validation
		form.trigger("value");

		expect(container).toMatchSnapshot();

		coinMock.mockRestore();
	});

	it("should import with invalid wif", async () => {
		const coin = profile.coins().get("ARK", testNetwork);

		const coinMock = vi.spyOn(coin.address(), "fromWIF").mockRejectedValue(() => {
			throw new Error("Something went wrong");
		});

		history.push(`/profiles/${profile.id()}`);

		const { container } = render(
			<Route path="/profiles/:profileId">
				<Component />
			</Route>,
			{ history, withProviders: false },
		);

		expect(methodStep()).toBeInTheDocument();

		await waitFor(() => expect(wifInput()));

		await userEvent.clear(wifInput());
		await userEvent.type(wifInput(), wif);

		await testFormValues(form);

		await waitFor(() => {
			expect(wifInput()).toHaveValue(wif);
		});

		// Trigger validation
		form.trigger("value");

		expect(container).toMatchSnapshot();

		coinMock.mockRestore();
	});
});
