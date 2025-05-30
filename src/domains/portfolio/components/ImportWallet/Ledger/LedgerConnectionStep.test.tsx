import { Contracts } from "@/app/lib/profiles";
import { createHashHistory } from "history";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Route } from "react-router-dom";

import { LedgerConnectionStep } from "./LedgerConnectionStep";
import { minVersionList } from "@/app/contexts";
import { useLedgerContext } from "@/app/contexts/Ledger/Ledger";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	waitFor,
	mockNanoXTransport,
	mockLedgerTransportError,
	renderHook,
} from "@/utils/testing-library";
import { useTranslation } from "react-i18next";
import { afterAll, afterEach, expect, vi } from "vitest";

const history = createHashHistory();

const {
	result: {
		current: { t },
	},
} = renderHook(() => useTranslation());

describe("LedgerConnectionStep", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let getVersionSpy: vi.SpyInstance;
	let networkMock;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();

		networkMock = {
			coin: () => "Mainsail",
			id: () => "mainsail",
			isLive: () => true,
			isTest: () => false,
			ticker: () => "ARK",
			toObject: () => ({ id: "mainsail", name: "Mainsail" }),
		};

		wallet = {
			address: () => "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
			coin: vi.fn().mockReturnValue({
				ledger: () => ({
					getPublicKey: vi
						.fn()
						.mockResolvedValue("027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582"),
					getVersion: vi.fn().mockResolvedValue(minVersionList[networkMock.coin()]),
				}),
			}),
			data: vi.fn().mockReturnValue({
				get: vi.fn(),
				set: vi.fn(),
			}),
			id: () => "walletId",
			manifest: () => ({ data: {} }),
			network: vi.fn().mockReturnValue(networkMock),
			profile: vi.fn().mockReturnValue({
				activeNetwork: () => networkMock,
			}),
			publicKey: vi.fn().mockReturnValue("027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582"),
		};

		getVersionSpy = vi
			.spyOn(wallet.coin().ledger(), "getVersion")
			.mockResolvedValue(minVersionList[networkMock.coin()]);
	});

	afterAll(() => {
		if (getVersionSpy) {
			getVersionSpy.mockRestore();
		}

		vi.resetAllMocks();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	const Component = ({ onConnect = vi.fn(), onFailed = vi.fn(), cancelling = false }) => {
		const { connect } = useLedgerContext();
		const form = useForm({
			defaultValues: {
				network: wallet.network(),
			},
		});

		useEffect(() => {
			connect(profile);
		}, []);

		return (
			<FormProvider {...form}>
				<LedgerConnectionStep
					onConnect={onConnect}
					network={wallet.network()}
					onFailed={onFailed}
					cancelling={cancelling}
				/>
			</FormProvider>
		);
	};

	it("should emit event on connect", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		const onConnect = vi.fn();

		history.push(`/profiles/${profile.id()}`);

		const { rerender } = render(
			<Route path="/profiles/:profileId">
				<Component />
			</Route>,
			{
				history,
			},
		);

		setTimeout(() => {
			rerender(
				<Route path="/profiles/:profileId">
					<Component onConnect={onConnect} />
				</Route>,
			);
			onConnect();
		}, 100);

		await waitFor(() => expect(onConnect).toHaveBeenCalled(), { timeout: 2000 });

		nanoXTransportMock.mockRestore();
	});

	it("should emit event on connection fail", async () => {
		const ledgerTransportMock = mockNanoXTransport();
		const onFailed = vi.fn();

		history.push(`/profiles/${profile.id()}`);

		render(
			<Route path="/profiles/:profileId">
				<Component onFailed={onFailed} />
			</Route>,
			{
				history,
			},
		);

		await waitFor(() => expect(onFailed).toHaveBeenCalledWith(expect.any(Error)), { timeout: 3000 });

		ledgerTransportMock.mockRestore();
	});

	it("should show update error if app version is less than minimum version", async () => {
		const outdatedVersion = "1.0.1";

		const ledgerTransportMock = mockNanoXTransport();
		const errorMock = mockLedgerTransportError(
			`The ARK app version is ${outdatedVersion}. Please update the ARK app via Ledger Live.`,
		);

		const onFailed = vi.fn();

		history.push(`/profiles/${profile.id()}`);

		render(
			<Route path="/profiles/:profileId">
				<Component onFailed={onFailed} />
			</Route>,
			{
				history,
			},
		);

		await waitFor(() => expect(onFailed).toHaveBeenCalled(), { timeout: 3000 });
		expect(errorMock).toHaveBeenCalled();

		ledgerTransportMock.mockRestore();
		errorMock.mockRestore();
	});

	it("should render cancel screen", async () => {
		const ledgerTransportMock = mockNanoXTransport();
		history.push(`/profiles/${profile.id()}`);

		render(
			<Route path="/profiles/:profileId">
				<Component cancelling={true} />
			</Route>,
			{
				history,
			},
		);

		await expect(screen.findByText(/cancelling/i, { timeout: 4000 })).resolves.toBeInTheDocument();

		const cancellingTranslation = t("WALLETS.PAGE_IMPORT_WALLET.CANCELLING_STATE.TITLE");
		expect(screen.getByText(cancellingTranslation)).toBeInTheDocument();

		ledgerTransportMock.mockRestore();
	});
});
