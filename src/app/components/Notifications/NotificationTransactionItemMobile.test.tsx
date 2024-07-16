import React, { useEffect } from "react";
import { NotificationTransactionItemMobileSkeleton } from "./NotificationTransactionItemMobileSkeleton";
import { render, screen, waitFor } from "@/utils/testing-library";

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

describe("Notification Transaction", () => {
	it("should render skeleton", async () => {
		render(
			<table>
				<tbody>
					<NotificationTransactionItemMobileSkeleton />
				</tbody>
			</table>,
		);

		await waitFor(() => expect(screen.getAllByTestId("TableRow")).toHaveLength(1));
	});
});
