import { Contracts } from "@/app/lib/profiles";
import { validatorRegistration } from "./ValidatorRegistration";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { requestMock, server } from "@/tests/mocks/server";
import { Networks } from "@/app/lib/mainsail";
let profile: Contracts.IProfile;
let translationMock: any;
let network: Networks.Network;

describe("Register validator validation", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		network = profile.wallets().first().network();

		await env.profiles().restore(profile);

		await profile.sync();

		translationMock = vi.fn((index18nString: string) => index18nString);
	});

	it("should validate BLS public key", async () => {
		const { validate } = validatorRegistration(translationMock).validatorPublicKey(profile, network);

		await expect(
			validate.pattern(
				"a08058db53e2665c84a40f5152e76dd2b652125a6079130d4c315e728bcf4dd1dfb44ac26e82302331d61977d3141118",
			),
		).toBe(true);
	});

	it("should fail to validate BLS public key", async () => {
		const { validate } = validatorRegistration(translationMock).validatorPublicKey(profile, network);

		await expect(validate.pattern("test")).not.toBe(true);
	});

	it("should pass if public key hasn't used", async () => {
		const { validate } = validatorRegistration(translationMock).validatorPublicKey(profile, network);

		// Emulate public key hasn't used
		server.use(
			requestMock(
				"https://dwallets-evm.mainsailhq.com/api",
				{ meta: { count: 0 } },
				{
					query: {
						"attributes.validatorPublicKey":
							"a08058db53e2665c84a40f5152e76dd2b652125a6079130d4c315e728bcf4dd1dfb44ac26e82302331d61977d3141118",
					},
				},
			),
		);

		await expect(
			validate.unique(
				"a08058db53e2665c84a40f5152e76dd2b652125a6079130d4c315e728bcf4dd1dfb44ac26e82302331d61977d3141118",
			),
		).resolves.toBeFalsy();
	});

	it("should fail if public key has used", async () => {
		const { validate } = validatorRegistration(translationMock).validatorPublicKey(profile, network);

		// Emulate public key has used
		server.use(
			requestMock(
				"https://dwallets-evm.mainsailhq.com/api",
				{ meta: { count: 1 } },
				{
					query: {
						"attributes.validatorPublicKey":
							"a08058db53e2665c84a40f5152e76dd2b652125a6079130d4c315e728bcf4dd1dfb44ac26e82302331d61977d3141118",
					},
				},
			),
		);

		await expect(
			validate.unique(
				"a08058db53e2665c84a40f5152e76dd2b652125a6079130d4c315e728bcf4dd1dfb44ac26e82302331d61977d3141118",
			),
		).resolves.toBe("COMMON.INPUT_PUBLIC_KEY.VALIDATION.PUBLIC_KEY_ALREADY_EXISTS");
	});
});
