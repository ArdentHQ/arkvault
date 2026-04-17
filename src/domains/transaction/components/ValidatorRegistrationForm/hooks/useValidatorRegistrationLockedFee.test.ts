import { Contracts } from "@/app/lib/profiles";

import { useValidatorRegistrationLockedFee } from "./useValidatorRegistrationLockedFee";
import { env, getDefaultProfileId, renderHook as testRenderHook } from "@/utils/testing-library";

let profile: Contracts.IProfile;

describe("useValidatorRegistrationLockedFee", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should return fee values for wallet", () => {
		const wallet = profile.wallets().first();

		const { result } = testRenderHook(() => useValidatorRegistrationLockedFee({ wallet, profile }), {
			wrapper: ({ children }) => children,
		});

		expect(result.current.validatorRegistrationFeeTicker).toBe(wallet.currency());
		expect(result.current.validatorRegistrationFeeAsFiatTicker).toBeDefined();
	});

	it("should return null fiat for testnet wallet", () => {
		const mockWallet = {
			network: () => ({
				isTest: () => true,
			}),
			currency: () => "TEST",
		};

		const { result } = testRenderHook(() => useValidatorRegistrationLockedFee({ wallet: mockWallet, profile }), {
			wrapper: ({ children }) => children,
		});

		expect(result.current.validatorRegistrationFeeAsFiat).toBeNull();
		expect(result.current.validatorRegistrationFeeTicker).toBe("TEST");
	});

	it("should return default ticker when wallet is undefined", () => {
		const { result } = testRenderHook(() => useValidatorRegistrationLockedFee({ wallet: undefined, profile }), {
			wrapper: ({ children }) => children,
		});

		expect(result.current.validatorRegistrationFeeTicker).toBe("ARK");
	});

	it("should return zero fee when network is not synced", () => {
		const mockWallet = {
			network: () => ({
				isTest: () => false,
			}),
			currency: () => "ARK",
		};

		const mockProfile = {
			...profile,
			activeNetwork: () => ({
				isSynced: () => false,
				milestone: () => ({}),
			}),
			settings: () => ({
				get: () => "USD",
			}),
		};

		const { result } = testRenderHook(
			() => useValidatorRegistrationLockedFee({ wallet: mockWallet, profile: mockProfile }),
			{
				wrapper: ({ children }) => children,
			},
		);

		expect(result.current.validatorRegistrationFee).toBe(0);
	});
});
