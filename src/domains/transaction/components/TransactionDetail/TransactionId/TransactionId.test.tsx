import React from "react";
import { DTO } from "@ardenthq/sdk-profiles";
import { screen, renderResponsive, render } from "@/utils/testing-library";
import * as useLink from "@/app/hooks/use-link";
import { TransactionId } from "./TransactionId";
import userEvent from "@testing-library/user-event";

describe("TransactionId", () => {
	it.each(["sm", "md", "lg"])("should render in %s", (breakpoint: string) => {
		renderResponsive(
			<TransactionId
				transaction={
					{
						explorerLink: () => "https://test.com",
						id: () => "id",
						isConfirmed: () => true,
					} as DTO.ExtendedSignedTransactionData
				}
			/>,
			breakpoint,
		);

		expect(screen.getByTestId("TransactionId")).toBeInTheDocument();
	});

	it("should open explorer link in external window", async () => {
		const openExternalMock = vi.fn();
		vi.spyOn(useLink, "useLink").mockReturnValue({ openExternal: openExternalMock });

		render(
			<TransactionId
				transaction={
					{
						explorerLink: () => "https://test.com",
						id: () => "id",
						isConfirmed: () => false,
					} as DTO.ExtendedSignedTransactionData
				}
			/>,
		);

		expect(screen.getByTestId("TransactionId")).toBeInTheDocument();
		expect(screen.getByText("id")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("explorer-link"));
		expect(openExternalMock).toHaveBeenCalled();
	});
});
