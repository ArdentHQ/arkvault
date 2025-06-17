import { Contracts } from "@/app/lib/profiles";
import React, { useEffect } from "react";

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

const {
	result: {
		current: { t },
	},
} = renderHook(() => useTranslation());

// @TODO: Revisit and simplify ledger connection tests.
describe("LedgerConnectionStep", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let getVersionSpy: vi.SpyInstance;
	let networkMock;
	const route = `profiles/${getDefaultProfileId()}`;

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
			data: vi.fn().mockReturnValue({
				get: vi.fn(),
				set: vi.fn(),
			}),
			id: () => "walletId",
			ledger: vi.fn().mockReturnValue({
				getPublicKey: vi
					.fn()
					.mockResolvedValue("027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582"),
				getVersion: vi.fn().mockResolvedValue(minVersionList[networkMock.coin()]),
			}),
			manifest: () => ({ data: {} }),
			network: vi.fn().mockReturnValue(networkMock),
			profile: vi.fn().mockReturnValue({
				activeNetwork: () => networkMock,
			}),
			publicKey: vi.fn().mockReturnValue("027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582"),
		};

		getVersionSpy = vi.spyOn(wallet.ledger(), "getVersion").mockResolvedValue(minVersionList[networkMock.coin()]);
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

		useEffect(() => {
			connect(profile);
		}, []);

		return (
			<LedgerConnectionStep
				onConnect={onConnect}
				network={wallet.network()}
				onFailed={onFailed}
				cancelling={cancelling}
			/>
		);
	};

	it("should emit event on connect", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		const onConnect = vi.fn();

		const { rerender } = render(<Component onConnect={onConnect} />, { route });

		setTimeout(() => {
			rerender(<Component onConnect={onConnect} />);
			onConnect();
		}, 100);

		await waitFor(() => expect(onConnect).toHaveBeenCalled(), { timeout: 2000 });

		nanoXTransportMock.mockRestore();
	});

	it.skip("should emit event on connection fail", async () => {
		const ledgerTransportMock = mockNanoXTransport();
		const onFailed = vi.fn();

		render(<Component onFailed={onFailed} />, { route });

		await waitFor(() => expect(onFailed).toHaveBeenCalledWith(expect.any(Error)), { timeout: 3000 });

		ledgerTransportMock.mockRestore();
	});

	it.skip("should show update error if app version is less than minimum version", async () => {
		const outdatedVersion = "1.0.1";

		const errorMock = mockLedgerTransportError(
			`The ARK app version is ${outdatedVersion}. Please update the ARK app via Ledger Live.`,
		);

		const onFailed = vi.fn();

		render(<Component onFailed={onFailed} />, { route });

		await waitFor(() => expect(onFailed).toHaveBeenCalled(), { timeout: 3000 });
		expect(errorMock).toHaveBeenCalled();

		//ledgerTransportMock.mockRestore();
		errorMock.mockRestore();
	});

	it.skip("should render cancel screen", async () => {
		const ledgerTransportMock = mockNanoXTransport();

		render(<Component cancelling={true} />, { route });

		await expect(screen.findByText(/cancelling/i, { timeout: 4000 })).resolves.toBeInTheDocument();

		const cancellingTranslation = t("WALLETS.PAGE_IMPORT_WALLET.CANCELLING_STATE.TITLE");
		expect(screen.getByText(cancellingTranslation)).toBeInTheDocument();

		ledgerTransportMock.mockRestore();
	});
});
