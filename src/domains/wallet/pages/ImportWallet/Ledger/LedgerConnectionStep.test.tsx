import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";
import { createHashHistory } from "history";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Route } from "react-router-dom";

import { LedgerConnectionStep } from "./LedgerConnectionStep";
import { minVersionList } from "@/app/contexts";
import { useLedgerContext } from "@/app/contexts/Ledger/Ledger";
import { env, getDefaultProfileId, render, screen, waitFor, mockNanoXTransport } from "@/utils/testing-library";

const history = createHashHistory();

describe("LedgerConnectionStep", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let getVersionSpy: vi.SpyInstance;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();
		getVersionSpy = vi
			.spyOn(wallet.coin().ledger(), "getVersion")
			.mockResolvedValue(minVersionList[wallet.network().coin()]);
	});

	afterAll(() => {
		getVersionSpy.mockRestore();
	});

	const Component = ({ onConnect = vi.fn(), onFailed = vi.fn(), cancelling = false }) => {
		const { listenDevice } = useLedgerContext();

		const form = useForm({
			defaultValues: {
				network: wallet.network(),
			},
		});

		useEffect(() => {
			listenDevice();
		}, []);

		return (
			<FormProvider {...form}>
				<LedgerConnectionStep onConnect={onConnect} onFailed={onFailed} cancelling={cancelling} />
			</FormProvider>
		);
	};

	it("should emit event on connect", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const publicKeyPaths = new Map([
			["m/44'/111'/0'/0/0", "027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582"],
			["m/44'/111'/1'/0/0", wallet.publicKey()!],
			["m/44'/111'/2'/0/0", "020aac4ec02d47d306b394b79d3351c56c1253cd67fe2c1a38ceba59b896d584d1"],
		]);

		const getPublicKeySpy = vi
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockResolvedValue(publicKeyPaths.values().next().value);

		const onConnect = vi.fn();

		history.push(`/profiles/${profile.id()}`);

		const ledgerTransportMock = mockNanoXTransport();
		const { container } = render(
			<Route path="/profiles/:profileId">
				<Component onConnect={onConnect} />
			</Route>,
			{
				history,
			},
		);

		await expect(screen.findByText(t("WALLETS.MODAL_LEDGER_WALLET.CONNECT_SUCCESS"))).resolves.toBeVisible();

		await waitFor(() => expect(onConnect).toHaveBeenCalledWith());

		expect(container).toMatchSnapshot();

		getPublicKeySpy.mockRestore();
		ledgerTransportMock.mockRestore();
	});

	it("should emit event on connection fail", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const getPublicKeySpy = vi.spyOn(wallet.coin().ledger(), "getPublicKey").mockImplementation(() => {
			throw new Error(t("WALLETS.MODAL_LEDGER_WALLET.GENERIC_CONNECTION_ERROR"));
		});

		const onFailed = vi.fn();

		history.push(`/profiles/${profile.id()}`);

		const ledgerTransportMock = mockNanoXTransport();
		render(
			<Route path="/profiles/:profileId">
				<Component onFailed={onFailed} />
			</Route>,
			{
				history,
			},
		);

		await waitFor(
			() =>
				expect(
					screen.findByText(t("WALLETS.MODAL_LEDGER_WALLET.GENERIC_CONNECTION_ERROR")),
				).resolves.toBeVisible(),
			{ timeout: 3000 },
		);

		await waitFor(() => expect(onFailed).toHaveBeenCalledWith(expect.any(Error)));

		getPublicKeySpy.mockRestore();
		ledgerTransportMock.mockRestore();
	});

	it("should show update error if app version is less than minimum version", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const publicKeyPaths = new Map([
			["m/44'/111'/0'/0/0", "027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582"],
			["m/44'/111'/1'/0/0", wallet.publicKey()!],
			["m/44'/111'/2'/0/0", "020aac4ec02d47d306b394b79d3351c56c1253cd67fe2c1a38ceba59b896d584d1"],
		]);

		const getPublicKeySpy = vi
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockResolvedValue(publicKeyPaths.values().next().value);

		const outdatedVersion = "1.0.1";
		const getVersionSpy = vi.spyOn(wallet.coin().ledger(), "getVersion").mockResolvedValue(outdatedVersion);

		const onFailed = vi.fn();

		history.push(`/profiles/${profile.id()}`);

		const ledgerTransportMock = mockNanoXTransport();
		render(
			<Route path="/profiles/:profileId">
				<Component onFailed={onFailed} />
			</Route>,
			{
				history,
			},
		);

		expect(
			screen.getByText(
				t("WALLETS.MODAL_LEDGER_WALLET.OPEN_APP", {
					coin: wallet.network().coin(),
				}),
			),
		).toBeInTheDocument();

		await waitFor(
			() =>
				expect(
					screen.findByText(
						t("WALLETS.MODAL_LEDGER_WALLET.UPDATE_ERROR", {
							coin: wallet.network().coin(),
							version: outdatedVersion,
						}),
					),
				).resolves.toBeVisible(),
			{ timeout: 3000 },
		);

		await waitFor(() => expect(onFailed).toHaveBeenCalledWith(expect.any(Error)));

		getPublicKeySpy.mockRestore();
		getVersionSpy.mockRestore();
		ledgerTransportMock.mockRestore();
	});

	it("should render cancel screen", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		history.push(`/profiles/${profile.id()}`);

		const ledgerTransportMock = mockNanoXTransport();
		const { container } = render(
			<Route path="/profiles/:profileId">
				<Component cancelling />
			</Route>,
			{
				history,
			},
		);

		await waitFor(
			() =>
				expect(
					screen.findByText(t("WALLETS.PAGE_IMPORT_WALLET.CANCELLING_STATE.TITLE")),
				).resolves.toBeVisible(),
			{ timeout: 4000 },
		);

		expect(container).toMatchSnapshot();

		ledgerTransportMock.mockRestore();
	});
});
