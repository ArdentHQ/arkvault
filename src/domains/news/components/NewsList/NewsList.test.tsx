import userEvent from "@testing-library/user-event";
import React from "react";

import { NewsList } from ".";
import { render, screen } from "@/utils/testing-library";

import page1Fixture from "@/tests/fixtures/news/page-1.json";

describe("NewsList", () => {
	const meta = {
		currentPage: 1,
		itemsPerPage: 1,
		totalCount: 10,
	};

	const news = page1Fixture.data.slice(0, 1);

	it("should render", () => {
		render(<NewsList isLoading={false} news={news} onSelectPage={vi.fn()} {...meta} />);

		expect(screen.getAllByTestId("NewsCard")).toHaveLength(1);
		expect(screen.queryByTestId("NewsCard__skeleton")).not.toBeInTheDocument();
	});

	it("should render loading state", () => {
		render(<NewsList isLoading news={news} onSelectPage={vi.fn()} {...meta} />);

		expect(screen.queryByTestId("NewsCard")).not.toBeInTheDocument();
		expect(screen.getAllByTestId("NewsCard__skeleton")).toHaveLength(8);
	});

	it("should render empty state", () => {
		render(<NewsList isLoading={false} news={[]} onSelectPage={vi.fn()} {...meta} />);

		expect(screen.queryByTestId("NewsCard")).not.toBeInTheDocument();
		expect(screen.queryByTestId("NewsCard__skeleton")).not.toBeInTheDocument();
		expect(screen.getByTestId("EmptyResults")).toBeInTheDocument();
	});

	it("should render execute onSelectPage callback", () => {
		const onSelectPageSpy = vi.fn();

		render(<NewsList isLoading={false} news={news} onSelectPage={onSelectPageSpy} {...meta} />);

		userEvent.click(screen.getByTestId("Pagination__next"));

		expect(onSelectPageSpy).toHaveBeenCalledWith(2);

		onSelectPageSpy.mockRestore();
	});
});
