import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import { createHashHistory } from "history";
import React from "react";
import { generatePath } from "react-router";
import { Router } from "react-router-dom";
import { env, getDefaultProfileId, waitFor } from "@/utils/testing-library";
import { DropdownOption } from "@/app/components/Dropdown";
import { ConfigurationProvider, EnvironmentProvider } from "@/app/contexts";
import * as useActiveProfileModule from "@/app/hooks/env";
import { useWalletActions } from "@/domains/wallet/hooks/use-wallet-actions";
import { ProfilePaths } from "@/router/paths";
describe("useWalletActions", () => {
	const history = createHashHistory();

	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	const wrapper = ({ children }) => (
		<Router history={history}>
			<EnvironmentProvider env={env}>
				<ConfigurationProvider>{children}</ConfigurationProvider>
			</EnvironmentProvider>
		</Router>
	);

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		vi.spyOn(useActiveProfileModule, "useActiveProfile").mockReturnValue(profile);
	});

	it("should return undefined if there is no wallet", async () => {
		const {
			result: { current },
		} = renderHook(() => useWalletActions(), { wrapper });

		expect(current.handleOpen()).toBeUndefined();
		expect(current.handleSend()).toBeUndefined();
		await expect(current.handleToggleStar()).resolves.toBeUndefined();
		await expect(current.handleDelete()).resolves.toBeUndefined();
		expect(current.handleConfirmEncryptionWarning()).toBeUndefined();
		expect(current.handleSelectOption({} as DropdownOption)).toBeUndefined();
	});

	it("should push right urls to history", () => {
		const {
			result: { current },
		} = renderHook(() => useWalletActions(wallet), { wrapper });

		current.handleCreate();

		expect(history.location.pathname).toBe(`/profiles/${profile.id()}/wallets/create`);

		current.handleOpen();

		expect(history.location.pathname).toBe(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

		current.handleSend();

		expect(history.location.pathname).toBe(`/profiles/${profile.id()}/wallets/${wallet.id()}/send-transfer`);

		current.handleImport();

		expect(history.location.pathname).toBe(`/profiles/${profile.id()}/wallets/import`);

		current.handleImportLedger();

		expect(history.location.pathname).toBe(`/profiles/${profile.id()}/wallets/import/ledger`);

		current.handleConfirmEncryptionWarning();

		expect(history.location.pathname).toBe(
			`/profiles/${profile.id()}/wallets/${wallet.id()}/send-registration/secondSignature`,
		);
	});

	it("should return true on delete if location is not wallet details", () => {
		const {
			result: { current },
		} = renderHook(() => useWalletActions(wallet), { wrapper });

		expect(current.handleDelete()).resolves.toBeTrue();
	});

	it("should return true on delete if location is not wallet details", async () => {
		const historyPushSpy = vi.spyOn(history, "push");

		const {
			result: { current },
		} = renderHook(() => useWalletActions(wallet), { wrapper });

		history.push(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

		current.handleDelete();

		await waitFor(() => {
			expect(historyPushSpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/dashboard`);
		});

		historyPushSpy.mockRestore();
	});

	it("should toggle star", () => {
		const toggleSpy = vi.spyOn(wallet, "toggleStarred");
		const {
			result: { current },
		} = renderHook(() => useWalletActions(wallet), { wrapper });

		expect(current.handleToggleStar());

		expect(toggleSpy).toHaveBeenCalled();
		toggleSpy.mockRestore();
	});

	it.each([
		["sign-message", ProfilePaths.SignMessageWallet],
		["verify-message", ProfilePaths.VerifyMessageWallet],
		["multi-signature", ProfilePaths.SendMultiSignature],
		["second-signature", ProfilePaths.SendSecondSignature],
		["delegate-registration", ProfilePaths.SendDelegateRegistration],
		["delegate-resignation", ProfilePaths.SendDelegateResignation],
		["username-registration", ProfilePaths.SendUsernameRegistration],
		["username-resignation", ProfilePaths.SendUsernameResignation],
		["store-hash", ProfilePaths.SendIpfs],
	])("should open url for selected option %s", async (value, url) => {
		const historyPushSpy = vi.spyOn(history, "push");

		const {
			result: { current },
		} = renderHook(() => useWalletActions(wallet), { wrapper });

		current.handleSelectOption({
			value,
		});

		await waitFor(() => {
			expect(historyPushSpy).toHaveBeenCalledWith(
				generatePath(url, { profileId: profile.id(), walletId: wallet.id() }),
			);
		});

		historyPushSpy.mockRestore();
	});

	it("should open explorer", async () => {
		const explorerLinkSpy = vi.spyOn(wallet, "explorerLink");

		const {
			result: { current },
		} = renderHook(() => useWalletActions(wallet), { wrapper });

		current.handleSelectOption({
			value: "open-explorer",
		});

		await waitFor(() => {
			expect(explorerLinkSpy).toHaveBeenCalled();
		});

		explorerLinkSpy.mockRestore();
	});
});
