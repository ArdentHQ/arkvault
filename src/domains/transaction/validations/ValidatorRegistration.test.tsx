import { Contracts } from "@ardenthq/sdk-profiles";
import { validatorRegistration } from "./ValidatorRegistration";
import { env, getMainsailProfileId } from "@/utils/testing-library";
let profile: Contracts.IProfile;
let translationMock: any;

describe("Register validator validation", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);

		await profile.sync();

		translationMock = vi.fn((index18nString: string) => index18nString);
	});

	it("should validate BLS public key", async () => {
		const { validate } = validatorRegistration(translationMock).validatorPublicKey(profile.wallets().first());

		await expect(
			validate(
				"a08058db53e2665c84a40f5152e76dd2b652125a6079130d4c315e728bcf4dd1dfb44ac26e82302331d61977d3141118",
			),
		).resolves.toBe(true);
	});

	it("should fail to validate BLS public key", async () => {
		const { validate } = validatorRegistration(translationMock).validatorPublicKey(profile.wallets().first());

		await expect(validate("test")).resolves.not.toBe(true);
	});
});
