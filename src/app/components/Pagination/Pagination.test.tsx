import userEvent from "@testing-library/user-event";
import React from "react";

import { Pagination } from "./Pagination";
import { render, renderResponsive, screen, waitFor } from "@/utils/testing-library";

const handleSelectPage = vi.fn();

describe("Pagination", () => {
	beforeEach(() => {
		handleSelectPage.mockReset();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint) => {
		const { asFragment } = renderResponsive(
			<Pagination totalCount={12} onSelectPage={handleSelectPage} />,
			breakpoint,
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should not render in %s", (breakpoint) => {
		const { asFragment } = renderResponsive(
			<Pagination totalCount={4} itemsPerPage={4} onSelectPage={handleSelectPage} currentPage={1} />,
			breakpoint,
		);

		expect(screen.queryByTestId("Pagination")).toBeNull();
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render pagination search buttons in %s", (breakpoint) => {
		const { asFragment } = renderResponsive(
			<Pagination totalCount={10} itemsPerPage={1} onSelectPage={handleSelectPage} currentPage={5} />,
			breakpoint,
		);

		expect(screen.getAllByTestId("PaginationSearchButton")).toHaveLength(1);

		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should handle first page click in %s", async (breakpoint) => {
		const { asFragment } = renderResponsive(
			<Pagination totalCount={150} itemsPerPage={1} onSelectPage={handleSelectPage} currentPage={101} />,
			breakpoint,
		);

		await userEvent.click(screen.getByTestId("Pagination__first"));

		expect(handleSelectPage).toHaveBeenCalledWith(1);
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should handle previous page click in %s", async (breakpoint) => {
		const { asFragment } = renderResponsive(
			<Pagination totalCount={40} itemsPerPage={4} onSelectPage={handleSelectPage} currentPage={9} />,
			breakpoint,
		);

		await userEvent.click(screen.getByTestId("Pagination__previous"));

		expect(handleSelectPage).toHaveBeenCalledWith(8);
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should handle next page click in %s", async (breakpoint) => {
		const { asFragment } = renderResponsive(
			<Pagination totalCount={12} itemsPerPage={4} onSelectPage={handleSelectPage} currentPage={2} />,
			breakpoint,
		);

		await userEvent.click(screen.getByTestId("Pagination__next"));

		expect(handleSelectPage).toHaveBeenCalledWith(3);
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should handle last page click in %s", async (breakpoint) => {
		const { asFragment } = renderResponsive(
			<Pagination totalCount={30} itemsPerPage={1} onSelectPage={handleSelectPage} currentPage={1} />,
			breakpoint,
		);

		await userEvent.click(screen.getByTestId("Pagination__last"));

		expect(handleSelectPage).toHaveBeenCalledWith(30);
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])(
		"should handle pagination search icon click properly in %s",
		async (breakpoint) => {
			const { asFragment } = renderResponsive(
				<Pagination totalCount={30} itemsPerPage={1} onSelectPage={handleSelectPage} currentPage={15} />,
				breakpoint,
			);

			await userEvent.click(screen.getAllByTestId("PaginationSearchButton")[0]);

			expect(screen.getByTestId("PaginationSearch__input")).toBeInTheDocument();
			expect(asFragment()).toMatchSnapshot();
		},
	);

	it.each(["xs", "sm", "md", "lg", "xl"])(
		"should handle pagination search icon click properly in %s",
		async (breakpoint) => {
			const { asFragment } = renderResponsive(
				<Pagination totalCount={30} itemsPerPage={1} onSelectPage={handleSelectPage} currentPage={15} />,
				breakpoint,
			);

			await userEvent.click(screen.getByTestId("PaginationSearchButton"));

			expect(screen.getByTestId("PaginationSearch__input")).toBeInTheDocument();
			expect(asFragment()).toMatchSnapshot();
		},
	);

	it("should handle page selection from pagination search properly", async () => {
		render(<Pagination totalCount={10} itemsPerPage={1} onSelectPage={handleSelectPage} currentPage={1} />);

		const searchButton = screen.getByTestId("PaginationSearchButton");

		await userEvent.click(searchButton);

		await userEvent.type(screen.getByTestId("PaginationSearch__input"), "5");

		await waitFor(() => expect(screen.getByTestId("PaginationSearch__input")).toHaveValue(5));

		await userEvent.click(screen.getByTestId("PaginationSearch__submit"));

		await waitFor(() => expect(handleSelectPage).toHaveBeenCalledWith(5));
	});

	it("should handle close button from pagination search properly", async () => {
		render(<Pagination totalCount={10} itemsPerPage={1} onSelectPage={handleSelectPage} currentPage={1} />);

		const searchButton = screen.getByTestId("PaginationSearchButton");

		await userEvent.click(searchButton);

		expect(screen.getByTestId("PaginationSearch__input")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("PaginationSearch__cancel"));
		await waitFor(() => expect(handleSelectPage).not.toHaveBeenCalled());
	});
});
