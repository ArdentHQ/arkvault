/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@payvo/sdk-profiles";
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

		jest.spyOn(network, "allowsVoting").mockReturnValueOnce(false);
		jest.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValueOnce(true);

		await act(async () => {
			await expect(current.syncAll(wallet)).resolves.toBeTruthy();
		});
	});
});
