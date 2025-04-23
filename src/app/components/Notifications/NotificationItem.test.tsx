import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect } from "react";

import { NotificationItem } from "./NotificationItem";
import { env, getMainsailProfileId, render, screen, waitFor } from "@/utils/testing-library";

import { server, requestMock } from "@/tests/mocks/server";

import TransactionsFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions.json";

let profile: Contracts.IProfile;
let notification: any;

vi.mock("react-visibility-sensor", () => ({
	/* eslint-disable react-hooks/rules-of-hooks */
	default: ({ children, onChange }) => {
		useEffect(() => {
			if (onChange) {
				onChange(false);
			}
		}, [onChange]);

		return <div>{children}</div>;
	},
}));

describe("Notifications", () => {
	beforeAll(() => {
		server.use(requestMock("https://dwallets-evm.mainsailhq.com/api/transactions", TransactionsFixture));

		profile = env.profiles().findById(getMainsailProfileId());
		notification = profile.notifications().get("7e72ea8c-a190-4c88-8c10-efae894b589a");
	});

	it("should render notification item", () => {
		const { container } = render(
			<table>
				<tbody>
					<NotificationItem {...notification} />
				</tbody>
			</table>,
		);

		expect(container).toMatchSnapshot();
	});

	it("should emit onAction event", async () => {
		const onAction = vi.fn();
		render(
			<table>
				<tbody>
					<NotificationItem {...notification} onAction={onAction} />
				</tbody>
			</table>,
		);

		await userEvent.click(screen.getByTestId("NotificationItem__action"));

		await waitFor(() => expect(onAction).toHaveBeenCalledWith("7e72ea8c-a190-4c88-8c10-efae894b589a"));
	});

	it("should emit onVisibilityChange event", async () => {
		const onVisibilityChange = vi.fn();
		render(
			<table>
				<tbody>
					<NotificationItem {...notification} onVisibilityChange={onVisibilityChange} />
				</tbody>
			</table>,
		);

		await waitFor(() => expect(onVisibilityChange).toHaveBeenCalledWith(false));
	});

	it("should render with custom action name", () => {
		const onVisibilityChange = vi.fn();

		profile.notifications().releases().push({
			action: "custom action name",
			body: "test",
			icon: "ArkLogo",
			name: "Update",
		});

		const releaseNotification = profile.notifications().releases().recent()[0];

		const { container } = render(
			<table>
				<tbody>
					<NotificationItem {...releaseNotification} onVisibilityChange={onVisibilityChange} />
				</tbody>
			</table>,
		);

		expect(screen.getByTestId("NotificationItem__action")).toHaveTextContent("Update");
		expect(container).toMatchSnapshot();
	});
});
