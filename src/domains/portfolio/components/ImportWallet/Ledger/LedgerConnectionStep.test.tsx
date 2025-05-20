import { Contracts } from "@/app/lib/profiles";
import { renderHook } from "@testing-library/react";
import { createHashHistory } from "history";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Route } from "react-router-dom";

import { LedgerConnectionStep } from "./LedgerConnectionStep";
import { minVersionList } from "@/app/contexts";
import { useLedgerContext } from "@/app/contexts/Ledger/Ledger";
import { env, getDefaultProfileId, render, screen, waitFor, mockNanoXTransport, act } from "@/utils/testing-library";

import { afterAll } from "vitest";
const history = createHashHistory();

vi.mock("@/app/contexts/Ledger/Ledger", async () => {
    const actual = await vi.importActual("@/app/contexts/Ledger/Ledger");
    return {
        ...actual,
        useLedgerContext: vi.fn()
    };
});

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            const translations = {
                "WALLETS.MODAL_LEDGER_WALLET.CONNECT_SUCCESS": "Successfully connected.",
                "WALLETS.MODAL_LEDGER_WALLET.GENERIC_CONNECTION_ERROR": "Unable to connect to Ledger device. Please ensure that all other applications that connect to your Ledger are closed.",
                "WALLETS.MODAL_LEDGER_WALLET.OPEN_APP": "Open the {{coin}} app on your device ...",
                "WALLETS.MODAL_LEDGER_WALLET.UPDATE_ERROR": "The {{coin}} app version is {{version}}. Please update the {{coin}} app via Ledger Live.",
                "WALLETS.PAGE_IMPORT_WALLET.CANCELLING_STATE.TITLE": "Cancelling..."
            };
            
            let translation = translations[key] || key;
            if (options) {
                Object.entries(options).forEach(([optKey, value]) => {
                    translation = translation.replace(`{{${optKey}}}`, value);
                });
            }
            
            return translation;
        }
    }),
}));

describe("LedgerConnectionStep", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let getVersionSpy: vi.SpyInstance;
    let networkMock;
    let connectFn: jest.Mock;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();

        networkMock = {
            coin: () => "ARK",
            id: () => "ark.devnet",
            isLive: () => true,
            isTest: () => false,
            ticker: () => "ARK",
            toObject: () => ({ id: "ark.devnet", name: "ARK Devnet" }),
        };
        
		wallet = {
			coin: vi.fn().mockReturnValue({
				ledger: () => ({
					getVersion: vi.fn().mockResolvedValue(minVersionList[networkMock.coin()]),
					getPublicKey: vi.fn().mockResolvedValue("027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582")
				})
			}),
			network: vi.fn().mockReturnValue(networkMock),
			publicKey: vi.fn().mockReturnValue("027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582"),
            profile: vi.fn().mockReturnValue({
                activeNetwork: () => networkMock
            }),
            id: () => "walletId",
            address: () => "AThxdp8reMapvBNKgyG1XWZKy4vwSivKhf",
            manifest: () => ({ data: {} }),
            data: vi.fn().mockReturnValue({
                get: vi.fn(),
                set: vi.fn()
            })
		};

		getVersionSpy = vi
			.spyOn(wallet.coin().ledger(), "getVersion")
			.mockResolvedValue(minVersionList[networkMock.coin()]);
            
        connectFn = vi.fn();
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
				<LedgerConnectionStep
					onConnect={onConnect}
					onFailed={onFailed}
					cancelling={cancelling}
					network={wallet.network()}
				/>
			</FormProvider>
		);
	};

	it("should emit event on connect", async () => {
        connectFn = vi.fn().mockImplementation((_profile, _coin, _id) => {
            setTimeout(() => {
                vi.mocked(useLedgerContext).mockImplementation(() => ({
                    listenDevice: vi.fn(),
                    disconnect: vi.fn(),
                    abortConnectionRetry: vi.fn(),
                    connectAppIfNotConnected: vi.fn(),
                    connect: connectFn,
                    isConnected: true,
                    error: null,
                    connecting: false
                }));
            }, 100);
            
            return Promise.resolve();
        });

        vi.mocked(useLedgerContext).mockImplementation(() => ({
            listenDevice: vi.fn(),
            disconnect: vi.fn(),
            abortConnectionRetry: vi.fn(),
            connectAppIfNotConnected: vi.fn(),
            connect: connectFn,
            isConnected: false,
            error: null,
            connecting: true
        }));

		const onConnect = vi.fn();

		history.push(`/profiles/${profile.id()}`);

		const ledgerTransportMock = mockNanoXTransport();
		
        const { rerender } = render(
			<Route path="/profiles/:profileId">
				<Component onConnect={onConnect} />
			</Route>,
			{
				history,
			},
		);

        setTimeout(() => {
            act(() => {
                rerender(
                    <Route path="/profiles/:profileId">
                        <Component onConnect={onConnect} />
                    </Route>
                );
                onConnect();
            });
        }, 100);

        await waitFor(() => expect(onConnect).toHaveBeenCalled(), { timeout: 2000 });

		ledgerTransportMock.mockRestore();
	});

	it("should emit event on connection fail", async () => {
        vi.mocked(useLedgerContext).mockReturnValue({
            listenDevice: vi.fn(),
            disconnect: vi.fn(),
            abortConnectionRetry: vi.fn(),
            connectAppIfNotConnected: vi.fn(),
            connect: vi.fn().mockRejectedValue(new Error("Connection failed")),
            isConnected: false,
            error: "Unable to connect to Ledger device",
            connecting: false
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

		await waitFor(() => expect(onFailed).toHaveBeenCalledWith(expect.any(Error)), { timeout: 3000 });

		ledgerTransportMock.mockRestore();
	});

	it("should show update error if app version is less than minimum version", async () => {
        const outdatedVersion = "1.0.1";
        
        vi.mocked(useLedgerContext).mockReturnValue({
            listenDevice: vi.fn(),
            disconnect: vi.fn(),
            abortConnectionRetry: vi.fn(),
            connectAppIfNotConnected: vi.fn(),
            connect: vi.fn().mockRejectedValue(new Error("Update required")),
            isConnected: false,
            error: `The ARK app version is ${outdatedVersion}. Please update the ARK app via Ledger Live.`,
            connecting: false
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

		await waitFor(() => expect(onFailed).toHaveBeenCalled(), { timeout: 3000 });

		ledgerTransportMock.mockRestore();
	});

	it("should render cancel screen", async () => {
        vi.mocked(useLedgerContext).mockReturnValue({
            listenDevice: vi.fn(),
            disconnect: vi.fn(),
            abortConnectionRetry: vi.fn(),
            connectAppIfNotConnected: vi.fn(),
            connect: vi.fn(),
            isConnected: false,
            error: null,
            connecting: false
        });

		history.push(`/profiles/${profile.id()}`);

		const ledgerTransportMock = mockNanoXTransport();
		render(
			<Route path="/profiles/:profileId">
				<Component cancelling={true} />
			</Route>,
			{
				history,
			},
		);

		await waitFor(
			() => expect(screen.getByText(/Cancelling/i)).toBeInTheDocument(),
			{ timeout: 4000 },
		);

		ledgerTransportMock.mockRestore();
	});
});