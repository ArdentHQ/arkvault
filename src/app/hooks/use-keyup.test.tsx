import userEvent from "@testing-library/user-event";
import React from "react";

import { useKeyup } from "./use-keyup";
import { render } from "@/utils/testing-library";

describe("useKeyup", () => {
	const Component = (properties: { keyName: string; callback: () => void }) => {
		useKeyup(properties.keyName, properties.callback);

		return <div />;
	};

	it("should run a callback when mapped button is pressed", () => {
		const callback = vi.fn();

		render(<Component keyName="Enter" callback={callback} />);

		userEvent.keyboard("{enter}");

		expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent));
	});

	it("should do nothing when not mapped button is pressed", () => {
		const callback = vi.fn();

		render(<Component keyName="Escape" callback={callback} />);

		userEvent.keyboard("{enter}");

		expect(callback).not.toHaveBeenCalled();
	});
});
