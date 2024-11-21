import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { DeleteProfile } from "./DeleteProfile";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";

let profile: Contracts.IProfile;

describe("DeleteProfile", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it("should render", async () => {
		const { asFragment } = render(<DeleteProfile isOpen profileId={profile.id()} />);

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		expect(screen.getByTestId("DeleteResource__submit-button")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should delete", async () => {
		render(<DeleteProfile isOpen profileId={profile.id()} />);

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("DeleteResource__submit-button"));

		await waitFor(() => expect(env.profiles().values()).toHaveLength(2));
	});
});
