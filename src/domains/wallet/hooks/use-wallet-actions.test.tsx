import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";
import { createHashHistory } from "history";
import React from "react";
import { Router } from "react-router-dom";
import { env, getDefaultProfileId, act } from "@/utils/testing-library";
import { DropdownOption } from "@/app/components/Dropdown";
import { ConfigurationProvider, EnvironmentProvider } from "@/app/contexts";
import * as useActiveProfileModule from "@/app/hooks/env";
import { useWalletActions } from "@/domains/wallet/hooks/use-wallet-actions";

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
		expect(current.handleSelectOption({} as DropdownOption)).toBeUndefined();
	});

	it("should push right urls to history", () => {
		const {
			result: { current },
		} = renderHook(() => useWalletActions(wallet), { wrapper });

		act(() => {
			current.handleCreate();
		})

		expect(history.location.pathname).toBe(`/profiles/${profile.id()}/wallets/create`);

		act(() => {
			current.handleImport();
		})

		expect(history.location.pathname).toBe(`/profiles/${profile.id()}/wallets/import`);

		act(() => {
			current.handleImportLedger();
		})

		expect(history.location.pathname).toBe(`/profiles/${profile.id()}/wallets/import/ledger`);
	});
});
