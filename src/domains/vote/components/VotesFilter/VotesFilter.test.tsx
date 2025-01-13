import userEvent from "@testing-library/user-event";
import React from "react";

import { VotesFilter } from "./VotesFilter";
import { render, screen, waitFor } from "@/utils/testing-library";

describe("VotesFilter", () => {
	it("should render", () => {
		const { asFragment } = render(<VotesFilter totalCurrentVotes={1} />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render default", async () => {
		const { asFragment } = render(<VotesFilter totalCurrentVotes={1} />);

		await userEvent.click(screen.getByTestId("dropdown__toggle-VotesFilter"));

		await expect(screen.findByTestId("dropdown__content-VotesFilter")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with current option selected", async () => {
		const { asFragment } = render(<VotesFilter totalCurrentVotes={1} selectedOption="current" />);

		await userEvent.click(screen.getByTestId("dropdown__toggle-VotesFilter"));

		await expect(screen.findByTestId("dropdown__content-VotesFilter")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with disabled current option", async () => {
		const { asFragment } = render(<VotesFilter totalCurrentVotes={0} />);

		await userEvent.click(screen.getByTestId("dropdown__toggle-VotesFilter"));

		await expect(screen.findByTestId("dropdown__content-VotesFilter")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should emit onChange", async () => {
		const onChange = vi.fn();
		render(<VotesFilter totalCurrentVotes={2} onChange={onChange} />);

		await userEvent.click(screen.getByTestId("dropdown__toggle-VotesFilter"));

		await expect(screen.findByTestId("dropdown__content-VotesFilter")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("VotesFilter__option--current"));

		await waitFor(() => expect(onChange).toHaveBeenCalledWith("current"));

		await userEvent.click(screen.getByTestId("VotesFilter__option--all"));

		await waitFor(() => expect(onChange).toHaveBeenCalledWith("all"));
	});
});
