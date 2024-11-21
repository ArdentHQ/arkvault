import { Contracts } from "@ardenthq/sdk-profiles";
import { validatorRegistration } from "./ValidatorRegistration";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { requestMock, server } from "@/tests/mocks/server";

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
			validate.pattern(
				"a08058db53e2665c84a40f5152e76dd2b652125a6079130d4c315e728bcf4dd1dfb44ac26e82302331d61977d3141118",
			),
		).resolves.toBe(true);
	});

	it("should fail to validate BLS public key", async () => {
		const { validate } = validatorRegistration(translationMock).validatorPublicKey(profile.wallets().first());

		await expect(validate.pattern("test")).resolves.not.toBe(true);
	});

	it("should pass if public key hasn't used", async () => {
		const { validate } = validatorRegistration(translationMock).validatorPublicKey(profile.wallets().first());

		// Emulate public key hasn't used
		server.use(requestMock(`https://dwallets-evm.mainsailhq.com/api/wallets*`, { meta: { count: 0 } }));

		await expect(
			validate.unique(
				"a08058db53e2665c84a40f5152e76dd2b652125a6079130d4c315e728bcf4dd1dfb44ac26e82302331d61977d3141118",
			),
		).resolves.toBeFalsy();
	});

	it("should fail if public key has used", async () => {
		const { validate } = validatorRegistration(translationMock).validatorPublicKey(profile.wallets().first());

		// Emulate public key has used
		server.use(requestMock(`https://dwallets-evm.mainsailhq.com/api/wallets*`, { meta: { count: 1 } }));

		await expect(
			validate.unique(
				"a08058db53e2665c84a40f5152e76dd2b652125a6079130d4c315e728bcf4dd1dfb44ac26e82302331d61977d3141118",
			),
		).resolves.toBe("COMMON.INPUT_PUBLIC_KEY.VALIDATION.PUBLIC_KEY_ALREADY_EXISTS");
	});
});
