/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import { act, renderHook } from "@testing-library/react-hooks";

import { useWalletSync } from "./use-wallet-sync";
import { env } from "@/utils/testing-library";

let profile: Contracts.IProfile;

describe("useWalletSync", () => {
	beforeAll(async () => {
		profile = env.profiles().first();
		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("#syncAll", async () => {
		const {
			result: { current },
		} = renderHook(() => useWalletSync({ env, profile }));

		const wallet = profile.wallets().first();
		const network = wallet.network();

		vi.spyOn(network, "allowsVoting").mockReturnValueOnce(false);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValueOnce(true);

		await act(async () => {
			await expect(current.syncAll(wallet)).resolves.toBeTruthy();
		});
	});

	it("sync votes if allows voting and has synced with network", async () => {
		const {
			result: { current },
		} = renderHook(() => useWalletSync({ env, profile }));

		const wallet = profile.wallets().first();
		const network = wallet.network();

		const delegatesAllSpy = vi.spyOn(env.delegates(), "all");
		const synchroniserSpy = vi.spyOn(wallet.synchroniser(), "votes");

		vi.spyOn(network, "allowsVoting").mockReturnValueOnce(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValueOnce(true);

		await act(async () => {
			await expect(current.syncAll(wallet)).resolves.toBeTruthy();
		});

		expect(delegatesAllSpy).toHaveBeenCalled();
		expect(synchroniserSpy).toHaveBeenCalled();

		delegatesAllSpy.mockRestore();
		synchroniserSpy.mockRestore();
	});

	it("sync votes if allows voting and hasnt synced with network", async () => {
		const {
			result: { current },
		} = renderHook(() => useWalletSync({ env, profile }));

		const wallet = profile.wallets().first();
		const network = wallet.network();

		const delegatesAllSpy = vi.spyOn(env.delegates(), "all");
		const synchroniserSpy = vi.spyOn(wallet.synchroniser(), "votes");

		vi.spyOn(network, "allowsVoting").mockReturnValueOnce(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValueOnce(false);

		await act(async () => {
			await expect(current.syncAll(wallet)).resolves.toBeTruthy();
		});

		expect(delegatesAllSpy).toHaveBeenCalled();
		expect(synchroniserSpy).not.toHaveBeenCalled();

		delegatesAllSpy.mockRestore();
		synchroniserSpy.mockRestore();
	});

	it("sync delegates for the first time", async () => {
		const {
			result: { current },
		} = renderHook(() => useWalletSync({ env, profile }));

		const wallet = profile.wallets().first();
		const network = wallet.network();

		const delegatesAllSpy = vi.spyOn(env.delegates(), "all").mockImplementationOnce(() => {
			throw new Error("Error");
		});
		const delegatesSyncSpy = vi.spyOn(env.delegates(), "sync");

		vi.spyOn(network, "allowsVoting").mockReturnValueOnce(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValueOnce(false);

		await act(async () => {
			await expect(current.syncAll(wallet)).resolves.toBeTruthy();
		});

		expect(delegatesSyncSpy).toHaveBeenCalled();

		delegatesAllSpy.mockRestore();
		delegatesSyncSpy.mockRestore();
	});
});
