import { Contracts } from "@/app/lib/profiles";
import { renderHook } from "@testing-library/react";
import React from "react";
import { useTimeFormat } from "./use-time-format";
import { env, getMainsailProfileId, Providers } from "@/utils/testing-library";

let profile: Contracts.IProfile;

const dashboardURL = `/profiles/${getMainsailProfileId()}/dashboard`;

const wrapper = ({ children }: any) => <Providers route={dashboardURL}>{children}</Providers>;

describe("useTimeFormat", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		await env.profiles().restore(profile);
	});

	it("should return format without profile route", () => {
		const { result } = renderHook(() => useTimeFormat(), { wrapper });

		expect(result.current).toBe("DD.MM.YYYY h:mm A");
	});

	it("should return format from profile", () => {
		const settingsSpy = vi.spyOn(profile.settings(), "get");
		settingsSpy.mockReturnValueOnce("format");

		const { result } = renderHook(() => useTimeFormat(), { wrapper });

		expect(result.current).toBe("DD.MM.YYYY format");
	});

	it("should return default format if profile has no setting", () => {
		const settingsSpy = vi.spyOn(profile.settings(), "get");
		settingsSpy.mockReturnValueOnce(undefined);

		const { result } = renderHook(() => useTimeFormat(), { wrapper });

		expect(result.current).toBe("DD.MM.YYYY h:mm A");
	});
});
