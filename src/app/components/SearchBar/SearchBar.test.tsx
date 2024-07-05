/* eslint-disable @typescript-eslint/require-await */
import userEvent from "@testing-library/user-event";
import React from "react";

import { SearchBar } from "./SearchBar";
import { translations } from "@/app/i18n/common/i18n";
import { render, screen, waitFor } from "@/utils/testing-library";

describe("SearchBar", () => {
	it("should render", () => {
		const { asFragment } = render(<SearchBar />);

		expect(screen.getByTestId("SearchBar")).toHaveTextContent(translations.SEARCH_BAR.FIND_IT);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with children", () => {
		render(<SearchBar>I am a children</SearchBar>);

		expect(screen.getByText("I am a children")).toBeInTheDocument();
	});

	it("should call onSearch callback on button click", async () => {
		const onSearch = vi.fn();

		render(<SearchBar onSearch={onSearch} />);

		await userEvent.type(screen.getByTestId("Input"), "test query");

		await userEvent.click(screen.getByTestId("SearchBar__button"));

		await waitFor(() => expect(onSearch).toHaveBeenCalledWith("test query"));
	});
});
