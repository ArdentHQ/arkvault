import userEvent from "@testing-library/user-event";
import React from "react";

import { PaginationSearch } from "./PaginationSearch";
import { render, screen, waitFor } from "@/utils/testing-library";

describe("PaginationSearch", () => {
	it("should render", async () => {
		const { asFragment } = render(
			<PaginationSearch onClick={jest.fn()} onSelectPage={jest.fn()} totalPages={5}>
				<span data-testid="PaginationSearchToggle">...</span>
			</PaginationSearch>,
		);

		await expect(screen.findByTestId("PaginationSearchToggle")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should show pagination search input", async () => {
		const { asFragment } = render(
			<PaginationSearch onClick={jest.fn()} onSelectPage={jest.fn()} totalPages={5}>
				<span data-testid="PaginationSearchToggle">...</span>
			</PaginationSearch>,
		);

		await expect(screen.findByTestId("PaginationSearchToggle")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		userEvent.click(screen.getByTestId("PaginationSearchToggle"));

		await expect(screen.findByTestId("PaginationSearchForm")).resolves.toBeVisible();
	});

	it("should show search input and close", async () => {
		const { asFragment } = render(
			<PaginationSearch onClick={jest.fn()} onSelectPage={jest.fn()} totalPages={5}>
				<span data-testid="PaginationSearchToggle">...</span>
			</PaginationSearch>,
		);

		await expect(screen.findByTestId("PaginationSearchToggle")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		userEvent.click(screen.getByTestId("PaginationSearchToggle"));

		await expect(screen.findByTestId("PaginationSearchForm")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("PaginationSearch__cancel"));

		await waitFor(() => expect(screen.queryByTestId("PaginationSearchForm")).not.toBeInTheDocument());
	});

	it("should type page and emit onSelectPage event", async () => {
		const onSelect = jest.fn();

		const { asFragment } = render(
			<PaginationSearch onClick={jest.fn()} onSelectPage={onSelect} totalPages={5}>
				<span data-testid="PaginationSearchToggle">...</span>
			</PaginationSearch>,
		);

		await expect(screen.findByTestId("PaginationSearchToggle")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		userEvent.click(screen.getByTestId("PaginationSearchToggle"));

		await expect(screen.findByTestId("PaginationSearchForm")).resolves.toBeVisible();

		userEvent.type(screen.getByTestId("PaginationSearch__input"), "1");

		userEvent.click(screen.getByTestId("PaginationSearch__submit"));

		await waitFor(() => expect(screen.getByTestId("PaginationSearch__input")).toHaveValue(1));

		userEvent.click(screen.getByTestId("PaginationSearch__submit"));

		await waitFor(() => expect(onSelect).toHaveBeenCalledWith(1));
	});

	it("should not allow typing number greater than total pages", async () => {
		const onSelect = jest.fn();

		const { asFragment } = render(
			<PaginationSearch onClick={jest.fn()} onSelectPage={onSelect} totalPages={5}>
				<span data-testid="PaginationSearchToggle">...</span>
			</PaginationSearch>,
		);

		await expect(screen.findByTestId("PaginationSearchToggle")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		userEvent.click(screen.getByTestId("PaginationSearchToggle"));

		await expect(screen.findByTestId("PaginationSearchForm")).resolves.toBeVisible();

		userEvent.type(screen.getByTestId("PaginationSearch__input"), "6");

		userEvent.click(screen.getByTestId("PaginationSearch__submit"));

		await waitFor(() => expect(screen.getByTestId("PaginationSearch__input")).toHaveValue(5));

		userEvent.click(screen.getByTestId("PaginationSearch__submit"));

		await waitFor(() => expect(onSelect).toHaveBeenCalledWith(5));
	});

	it("should not emit onSelect if nothing is typed", async () => {
		const onSelect = jest.fn();

		const { asFragment } = render(
			<PaginationSearch onClick={jest.fn()} onSelectPage={onSelect} totalPages={5}>
				<span data-testid="PaginationSearchToggle">...</span>
			</PaginationSearch>,
		);

		await expect(screen.findByTestId("PaginationSearchToggle")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		userEvent.click(screen.getByTestId("PaginationSearchToggle"));

		await expect(screen.findByTestId("PaginationSearchForm")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("PaginationSearch__submit"));

		await waitFor(() => expect(onSelect).not.toHaveBeenCalled());
	});

	it("should not emit onSelect if zero is typed", async () => {
		const onSelect = jest.fn();

		const { asFragment } = render(
			<PaginationSearch onClick={jest.fn()} onSelectPage={onSelect} totalPages={5}>
				<span data-testid="PaginationSearchToggle">...</span>
			</PaginationSearch>,
		);

		await expect(screen.findByTestId("PaginationSearchToggle")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		userEvent.click(screen.getByTestId("PaginationSearchToggle"));

		await expect(screen.findByTestId("PaginationSearchForm")).resolves.toBeVisible();

		userEvent.type(screen.getByTestId("PaginationSearch__input"), "0");

		userEvent.click(screen.getByTestId("PaginationSearch__submit"));

		await waitFor(() => expect(screen.getByTestId("PaginationSearch__input")).toHaveValue(0));

		userEvent.click(screen.getByTestId("PaginationSearch__submit"));

		await waitFor(() => expect(onSelect).not.toHaveBeenCalled());
	});

	it("should not limit total page if not provided", async () => {
		const onSelect = jest.fn();

		const { asFragment } = render(
			<PaginationSearch onClick={jest.fn()} onSelectPage={onSelect}>
				<span data-testid="PaginationSearchToggle">...</span>
			</PaginationSearch>,
		);

		await expect(screen.findByTestId("PaginationSearchToggle")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		userEvent.click(screen.getByTestId("PaginationSearchToggle"));

		await expect(screen.findByTestId("PaginationSearchForm")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("PaginationSearch__input"), "100000000");

		userEvent.click(screen.getByTestId("PaginationSearch__submit"));

		await waitFor(() => expect(screen.getByTestId("PaginationSearch__input")).toHaveValue(100_000_000));

		userEvent.click(screen.getByTestId("PaginationSearch__submit"));

		await waitFor(() => expect(onSelect).toHaveBeenCalledWith(100_000_000));
	});

	it("should close search input if clicked outside", async () => {
		const onSelect = jest.fn();

		const { asFragment } = render(
			<div>
				<div data-testid="somewhere-outside" className="p-4">
					sample text
				</div>
				<PaginationSearch onClick={jest.fn()} onSelectPage={onSelect}>
					<span data-testid="PaginationSearchToggle">...</span>
				</PaginationSearch>
				,
			</div>,
		);

		await expect(screen.findByTestId("PaginationSearchToggle")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		userEvent.click(screen.getByTestId("PaginationSearchToggle"));

		await expect(screen.findByTestId("PaginationSearchForm")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("somewhere-outside"));

		await waitFor(() => expect(screen.queryByTestId("PaginationSearchForm")).not.toBeInTheDocument());
	});
});
