import React from "react";

import { env, getMainsailProfileId, render, screen } from "@/utils/testing-library";
import { HideBalance } from "./HideBalance";
import userEvent from "@testing-library/user-event";
import { Contracts } from "@/app/lib/profiles";
import * as balanceVisibilityHook from "@/app/hooks/use-balance-visibility";

let profile: Contracts.IProfile;

describe("HideBalance", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should render", () => {
		render(<HideBalance profile={profile} />);

		expect(screen.getByTestId("HideBalance-button")).toBeInTheDocument();
	});

	it("should render with icon hide", async () => {
		render(<HideBalance profile={profile} />);

		const button = screen.getByTestId("HideBalance-button");
		await userEvent.click(button);

		expect(screen.getByTestId("HideBalance-icon-hide")).toBeInTheDocument();
	});

	it("should render with icon show", async () => {
		render(<HideBalance profile={profile} />);

		const button = screen.getByTestId("HideBalance-button");
		await userEvent.click(button);

		expect(screen.getByTestId("HideBalance-icon-show")).toBeInTheDocument();
	});

	it("should call setHideBalance when clicked", async () => {
		const setHideBalanceSpy = vi.fn();

		vi.spyOn(balanceVisibilityHook, "useBalanceVisibility").mockReturnValue({
			hideBalance: true,
			setHideBalance: setHideBalanceSpy,
		});

		render(<HideBalance profile={profile} />);

		const button = screen.getByTestId("HideBalance-button");
		await userEvent.click(button);

		expect(setHideBalanceSpy).toHaveBeenCalled();
	});
});
