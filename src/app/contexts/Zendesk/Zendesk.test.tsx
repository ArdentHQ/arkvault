import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";

import { useZendesk, ZendeskProvider } from "./Zendesk";

let profile: Contracts.IProfile;
const webWidgetSelector = "#webWidget";

describe("Zendesk Context Provider", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it("should render provider", () => {
		const { container, asFragment } = render(
			<ZendeskProvider>
				<span data-testid="ZendeskProvider">Content</span>
			</ZendeskProvider>,
		);

		expect(screen.getByTestId("ZendeskProvider")).toBeInTheDocument();

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should toggle support chat", async () => {
		process.env.ZENDESK_WIDGET_KEY = "1";

		// @ts-ignore
		const widgetMock = vi.spyOn(window.document, "querySelector").mockImplementation((selector: string) => {
			if (selector === webWidgetSelector) {
				return {
					contentWindow: {
						document: {
							body: {
								classList: {
									add: vi.fn(),
									remove: vi.fn(),
								},
								insertAdjacentHTML: vi.fn(),
							},
						},
					},
				};
			}
		});

		const Test = () => {
			const { showSupportChat, hideSupportChat } = useZendesk();
			showSupportChat(profile);

			return (
				<p data-testid="content" onClick={() => hideSupportChat()}>
					Configuration content
				</p>
			);
		};

		render(
			<ZendeskProvider>
				<Test />
			</ZendeskProvider>,
		);

		expect(screen.getByTestId("content")).toBeInTheDocument();

		await waitFor(() => expect(widgetMock).toHaveBeenCalledWith(webWidgetSelector));

		await userEvent.click(screen.getByTestId("content"));
		await waitFor(() => expect(widgetMock).toHaveBeenCalledWith(webWidgetSelector));

		widgetMock.mockRestore();

		const undefinedWidgetMock = vi
			.spyOn(window.document, "querySelector")
			.mockImplementation((selector: string) => {
				if (selector === webWidgetSelector) {
					return;
				}
			});

		await userEvent.click(screen.getByTestId("content"));
		await waitFor(() => expect(widgetMock).not.toHaveBeenCalledWith(webWidgetSelector));

		undefinedWidgetMock.mockRestore();
	});
});
