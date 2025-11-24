import userEvent from "@testing-library/user-event";
import React from "react";

import { VotesFilter } from "./VotesFilter";
import { render, screen, waitFor, act } from "@/utils/testing-library";
import { within } from "@testing-library/react";

const toggler = "dropdown__toggle-VotesFilter";
const dropdownBody = "dropdown__content-VotesFilter";

describe("VotesFilter", () => {
	it("should render", () => {
		const { asFragment } = render(<VotesFilter totalCurrentVotes={1} />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render default", async () => {
		const { asFragment } = render(<VotesFilter totalCurrentVotes={1} />);

		await userEvent.click(screen.getByTestId(toggler));

		await expect(screen.findByTestId(dropdownBody)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with current option selected", async () => {
		const { asFragment } = render(<VotesFilter totalCurrentVotes={1} selectedOption="current" />);

		await userEvent.click(screen.getByTestId(toggler));

		await expect(screen.findByTestId(dropdownBody)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with disabled current option", async () => {
		const { asFragment } = render(<VotesFilter totalCurrentVotes={0} />);

		await userEvent.click(screen.getByTestId(toggler));

		await expect(screen.findByTestId(dropdownBody)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should emit onChange", async () => {
		const onChange = vi.fn();
		render(<VotesFilter totalCurrentVotes={2} onChange={onChange} />);

		await userEvent.click(screen.getByTestId(toggler));

		await expect(screen.findByTestId(dropdownBody)).resolves.toBeVisible();

		const filterOptionCurrent = screen.getByTestId("VotesFilter__option--current");
		await userEvent.click(filterOptionCurrent);

		await waitFor(() => expect(onChange).toHaveBeenCalledWith("current"));

		const filterOptionAll = screen.getByTestId("VotesFilter__option--all");
		await userEvent.click(filterOptionAll);

		await waitFor(() => expect(onChange).toHaveBeenCalledWith("all"));
	});

	it("should emit onChange with keyboard", async () => {
		const onChange = vi.fn();
		render(<VotesFilter totalCurrentVotes={2} onChange={onChange} />);

		await userEvent.click(screen.getByTestId(toggler));

		await expect(screen.findByTestId(dropdownBody)).resolves.toBeVisible();

		const currentOption = within(screen.getByTestId("VotesFilter__option--current")).getByRole("checkbox");

		act(() => {
			currentOption.focus();
		});

		await userEvent.keyboard("{enter}");

		await waitFor(() => expect(onChange).toHaveBeenCalledWith("current"));

		const allOption = within(screen.getByTestId("VotesFilter__option--all")).getByRole("checkbox");
		allOption.focus();

		await userEvent.keyboard("{Spacebar}");

		await waitFor(() => expect(onChange).toHaveBeenCalledWith("all"));
	});
});
