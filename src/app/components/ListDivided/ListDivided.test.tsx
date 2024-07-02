import React from "react";

import { render, screen } from "@/utils/testing-library";

import { ListDivided } from "./ListDivided";

describe("ListDivided", () => {
	it("should render an empty list divided", () => {
		const { asFragment } = render(<ListDivided />);

		expect(screen.getByTestId("list-divided__empty")).toHaveTextContent("empty");
		expect(asFragment()).toMatchSnapshot();
	});

	it.each([true, false])("should render an list divided with lastBorder = %s", (noBorder: boolean) => {
		const item = {
			content: (
				<div className="mt-2 flex flex-row">
					<div className="mr-6 flex h-24 w-24 items-center justify-center rounded border-2 border-dashed border-theme-secondary-500" />
					<div className="relative h-24 w-24 rounded bg-theme-secondary-500">
						<img
							src="https://randomuser.me/api/portraits/men/3.jpg"
							className="rounded object-cover"
							alt="random avatar"
						/>
					</div>
				</div>
			),
			isFloatingLabel: true,
			itemLabelClass: "text-2xl font-semibold text-theme-secondary-text",
			itemLabelDescriptionClass: "text-sm font-semibold text-theme-secondary-700",
			itemValueClass: "",
			label: "New Profile",
			labelClass: "",
			labelDescription: "Select Profile Image",
			value: "",
		};
		const { asFragment } = render(<ListDivided items={[item]} noBorder={noBorder} />);

		expect(screen.getAllByRole("listitem")).toHaveLength(1);
		expect(asFragment()).toMatchSnapshot();
	});
});
