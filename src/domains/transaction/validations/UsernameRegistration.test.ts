/* eslint-disable sonarjs/no-duplicate-string */

import { IProfile } from "@/app/lib/profiles/profile.contract";
import { usernameRegistration } from "./UsernameRegistration";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { requestMock, server } from "@/tests/mocks/server";
import { Networks } from "@/app/lib/mainsail";
import { MutableRefObject } from "react";
import { Environment } from "@/app/lib/profiles";
import { http, HttpResponse } from "msw";
import { renderHook } from "@testing-library/react";
import { useTranslation } from "react-i18next";

let profile: IProfile;
let t: (key: string, options?: any) => string;
let network: Networks.Network;
let environment: Environment;
let controller: MutableRefObject<AbortController | undefined>;

describe("Username Registration Validation", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		network = profile.wallets().first().network();
		environment = env;

		await env.profiles().restore(profile);
		await profile.sync();

		const {
			result: {
				current: { t: translationFunction },
			},
		} = renderHook(() => useTranslation());
		t = translationFunction;
	});

	beforeEach(() => {
		// Abort controller is used in the real implementation, so we mock it here.
		controller = { current: new AbortController() };
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	it("should return a required message", () => {
		const { required } = usernameRegistration(t).username(environment, network, profile, controller);
		expect(required).toBe(t("COMMON.VALIDATION.FIELD_REQUIRED", { field: t("COMMON.USERNAME") }));
	});

	it("should fail if username is too long", async () => {
		const { validate } = usernameRegistration(t).username(environment, network, profile, controller);
		const longUsername = "a".repeat(21);
		await expect(validate.unique(longUsername)).resolves.toBe(
			t("COMMON.VALIDATION.MAX_LENGTH", { field: t("COMMON.USERNAME"), maxLength: 20 }),
		);
	});

	it("should fail if username starts with an underscore", async () => {
		const { validate } = usernameRegistration(t).username(environment, network, profile, controller);
		await expect(validate.unique("_username")).resolves.toBe(t("COMMON.VALIDATION.LEADING_UNDERSCORE"));
	});

	it("should fail if username ends with an underscore", async () => {
		const { validate } = usernameRegistration(t).username(environment, network, profile, controller);
		await expect(validate.unique("username_")).resolves.toBe(t("COMMON.VALIDATION.TRAILING_UNDERSCORE"));
	});

	it("should fail if username has multiple underscores", async () => {
		const { validate } = usernameRegistration(t).username(environment, network, profile, controller);
		await expect(validate.unique("user__name")).resolves.toBe(t("COMMON.VALIDATION.MULTIPLE_UNDERSCORES"));
	});

	it("should fail if username has invalid characters", async () => {
		const { validate } = usernameRegistration(t).username(environment, network, profile, controller);
		await expect(validate.unique("user-name")).resolves.toBe(t("COMMON.VALIDATION.USERNAME_ALLOWED_CHARS"));
		await expect(validate.unique("userName")).resolves.toBe(t("COMMON.VALIDATION.USERNAME_ALLOWED_CHARS"));
	});

	it("should fail for empty username", async () => {
		const { validate } = usernameRegistration(t).username(environment, network, profile, controller);
		await expect(validate.unique("")).resolves.toBe(t("COMMON.VALIDATION.USERNAME_ALLOWED_CHARS"));
	});

	it("should fail if username already exists", async () => {
		const username = "existing_user";
		server.use(requestMock(`${network.config().host("full", profile)}/wallets/${username}`, {}));

		const { validate } = usernameRegistration(t).username(environment, network, profile, controller);
		await expect(validate.unique(username)).resolves.toBe(
			t("COMMON.VALIDATION.EXISTS", { field: t("COMMON.USERNAME") }),
		);
	});

	it("should pass if username does not exist", async () => {
		const username = "new_user";
		server.use(requestMock(`${network.config().host("full", profile)}/wallets/${username}`, {}, { status: 404 }));

		const { validate } = usernameRegistration(t).username(environment, network, profile, controller);
		await expect(validate.unique(username)).resolves.toBeUndefined();
	});

	it("should return true on other fetch errors", async () => {
		const username = "any_user";
		server.use(
			http.get(`${network.config().host("full", profile)}/wallets/${username}`, () => HttpResponse.error()),
		);

		const { validate } = usernameRegistration(t).username(environment, network, profile, controller);
		await expect(validate.unique(username)).resolves.toBe(true);
	});
});
