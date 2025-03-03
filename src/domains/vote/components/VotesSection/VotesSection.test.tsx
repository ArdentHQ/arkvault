import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";

import { VotesHeader } from "./VotesHeader";
import { translations } from "@/domains/vote/i18n";
import { env, getDefaultProfileId, renderResponsive, screen } from "@/utils/testing-library";

let profile: Contracts.IProfile;

describe("VotesHeader", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it.each(["xs", "md"])("should render responsive (%s)", async (breakpoint) => {
		const { asFragment } = renderResponsive(
			<VotesHeader
				profile={profile}
				setSearchQuery={vi.fn()}
				isFilterChanged={false}
				isSelectDelegateStep={false}
				filterProperties={undefined}
				totalCurrentVotes={0}
			/>,
			breakpoint,
		);

		await expect(screen.findByText(translations.VOTES_PAGE.TITLE)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a different title if on select validator step", async () => {
		const { asFragment } = renderResponsive(
			<VotesHeader
				profile={profile}
				setSearchQuery={vi.fn()}
				isFilterChanged={false}
				isSelectDelegateStep={true}
				filterProperties={undefined}
				totalCurrentVotes={0}
			/>,
			"xs",
		);

		await expect(screen.findByText(translations.VALIDATOR_TABLE.TITLE)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});
});
