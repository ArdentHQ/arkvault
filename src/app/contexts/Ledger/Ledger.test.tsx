/* eslint-disable @typescript-eslint/require-await */
import React from "react";
import { EnvironmentProvider, LedgerProvider } from "@/app/contexts";
import { env, render, screen } from "@/utils/testing-library";

describe("Ledger Provider", () => {
	it("should render ledger provider", async () => {
		process.env.REACT_APP_IS_UNIT = "1";

		const { container, asFragment } = render(
			<EnvironmentProvider env={env}>
				<LedgerProvider>
					<div data-testid="content" />
				</LedgerProvider>
			</EnvironmentProvider>,
		);

		expect(screen.getByTestId("content")).toBeVisible();

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
