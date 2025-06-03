import { Contracts } from "@/app/lib/profiles";
import { renderHook } from "@testing-library/react";
import { createHashHistory } from "history";
import React from "react";
import { Router } from "react-router-dom";
import { useTimeFormat } from "./use-time-format";
import { env, getMainsailProfileId, WithProviders } from "@/utils/testing-library";

let profile: Contracts.IProfile;

const history = createHashHistory();
const dashboardURL = `/profiles/${getMainsailProfileId()}/dashboard`;

const wrapper = ({ children }: any) => (
	<WithProviders>
		<Router history={history}>{children}</Router>
	</WithProviders>
);

describe("useTimeFormat", () => {
	beforeAll(() => {
		navigate(dashboardURL);
		profile = env.profiles().findById(getMainsailProfileId());
	});

	it("should return format without profile route", () => {
		const localWrapper = ({ children }: any) => <WithProviders>{children}</WithProviders>;
		const { result } = renderHook(() => useTimeFormat(), { wrapper: localWrapper });

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
