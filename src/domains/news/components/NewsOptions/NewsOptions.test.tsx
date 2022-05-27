import userEvent from "@testing-library/user-event";
import React from "react";

import { NewsOptions } from "./NewsOptions";
import { AvailableNewsCategories } from "@/domains/news/news.contracts";
import { render, screen, waitFor } from "@/utils/testing-library";

const categories: AvailableNewsCategories[] = ["Technical"];
const coins = ["ark"];

describe("NewsOptions", () => {
	it("should render", () => {
		const { container, asFragment } = render(
			<NewsOptions selectedCategories={categories} selectedCoins={coins} onSubmit={jest.fn()} />,
		);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should select category", () => {
		render(<NewsOptions selectedCategories={categories} selectedCoins={coins} onSubmit={jest.fn()} />);

		userEvent.click(screen.getByTestId("NewsOptions__category-Technical"));
	});

	it("should select asset", () => {
		render(<NewsOptions selectedCategories={categories} selectedCoins={coins} onSubmit={jest.fn()} />);

		const arkOption = screen.getByTestId("NetworkOption__ark.mainnet");
		userEvent.click(arkOption);
	});

	it("should emit onSubmit with all selected filters", async () => {
		const onSubmit = jest.fn();

		render(<NewsOptions selectedCategories={categories} selectedCoins={coins} onSubmit={onSubmit} />);

		userEvent.click(screen.getByTestId("NewsOptions__category-Technical"));
		userEvent.click(screen.getByTestId("NetworkOption__ark.mainnet"));

		await waitFor(() =>
			expect(onSubmit).toHaveBeenCalledWith({
				categories: ["Technical"],
				coins: ["ARK"],
			}),
		);
	});
});
