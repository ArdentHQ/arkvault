import React from "react";

import { NewsCard } from "./NewsCard";
import { data } from "@/tests/fixtures/news/page-1.json";
import { render } from "@/utils/testing-library";

describe("NewsCard", () => {
	it("should render", () => {
		const { container, asFragment } = render(<NewsCard {...data[0]} />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with cover image", () => {
		const { container, asFragment } = render(
			<NewsCard {...data[1]} coverImage="https://via.placeholder.com/150" />,
		);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
