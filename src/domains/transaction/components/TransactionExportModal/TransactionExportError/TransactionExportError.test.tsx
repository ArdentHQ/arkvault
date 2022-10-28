import { createHashHistory } from "history";
import React from "react";

import { TransactionExportError } from "./TransactionExportError";
import { getDefaultProfileId, screen, renderResponsive } from "@/utils/testing-library";

const history = createHashHistory();

const fixtureProfileId = getDefaultProfileId();
let dashboardURL: string;

describe("TransactionExportError", () => {
	beforeEach(() => {
		dashboardURL = `/profiles/${fixtureProfileId}/dashboard`;
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint: string) => {
		const { asFragment } = renderResponsive(<TransactionExportError />, breakpoint, {
			history,
			route: dashboardURL,
		});

		expect(screen.getByTestId("TransactionExportError__retry-button")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
