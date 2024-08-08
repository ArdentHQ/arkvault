import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";

import { useProfileAddresses } from "./use-profile-addresses";
import { env, getDefaultProfileId, MNEMONICS } from "@/utils/testing-library";

let profile: Contracts.IProfile;

describe("useProfileAddresses", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		profile
			.contacts()
			.last()
			.setAddresses([
				{
					address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
					coin: "ARK",
					network: "ark.devnet",
				},
			]);

		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should return all available addresses", () => {
		const { result } = renderHook(() => useProfileAddresses({ profile }));

		expect(result.current.allAddresses).toHaveLength(6);
		expect(result.current.contactAddresses).toHaveLength(4);
		expect(result.current.profileAddresses).toHaveLength(2);
	});

	it("should filter address by selected network", async () => {
		const wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: MNEMONICS[0],
			network: "ark.mainnet",
		});
		await profile.sync();
		const { result } = renderHook(() => useProfileAddresses({ network: wallet.network(), profile }));

		expect(result.current.allAddresses).toHaveLength(0);
		expect(result.current.contactAddresses).toHaveLength(0);
		expect(result.current.profileAddresses).toHaveLength(0);
	});

	it("should return all available addresses except MultiSignature", () => {
		const walletMultiSignatureSpy = vi
			.spyOn(profile.wallets().first(), "isMultiSignature")
			.mockImplementation(() => true);

		const { result } = renderHook(() => useProfileAddresses({ profile }, true));

		expect(result.current.allAddresses).toHaveLength(1);
		expect(result.current.contactAddresses).toHaveLength(0);
		expect(result.current.profileAddresses).toHaveLength(1);

		walletMultiSignatureSpy.mockRestore();
	});

	it("should return unique addresses", () => {
		const { result, rerender } = renderHook(() => useProfileAddresses({ profile }));

		expect(result.current.allAddresses).toHaveLength(6);

		expect(profile.contacts().values()).toHaveLength(2);

		profile.contacts().create("New name", [
			{
				address: "D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
				coin: "ARK",
				network: "ark.devnet",
			},
		]);

		expect(profile.contacts().values()).toHaveLength(3);

		rerender();

		expect(result.current.allAddresses).toHaveLength(6);
	});
});
