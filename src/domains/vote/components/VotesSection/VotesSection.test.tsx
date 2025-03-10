import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VotesSection } from "./VotesSection";
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

describe("VotesSection", () => {
	const setSearchQuery = vi.fn();
	const setSelectedFilter = vi.fn();

	beforeEach(() => {
		setSearchQuery.mockClear();
		setSelectedFilter.mockClear();
	});

	it("should render with wallet search placeholder when selectedAddress is not provided", () => {
		render(
			<VotesSection searchQuery="" setSearchQuery={setSearchQuery} totalCurrentVotes={0}>
				<div>Children</div>
			</VotesSection>,
		);
		expect(screen.getByPlaceholderText("VOTE.VOTES_PAGE.SEARCH_WALLET_PLACEHOLDER")).toBeInTheDocument();
	});

	it("should render with validator search placeholder when selectedAddress is provided", () => {
		render(
			<VotesSection
				searchQuery=""
				setSearchQuery={setSearchQuery}
				selectedAddress="someAddress"
				totalCurrentVotes={0}
			>
				<div>Children</div>
			</VotesSection>,
		);
		expect(screen.getByPlaceholderText("VOTE.VOTES_PAGE.SEARCH_VALIDATOR_PLACEHOLDER")).toBeInTheDocument();
	});

	it("should not render VotesFilter when selectedAddress is not provided", () => {
		render(
			<VotesSection searchQuery="" setSearchQuery={setSearchQuery} totalCurrentVotes={0}>
				<div>Children</div>
			</VotesSection>,
		);
		expect(screen.queryByTestId("VotesFilter")).not.toBeInTheDocument();
	});

	it("should render VotesFilter when selectedAddress is provided", () => {
		render(
			<VotesSection
				searchQuery=""
				setSearchQuery={setSearchQuery}
				selectedAddress="someAddress"
				totalCurrentVotes={0}
				selectedFilter="all"
				setSelectedFilter={setSelectedFilter}
			>
				<div>Children</div>
			</VotesSection>,
		);
		expect(screen.getByTestId("VotesFilter")).toBeInTheDocument();
	});

	it("should call setSelectedFilter when changing the filter", async () => {
		render(
			<VotesSection
				searchQuery=""
				setSearchQuery={setSearchQuery}
				selectedAddress="someAddress"
				totalCurrentVotes={0}
				selectedFilter="all"
				setSelectedFilter={setSelectedFilter}
			>
				<div>Children</div>
			</VotesSection>,
		);
		const select = screen.getByTestId("VotesFilter");
		await userEvent.selectOptions(select, "current");
		expect(setSelectedFilter).toHaveBeenCalledWith("current");
	});

	it("should render children correctly", () => {
		render(
			<VotesSection searchQuery="" setSearchQuery={setSearchQuery} totalCurrentVotes={0}>
				<div data-testid="children">Children</div>
			</VotesSection>,
		);
		expect(screen.getByTestId("children")).toBeInTheDocument();
	});

	it.each(["xs", "md"])("should render correctly at breakpoint %s without selectedAddress", (breakpoint) => {
		const { asFragment } = renderResponsive(
			<VotesSection searchQuery="" setSearchQuery={setSearchQuery} totalCurrentVotes={0}>
				<div>Children</div>
			</VotesSection>,
			breakpoint,
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "md"])("should render correctly at breakpoint %s with selectedAddress", (breakpoint) => {
		const { asFragment } = renderResponsive(
			<VotesSection
				searchQuery=""
				setSearchQuery={setSearchQuery}
				selectedAddress="someAddress"
				totalCurrentVotes={0}
				selectedFilter="all"
				setSelectedFilter={setSelectedFilter}
			>
				<div>Children</div>
			</VotesSection>,
			breakpoint,
		);
		expect(asFragment()).toMatchSnapshot();
	});
});
