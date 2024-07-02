import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { WelcomeModal } from "./WelcomeModal";
import { ConfigurationProvider } from "@/app/contexts";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { translations } from "@/domains/profile/i18n";
import { env, getDefaultProfileId, render, screen, within } from "@/utils/testing-library";

let profile: Contracts.IProfile;
let mockHasCompletedTutorial: vi.SpyInstance<boolean, []>;

const Wrapper = () => (
	<ConfigurationProvider defaultConfiguration={{ profileIsSyncing: false }}>
		<WelcomeModal profile={profile} environment={env} />
	</ConfigurationProvider>
);

const nextButtonID = "WelcomeModal-next";

describe("WelcomeModal", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	beforeEach(() => {
		mockHasCompletedTutorial = vi.spyOn(profile, "hasCompletedIntroductoryTutorial");
	});

	afterEach(() => {
		mockHasCompletedTutorial.mockRestore();
	});

	it("should not render if user completed the tutorial", () => {
		mockHasCompletedTutorial.mockReturnValue(true);
		const { asFragment } = render(<Wrapper />);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a modal if user hasnt completed the tutorial", () => {
		mockHasCompletedTutorial.mockReturnValue(false);

		const { asFragment } = render(<Wrapper />);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_WELCOME.STEP_1.TITLE);
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(
			translations.MODAL_WELCOME.DONT_SHOW_CHECKBOX_LABEL,
		);
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(commonTranslations.START);
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(commonTranslations.SKIP);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should show navigation buttons according to the step", async () => {
		mockHasCompletedTutorial.mockReturnValue(false);

		render(<Wrapper />);

		expect(screen.getByTestId("WelcomeModal-skip")).toBeDefined();
		expect(screen.getByTestId(nextButtonID)).toBeDefined();
		expect(screen.queryByTestId("DotNavigation")).not.toBeInTheDocument();
		expect(screen.queryByTestId("WelcomeModal-finish")).not.toBeInTheDocument();
		expect(screen.queryByTestId("WelcomeModal-prev")).not.toBeInTheDocument();

		// Intermediate steps
		for (const _ of [1, 2]) {
			await userEvent.click(screen.getByTestId(nextButtonID));

			expect(screen.getByTestId(nextButtonID)).toBeDefined();
			expect(screen.getByTestId("WelcomeModal-prev")).toBeDefined();
			expect(screen.getByTestId("DotNavigation")).toBeDefined();
			expect(screen.queryByTestId("WelcomeModal-finish")).not.toBeInTheDocument();
			expect(screen.queryByTestId("WelcomeModal-skip")).not.toBeInTheDocument();
		}

		// Final step
		await userEvent.click(screen.getByTestId(nextButtonID));

		expect(screen.getByTestId("WelcomeModal-finish")).toBeDefined();
		expect(screen.getByTestId("WelcomeModal-prev")).toBeDefined();
		expect(screen.getByTestId("DotNavigation")).toBeDefined();
		expect(screen.queryByTestId(nextButtonID)).not.toBeInTheDocument();
		expect(screen.queryByTestId("WelcomeModal-skip")).not.toBeInTheDocument();
	});

	it("can change the current step with the navigation dots", async () => {
		mockHasCompletedTutorial.mockReturnValue(false);

		render(<Wrapper />);

		// Got to first step (to show the navigation dots)
		await userEvent.click(screen.getByTestId(nextButtonID));

		// Go to final step
		const count = within(screen.getByTestId("DotNavigation")).getAllByRole("listitem").length;
		await userEvent.click(screen.getByTestId(`DotNavigation-Step-${count - 1}`));

		expect(screen.getByTestId("WelcomeModal-finish")).toBeDefined();
		expect(screen.getByTestId("WelcomeModal-prev")).toBeDefined();
		expect(screen.getByTestId("DotNavigation")).toBeDefined();
		expect(screen.queryByTestId(nextButtonID)).not.toBeInTheDocument();
		expect(screen.queryByTestId("WelcomeModal-skip")).not.toBeInTheDocument();
	});
});
