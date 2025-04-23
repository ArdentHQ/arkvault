/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@/app/lib/profiles";
import { renderHook, act } from "@testing-library/react";

import { useWalletSync } from "./use-wallet-sync";
import { env, getMainsailProfileId } from "@/utils/testing-library";

let profile: Contracts.IProfile;

describe("useWalletSync", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
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
});
