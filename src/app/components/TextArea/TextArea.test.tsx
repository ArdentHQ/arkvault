import React from "react";

import { render, screen } from "@/utils/testing-library";

import { TextArea } from "./TextArea";

describe("TextArea", () => {
	it("should render", () => {
		const { asFragment } = render(<TextArea ref={React.createRef()} />);
		const textarea = screen.getByTestId("TextArea");

		expect(textarea.tagName).toBe("TEXTAREA");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render as invalid", () => {
		const { asFragment } = render(<TextArea isInvalid />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render as disabled", () => {
		const { asFragment } = render(<TextArea disabled />);
		const textarea = screen.getByTestId("TextArea");

		expect(textarea).toBeDisabled();
		expect(asFragment()).toMatchSnapshot();
	});
});
