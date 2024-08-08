import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { FilterTransactions } from "./FilterTransactions";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

let profile: Contracts.IProfile;

describe("FilterTransactions", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await profile.sync();
	});

	it("should render", () => {
		const { container } = render(<FilterTransactions />);

		expect(screen.getByRole("button", { name: /Type/ })).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it("should render with default selected option", () => {
		const { container } = render(<FilterTransactions defaultSelected={{ label: "All", value: "all" }} />);

		expect(screen.getByRole("button", { name: /Type/ })).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it("should open dropdown list with all transaction types", async () => {
		const { container } = render(<FilterTransactions wallets={profile.wallets().values()} />);

		expect(screen.getByRole("button", { name: /Type/ })).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: /Type/ }));

		await expect(screen.findByTestId("dropdown__option--core-0")).resolves.toBeVisible();

		expect(container).toMatchSnapshot();
	});

	it("should emit onChange", async () => {
		const onSelect = vi.fn();

		render(<FilterTransactions wallets={profile.wallets().values()} onSelect={onSelect} />);

		expect(screen.getByRole("button", { name: /Type/ })).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: /Type/ }));

		await expect(screen.findByTestId("dropdown__option--core-0")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("dropdown__option--core-0"));

		expect(onSelect).toHaveBeenCalledWith(
			{
				label: expect.any(String),
				value: expect.any(String),
			},
			expect.any(String),
		);
	});
});
