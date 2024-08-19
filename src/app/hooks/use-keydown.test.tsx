import userEvent from "@testing-library/user-event";
import React from "react";

import { useKeydown } from "@/app/hooks/use-keydown";
import { render } from "@/utils/testing-library";

describe("useKeydown", () => {
	const Component = (properties: { keyName: string; callback: () => void }) => {
		useKeydown(properties.keyName, properties.callback);

		return <div />;
	};

	it("should run a callback when mapped button is pressed", async () => {
		const callback = vi.fn();

		render(<Component keyName="Enter" callback={callback} />);

		await userEvent.keyboard("{enter}");

		expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent));
	});

	it("should do nothing when not mapped button is pressed", async () => {
		const callback = vi.fn();

		render(<Component keyName="Escape" callback={callback} />);

		await userEvent.keyboard("{enter}");

		expect(callback).not.toHaveBeenCalled();
	});
});
