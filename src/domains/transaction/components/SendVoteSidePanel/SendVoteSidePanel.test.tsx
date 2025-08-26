import React from "react";

import { env, getMainsailProfileId, render, screen } from "@/utils/testing-library";

import { SendVoteSidePanel } from "./SendVoteSidePanel";
import { VoteFormProvider } from "@/domains/vote/contexts/VoteFormContext";

describe("SendVoteSidePanel", () => {
	it("should render FormStep inside side panel", async () => {
		const profile = env.profiles().findById(getMainsailProfileId());
		const wallet = profile.wallets().first();

		render(
			<VoteFormProvider profile={profile} network={wallet.network()} wallet={wallet as any}>
				<SendVoteSidePanel open={true} onOpenChange={vi.fn()} />
			</VoteFormProvider>,
			{ route: `/profiles/${profile.id()}/dashboard` },
		);

		await expect(screen.findByTestId("SendVote__form-step")).resolves.toBeVisible();
	});
});
