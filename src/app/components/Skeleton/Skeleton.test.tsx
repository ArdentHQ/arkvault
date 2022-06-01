import React from "react";

import { Skeleton } from "./Skeleton";
import { render } from "@/utils/testing-library";

describe("Skeleton", () => {
	it("should render", () => {
		const { asFragment } = render(<Skeleton />);

		expect(asFragment()).toMatchSnapshot();
	});
});
