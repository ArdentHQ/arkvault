/* eslint-disable testing-library/no-node-access */
/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import * as browserAccess from "browser-fs-access";

import GeneralSettings from "@/domains/setting/pages/General";
import { env, getMainsailProfileId, render, screen, waitFor } from "@/utils/testing-library";
import { expect } from "vitest";

let profile: Contracts.IProfile;
let browserAccessMock: vi.SpyInstance;

const submitButton = () => screen.getByTestId("General-settings__submit-button");
const nameInput = () => screen.getByTestId("General-settings__input--name");

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

describe("General Settings", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		await env.profiles().restore(profile);
		await profile.sync();
	});

	beforeEach(() => {
		browserAccessMock = vi
			.spyOn(browserAccess, "fileOpen")
			.mockResolvedValue(new File([], "picture.png", { type: "image/png" }));
	});

	afterEach(() => {
		browserAccessMock.mockRestore();
	});

	it("should not restore support chat after form submission if chat was not open", async () => {
		const { showSupportChat: showSupportChatMock, isSupportChatOpen } = vi.hoisted(() => ({
			hideSupportChat: vi.fn(),
			isSupportChatOpen: vi.fn().mockReturnValue(false),
			showSupportChat: vi.fn(),
		}));

		vi.mock("@/app/contexts/Zendesk", () => ({
			useZendesk: () => ({
				hideSupportChat: vi.fn(),
				isSupportChatOpen,
				showSupportChat: showSupportChatMock,
			}),
		}));

		render(<GeneralSettings />, {
			route: `/profiles/${profile.id()}/settings`,
		});

		await waitFor(() => expect(nameInput()).toHaveValue(profile.name()));

		await userEvent.type(nameInput(), " updated");

		await waitFor(() => {
			expect(submitButton()).toBeEnabled();
		});

		await userEvent.click(submitButton());

		await waitFor(() => {
			expect(showSupportChatMock).not.toHaveBeenCalled();
		});

		expect(isSupportChatOpen()).toBe(false);
	});
});
