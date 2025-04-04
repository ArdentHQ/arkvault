import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";

import { useProfileAddresses } from "./use-profile-addresses";
import { env, getMainsailProfileId } from "@/utils/testing-library";

let profile: Contracts.IProfile;

process.env.RESTORE_MAINSAIL_PROFILE = "true";

describe("useProfileAddresses", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		profile
			.contacts()
			.last()
			.setAddresses([
				{
					address: "0x125b484e51Ad990b5b3140931f3BD8eAee85Db23",
					coin: "Mainsail",
					network: "mainsail.devnet",
				},
			]);

		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should return all available addresses", () => {
		const { result } = renderHook(() => useProfileAddresses({ profile }));

		expect(result.current.allAddresses).toHaveLength(3);
		expect(result.current.contactAddresses).toHaveLength(1);
		expect(result.current.profileAddresses).toHaveLength(2);
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

		expect(result.current.allAddresses).toHaveLength(3);

		expect(profile.contacts().values()).toHaveLength(1);

		profile.contacts().create("New name", [
			{
				address: "0x125b484e51Ad990b5b3140931f3BD8eAee85Db23",
				coin: "Mainsail",
				network: "mainsail.devnet",
			},
		]);

		expect(profile.contacts().values()).toHaveLength(2);

		rerender();

		expect(result.current.allAddresses).toHaveLength(4);
	});
});
