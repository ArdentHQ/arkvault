import userEvent from "@testing-library/user-event";
import React from "react";

import { render, screen, waitFor } from "@/utils/testing-library";

import { PaginationSearch } from "./PaginationSearch";

describe("PaginationSearch", () => {
	it("should render", async () => {
		const { asFragment } = render(
			<PaginationSearch onClick={vi.fn()} onSelectPage={vi.fn()} totalPages={5}>
				<span data-testid="PaginationSearchToggle">...</span>
			</PaginationSearch>,
		);

		await expect(screen.findByTestId("PaginationSearchToggle")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should show pagination search input", async () => {
		const { asFragment } = render(
			<PaginationSearch onClick={vi.fn()} onSelectPage={vi.fn()} totalPages={5}>
				<span data-testid="PaginationSearchToggle">...</span>
			</PaginationSearch>,
		);

		await expect(screen.findByTestId("PaginationSearchToggle")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		await userEvent.click(screen.getByTestId("PaginationSearchToggle"));

		await expect(screen.findByTestId("PaginationSearchForm")).resolves.toBeVisible();
	});

	it("should show search input and close", async () => {
		const { asFragment } = render(
			<PaginationSearch onClick={vi.fn()} onSelectPage={vi.fn()} totalPages={5}>
				<span data-testid="PaginationSearchToggle">...</span>
			</PaginationSearch>,
		);

		await expect(screen.findByTestId("PaginationSearchToggle")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		await userEvent.click(screen.getByTestId("PaginationSearchToggle"));

		await expect(screen.findByTestId("PaginationSearchForm")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("PaginationSearch__cancel"));

		await waitFor(() => expect(screen.queryByTestId("PaginationSearchForm")).not.toBeInTheDocument());
	});

	it("should type page and emit onSelectPage event", async () => {
		const onSelect = vi.fn();

		const { asFragment } = render(
			<PaginationSearch onClick={vi.fn()} onSelectPage={onSelect} totalPages={5}>
				<span data-testid="PaginationSearchToggle">...</span>
			</PaginationSearch>,
		);

		await expect(screen.findByTestId("PaginationSearchToggle")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		await userEvent.click(screen.getByTestId("PaginationSearchToggle"));

		await expect(screen.findByTestId("PaginationSearchForm")).resolves.toBeVisible();

		await userEvent.type(screen.getByTestId("PaginationSearch__input"), "1");

		await userEvent.click(screen.getByTestId("PaginationSearch__submit"));

		await waitFor(() => expect(screen.getByTestId("PaginationSearch__input")).toHaveValue(1));

		await userEvent.click(screen.getByTestId("PaginationSearch__submit"));

		await waitFor(() => expect(onSelect).toHaveBeenCalledWith(1));
	});

	it("should not allow typing number greater than total pages", async () => {
		const { asFragment } = render(
			<PaginationSearch onClick={vi.fn()} onSelectPage={vi.fn()} totalPages={5}>
				<span data-testid="PaginationSearchToggle">...</span>
			</PaginationSearch>,
		);

		await expect(screen.findByTestId("PaginationSearchToggle")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		await userEvent.click(screen.getByTestId("PaginationSearchToggle"));

		await expect(screen.findByTestId("PaginationSearchForm")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("PaginationSearch__input"));
		await userEvent.type(screen.getByTestId("PaginationSearch__input"), "6");

		await userEvent.click(screen.getByTestId("PaginationSearch__submit"));

		await waitFor(() => expect(screen.getByTestId("PaginationSearch__input")).toHaveValue(5));
	});

	it("should not emit onSelect if nothing is typed", async () => {
		const onSelect = vi.fn();

		const { asFragment } = render(
			<PaginationSearch onClick={vi.fn()} onSelectPage={onSelect} totalPages={5}>
				<span data-testid="PaginationSearchToggle">...</span>
			</PaginationSearch>,
		);

		await expect(screen.findByTestId("PaginationSearchToggle")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		await userEvent.click(screen.getByTestId("PaginationSearchToggle"));

		await expect(screen.findByTestId("PaginationSearchForm")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("PaginationSearch__submit"));

		await waitFor(() => expect(onSelect).not.toHaveBeenCalled());
	});

	it("should not emit onSelect if zero is typed", async () => {
		const onSelect = vi.fn();

		const { asFragment } = render(
			<PaginationSearch onClick={vi.fn()} onSelectPage={onSelect} totalPages={5}>
				<span data-testid="PaginationSearchToggle">...</span>
			</PaginationSearch>,
		);

		await expect(screen.findByTestId("PaginationSearchToggle")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		await userEvent.click(screen.getByTestId("PaginationSearchToggle"));

		await expect(screen.findByTestId("PaginationSearchForm")).resolves.toBeVisible();

		await userEvent.type(screen.getByTestId("PaginationSearch__input"), "0");

		await userEvent.click(screen.getByTestId("PaginationSearch__submit"));

		await waitFor(() => expect(screen.getByTestId("PaginationSearch__input")).toHaveValue(0));

		await userEvent.click(screen.getByTestId("PaginationSearch__submit"));

		await waitFor(() => expect(onSelect).not.toHaveBeenCalled());
	});

	it("should not limit total page if not provided", async () => {
		const onSelect = vi.fn();

		const { asFragment } = render(
			<PaginationSearch onClick={vi.fn()} onSelectPage={onSelect}>
				<span data-testid="PaginationSearchToggle">...</span>
			</PaginationSearch>,
		);

		await expect(screen.findByTestId("PaginationSearchToggle")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		await userEvent.click(screen.getByTestId("PaginationSearchToggle"));

		await expect(screen.findByTestId("PaginationSearchForm")).resolves.toBeVisible();

		await userEvent.paste(screen.getByTestId("PaginationSearch__input"), "100000000");

		await userEvent.click(screen.getByTestId("PaginationSearch__submit"));

		await waitFor(() => expect(screen.getByTestId("PaginationSearch__input")).toHaveValue(100_000_000));

		await userEvent.click(screen.getByTestId("PaginationSearch__submit"));

		await waitFor(() => expect(onSelect).toHaveBeenCalledWith(100_000_000));
	});

	it("should close search input if clicked outside", async () => {
		const onSelect = vi.fn();

		const { asFragment } = render(
			<div>
				<div data-testid="somewhere-outside" className="p-4">
					sample text
				</div>
				<PaginationSearch onClick={vi.fn()} onSelectPage={onSelect}>
					<span data-testid="PaginationSearchToggle">...</span>
				</PaginationSearch>
				,
			</div>,
		);

		await expect(screen.findByTestId("PaginationSearchToggle")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		await userEvent.click(screen.getByTestId("PaginationSearchToggle"));

		await expect(screen.findByTestId("PaginationSearchForm")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("somewhere-outside"));

		await waitFor(() => expect(screen.queryByTestId("PaginationSearchForm")).not.toBeInTheDocument());
	});
});
