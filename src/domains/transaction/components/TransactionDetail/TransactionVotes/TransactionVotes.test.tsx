import { ReadOnlyWallet } from "@ardenthq/sdk-profiles";
import React from "react";

import { render, screen, waitFor } from "@/utils/testing-library";

import { TransactionVotes } from "./TransactionVotes";

const address = "test-address";
const username = "test-username";

const votes = [
	// @ts-ignore
	new ReadOnlyWallet({
		address,
		username,
	}),
];

describe("TransactionVotes", () => {
	it("should render loading state", () => {
		const { container } = render(<TransactionVotes isLoading={true} />);

		expect(screen.getByTestId("TransactionVotes__skeleton")).toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});

	it("should render with votes", async () => {
		const { container } = render(<TransactionVotes votes={votes} />);

		await expect(screen.findByText("Vote")).resolves.toBeVisible();
		await expect(screen.findByText(username)).resolves.toBeVisible();

		expect(container).toMatchSnapshot();
	});

	it("should render with unvotes", async () => {
		const { container } = render(<TransactionVotes unvotes={votes} />);

		await expect(screen.findByText("Unvote")).resolves.toBeVisible();
		await expect(screen.findByText(username)).resolves.toBeVisible();

		expect(container).toMatchSnapshot();
	});

	it("should render with votes and unvotes", async () => {
		const { container } = render(<TransactionVotes votes={votes} unvotes={votes} />);

		await expect(screen.findByText("Vote")).resolves.toBeVisible();
		await expect(screen.findByText("Unvote")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getAllByText(username)).toHaveLength(2));

		expect(container).toMatchSnapshot();
	});

	it("should render with multiple votes and unvotes", async () => {
		const { container } = render(<TransactionVotes votes={[...votes, ...votes]} unvotes={[...votes, ...votes]} />);

		await expect(screen.findByText("Votes (2)")).resolves.toBeVisible();
		await expect(screen.findByText("Unvotes (2)")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getAllByText(username)).toHaveLength(4));

		expect(container).toMatchSnapshot();
	});
});
