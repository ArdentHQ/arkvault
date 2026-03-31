import { Contracts } from "@/app/lib/profiles";
import { renderHook } from "@testing-library/react";

import { useProfileAddresses } from "./use-profile-addresses";
import { env, getMainsailProfileId } from "@/utils/testing-library";

let profile: Contracts.IProfile;

describe("useProfileAddresses", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		profile
			.contacts()
			.last()
			.setAddresses([
				{
					address: "0x125b484e51Ad990b5b3140931f3BD8eAee85Db23",
				},
			]);

		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should return all available addresses", () => {
		const { result } = renderHook(() => useProfileAddresses({ profile }));

		expect(result.current.allAddresses).toHaveLength(4);
		expect(result.current.contactAddresses).toHaveLength(2);
		expect(result.current.profileAddresses).toHaveLength(2);
	});

	it("should return unique addresses", () => {
		const { result, rerender } = renderHook(() => useProfileAddresses({ profile }));

		expect(result.current.allAddresses).toHaveLength(4);

		expect(profile.contacts().values()).toHaveLength(2);

		profile.contacts().create("New name", [
			{
				address: "0x125b484e51Ad990b5b3140931f3BD8eAee85Db23",
			},
		]);

		expect(profile.contacts().values()).toHaveLength(3);

		rerender();

		expect(result.current.allAddresses).toHaveLength(5);
	});
});
