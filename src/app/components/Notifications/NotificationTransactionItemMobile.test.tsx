import React from "react";
import { NotificationTransactionItemMobileSkeleton } from "./NotificationTransactionItemMobileSkeleton";
import { render, screen, waitFor } from "@/utils/testing-library";

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
