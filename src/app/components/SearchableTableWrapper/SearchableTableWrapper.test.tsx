import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchableTableWrapper } from "./SearchableTableWrapper";
import { renderResponsive } from "@/utils/testing-library";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key) => key,
	}),
}));

vi.mock("../VotesFilter", () => ({
	VotesFilter: ({ onChange }) => (
		<select data-testid="VotesFilter" onChange={(e) => onChange(e.target.value)}>
			<option value="all">All</option>
			<option value="current">Current</option>
		</select>
	),
}));

describe("SearchableTableWrapper", () => {
	const setSearchQuery = vi.fn();
	const setSelectedFilter = vi.fn();

	beforeEach(() => {
		setSearchQuery.mockClear();
		setSelectedFilter.mockClear();
	});

	it("should render with wallet search placeholder", () => {
		render(
			<SearchableTableWrapper searchQuery="" setSearchQuery={setSearchQuery}>
				<div>Children</div>
			</SearchableTableWrapper>,
		);
		expect(screen.getByPlaceholderText("COMMON.SEARCH")).toBeInTheDocument();
	});

	it("should render with custom search placeholder", () => {
		render(
			<SearchableTableWrapper
				searchQuery=""
				setSearchQuery={setSearchQuery}
				searchPlaceholder="Custom placeholder"
			>
				<div>Children</div>
			</SearchableTableWrapper>,
		);
		expect(screen.getByPlaceholderText("Custom placeholder")).toBeInTheDocument();
	});

	it("should render with custom extra", () => {
		render(
			<SearchableTableWrapper searchQuery="" setSearchQuery={setSearchQuery} extra={<div>Custom extra</div>}>
				<div>Children</div>
			</SearchableTableWrapper>,
		);
		expect(screen.getByText("Custom extra")).toBeInTheDocument();
	});
});
