import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";
import { createHashHistory } from "history";
import { when } from "jest-when";
import React from "react";
import { Router } from "react-router-dom";

import { useTimeFormat } from "./use-time-format";
import { env, getDefaultProfileId, WithProviders } from "@/utils/testing-library";

let profile: Contracts.IProfile;

const history = createHashHistory();
const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;

const wrapper = ({ children }: any) => (
	<WithProviders>
		<Router history={history}>{children}</Router>
	</WithProviders>
);

describe("useTimeFormat", () => {
	beforeAll(() => {
		history.push(dashboardURL);
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it("should return format without profile route", () => {
		const wrapper = ({ children }: any) => <WithProviders>{children}</WithProviders>;
		const { result } = renderHook(() => useTimeFormat(), { wrapper });

		expect(result.current).toBe("DD.MM.YYYY h:mm A");
	});

	it("should return format from profile", () => {
		const settingsSpy = vi.spyOn(profile.settings(), "get");
		when(settingsSpy).calledWith(Contracts.ProfileSetting.TimeFormat).mockReturnValueOnce("format");

		const { result } = renderHook(() => useTimeFormat(), { wrapper });

		expect(result.current).toBe("DD.MM.YYYY format");
	});

	it("should return default format if profile has not setting", () => {
		const settingsSpy = vi.spyOn(profile.settings(), "get");
		when(settingsSpy).calledWith(Contracts.ProfileSetting.TimeFormat).mockReturnValueOnce();

		const { result } = renderHook(() => useTimeFormat(), { wrapper });

		expect(result.current).toBe("DD.MM.YYYY h:mm A");
	});
});
