import { DateTime } from "@payvo/sdk-intl";
import React from "react";

import { TransactionTimestamp } from "./TransactionTimestamp";
import { render } from "@/utils/testing-library";

const datetime = DateTime.fromUnix(1_596_213_281);

describe("TransactionTimestamp", () => {
	it("should render", () => {
		const { container } = render(<TransactionTimestamp timestamp={datetime} />);

		expect(container).toHaveTextContent("31.07.2020 4:34 PM");
		expect(container).toMatchSnapshot();
	});
});
