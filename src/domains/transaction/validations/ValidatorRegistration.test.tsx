import { Contracts } from "@ardenthq/sdk-profiles";

import { validatorRegistration } from "./ValidatorRegistration";
import { env, getDefaultProfileId } from "@/utils/testing-library";

let profile: Contracts.IProfile;
let translationMock: any;

describe("Register Delegate validator validation", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();
		vi;
		translationMock = vi.fn((index18nString: string) => index18nString);
	});

	it("should validate public key", async () => {
		const { validate } = validatorRegistration(translationMock).publicKey(profile.wallets().first());

		await expect(validate("02147bf63839be7abb44707619b012a8b59ad3eda90be1c6e04eb9c630232268de")).resolves.toBe(
			true,
		);
	});

	it("should fail to validate public key", async () => {
		const { validate } = validatorRegistration(translationMock).publicKey(profile.wallets().first());

		await expect(validate("test")).resolves.not.toBe(true);
	});
});
