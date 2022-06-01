import React from "react";

import { SubForm } from "./SubForm";
import { render } from "@/utils/testing-library";

describe("SubForm", () => {
	it("should render", () => {
		const { asFragment } = render(
			<SubForm>
				<span>Hello</span>
			</SubForm>,
		);

		expect(asFragment()).toMatchSnapshot();
	});
});
