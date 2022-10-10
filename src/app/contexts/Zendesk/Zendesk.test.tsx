import React from "react";

import userEvent from "@testing-library/user-event";
import { ZendeskProvider, useZendesk } from "./Zendesk";
import { render, screen, env, getDefaultProfileId, waitFor } from "@/utils/testing-library";
import { Contracts } from "@ardenthq/sdk-profiles";

let profile: Contracts.IProfile;

describe("Zendesk Context Provider", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it("should render the wrapper properly", () => {
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
		// @ts-ignore
		const widgetMock = jest.spyOn(window.document, "getElementById").mockImplementation((id: string) => {
			if (id === "webWidget") {
				return {
					contentWindow: window,
				};
			}
			return window.document.getElementById(id);
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
		await waitFor(() => expect(widgetMock).toHaveBeenCalled());

		userEvent.click(screen.getByTestId("content"));
		await waitFor(() => expect(widgetMock).toHaveBeenCalled());

		widgetMock.mockRestore();

		const undefinedWidgetMock = jest.spyOn(window.document, "getElementById").mockImplementation((id: string) => {
			if (id === "webWidget") {
				return undefined;
			}

			return window.document.getElementById(id);
		});

		userEvent.click(screen.getByTestId("content"));
		await waitFor(() => expect(widgetMock).not.toHaveBeenCalled());

		undefinedWidgetMock.mockRestore();
	});
});
