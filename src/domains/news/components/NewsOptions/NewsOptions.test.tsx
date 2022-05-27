import userEvent from "@testing-library/user-event";
import React from "react";

import { NewsOptions } from "./NewsOptions";
import { AvailableNewsCategories } from "@/domains/news/news.contracts";
import { render, screen, waitFor } from "@/utils/testing-library";

const categories: AvailableNewsCategories[] = ["Technical"];
const coins = ["ark"];

describe("NewsOptions", () => {
	it("should render", () => {
		const { container, asFragment } = render(<NewsOptions selectedCategories={categories} onSubmit={jest.fn()} />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should select category", () => {
		render(<NewsOptions selectedCategories={categories} onSubmit={jest.fn()} />);

		userEvent.click(screen.getByTestId("NewsOptions__category-Technical"));
	});

	it("should emit onSubmit with all selected filters", async () => {
		const onSubmit = jest.fn();

		render(<NewsOptions selectedCategories={categories} onSubmit={onSubmit} />);

		userEvent.click(screen.getByTestId("NewsOptions__category-Technical"));

		await waitFor(() =>
			expect(onSubmit).toHaveBeenCalledWith({
				categories: ["Technical"],
			}),
		);
	});
});
