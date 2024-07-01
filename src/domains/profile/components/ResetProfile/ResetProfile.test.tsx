import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { ResetProfile } from "./ResetProfile";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";

let profile: Contracts.IProfile;

describe("ResetProfile", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		profile.settings().set(Contracts.ProfileSetting.Theme, "dark");
		env.persist();
	});

	it("should render", async () => {
		const { asFragment } = render(<ResetProfile isOpen profile={profile} />);

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		expect(screen.getByTestId("ResetProfile__submit-button")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should reset profile", async () => {
		const onReset = vi.fn();

		render(<ResetProfile isOpen profile={profile} onReset={onReset} />);

		const theme = profile.settings().get(Contracts.ProfileSetting.Theme);

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("ResetProfile__submit-button"));

		await waitFor(() => expect(profile.settings().get(Contracts.ProfileSetting.Theme)).not.toBe(theme));

		await waitFor(() => {
			expect(onReset).toHaveBeenCalledWith();
		});
	});
});
