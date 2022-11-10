import { Contracts } from "@ardenthq/sdk-profiles";
import { createMemoryHistory } from "history";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Route } from "react-router-dom";
import { ListenLedger } from "./ListenLedger";
import { EnvironmentProvider } from "@/app/contexts";
import { LedgerProvider } from "@/app/contexts/Ledger/Ledger";
import {
	env,
	mockNanoSTransport,
	mockLedgerTransportError,
	getDefaultProfileId,
	render,
	waitFor,
} from "@/utils/testing-library";

const history = createMemoryHistory();

describe("ListenLedger", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();
	});

	const Component = ({
		onDeviceNotAvailable = vi.fn(),
		onDeviceAvailable = vi.fn(),
		transport = mockNanoSTransport(),
	}) => {
		const form = useForm({
			defaultValues: {
				network: wallet.network(),
			},
		});

		return (
			<EnvironmentProvider env={env}>
				<FormProvider {...form}>
					<LedgerProvider transport={transport}>
						<ListenLedger
							onDeviceNotAvailable={onDeviceNotAvailable}
							onDeviceAvailable={onDeviceAvailable}
						/>
					</LedgerProvider>
				</FormProvider>
			</EnvironmentProvider>
		);
	};

	it("should emit event on device available", async () => {
		const onDeviceAvailable = vi.fn();

		history.push(`/profiles/${profile.id()}/wallets/import/ledger`);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/import/ledger">
				<Component onDeviceAvailable={onDeviceAvailable} />
			</Route>,
			{ history, withProviders: false },
		);

		await waitFor(() => expect(onDeviceAvailable).toHaveBeenCalledWith());

		expect(container).toMatchSnapshot();
	});

	it("should emit event on device not available", async () => {
		const onDeviceNotAvailable = vi.fn();

		history.push(`/profiles/${profile.id()}/wallets/import/ledger`);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/import/ledger">
				<Component
					onDeviceNotAvailable={onDeviceNotAvailable}
					transport={mockLedgerTransportError("Access denied to use Ledger device")}
				/>
			</Route>,
			{ history, withProviders: false },
		);

		await waitFor(() => expect(onDeviceNotAvailable).toHaveBeenCalledWith());

		expect(container).toMatchSnapshot();
	});
});
