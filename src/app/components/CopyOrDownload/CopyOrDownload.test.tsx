import React from "react";
import userEvent from "@testing-library/user-event";
import { CopyOrDownload } from "./CopyOrDownload";
import { screen, render } from "@/utils/testing-library";

describe("CopyOrDownload", () => {
	it("should render", async () => {
		const onClickDownload = vi.fn();

		const { asFragment } = render(
			<CopyOrDownload
				title="title"
				description="description"
				copyData="test"
				onClickDownload={onClickDownload}
			/>,
		);

		expect(screen.getByText("title")).toBeInTheDocument();
		expect(screen.getByText("description")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("CopyOrDownload__download"));

		expect(onClickDownload).toHaveBeenCalledTimes(1);

		expect(asFragment()).toMatchSnapshot();
	});
});
