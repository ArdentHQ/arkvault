import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { FilterTransactions } from "./FilterTransactions";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

let profile: Contracts.IProfile;

describe("FilterTransactions", () => {
	const allTypes = [
		"delegateRegistration",
		"delegateResignation",
		"multiPayment",
		"multiSignature",
		"transfer",
		"vote",
	];

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

		await expect(screen.findAllByTestId("FilterOption")).resolves.toHaveLength(5);

		expect(container).toMatchSnapshot();
	});

	it("should emit onChange", async () => {
		const onSelect = vi.fn();

		render(<FilterTransactions wallets={profile.wallets().values()} onSelect={onSelect} />);

		expect(screen.getByRole("button", { name: /Type/ })).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: /Type/ }));

		await expect(screen.findAllByTestId("FilterOption")).resolves.toHaveLength(5);

		await userEvent.click(screen.getAllByTestId("FilterOption")[0]);

		expect(onSelect).toHaveBeenCalled();
	});

	it("should select all type", async () => {
		const onSelect = vi.fn();
		render(<FilterTransactions wallets={profile.wallets().values()} onSelect={onSelect} />);

		expect(screen.getByRole("button", { name: /Type/ })).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: /Type/ }));

		await expect(screen.findAllByTestId("FilterOption")).resolves.toHaveLength(5);

		const options = screen.getAllByTestId("FilterOption__checkbox");

		await userEvent.click(options.at(0));

		expect(onSelect).toHaveBeenCalledWith(
			{
				label: expect.any(String),
				value: expect.any(String),
			},
			undefined,
			allTypes,
		);
	});

	it("should select vote type", async () => {
		const onSelect = vi.fn();
		render(<FilterTransactions wallets={profile.wallets().values()} onSelect={onSelect} />);

		expect(screen.getByRole("button", { name: /Type/ })).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: /Type/ }));

		await expect(screen.findAllByTestId("FilterOption")).resolves.toHaveLength(5);

		const options = screen.getAllByTestId("FilterOption__checkbox");

		await userEvent.click(options.at(2));

		expect(onSelect).toHaveBeenCalledWith(
			{
				label: expect.any(String),
				value: expect.any(String),
			},
			undefined,
			["vote"],
		);
	});

	it("should deselect vote type", async () => {
		const onSelect = vi.fn();
		render(
			<FilterTransactions
				wallets={profile.wallets().values()}
				onSelect={onSelect}
				selectedTransactionTypes={["vote"]}
			/>,
		);

		expect(screen.getByRole("button", { name: /Type/ })).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: /Type/ }));

		await expect(screen.findAllByTestId("FilterOption")).resolves.toHaveLength(5);

		const options = screen.getAllByTestId("FilterOption__checkbox");

		await userEvent.click(options.at(2));

		expect(onSelect).toHaveBeenCalledWith(
			{
				label: expect.any(String),
				value: expect.any(String),
			},
			undefined,
			[],
		);
	});

	it("should select multiPayment type", async () => {
		const onSelect = vi.fn();
		render(<FilterTransactions wallets={profile.wallets().values()} onSelect={onSelect} />);

		expect(screen.getByRole("button", { name: /Type/ })).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: /Type/ }));

		await expect(screen.findAllByTestId("FilterOption")).resolves.toHaveLength(5);

		const options = screen.getAllByTestId("FilterOption__checkbox");

		await userEvent.click(options.at(3));

		expect(onSelect).toHaveBeenCalledWith(
			{
				label: expect.any(String),
				value: expect.any(String),
			},
			undefined,
			["multiPayment"],
		);
	});

	it("should deselect multiPayment type", async () => {
		const onSelect = vi.fn();
		render(
			<FilterTransactions
				wallets={profile.wallets().values()}
				onSelect={onSelect}
				selectedTransactionTypes={["multiPayment"]}
			/>,
		);

		expect(screen.getByRole("button", { name: /Type/ })).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: /Type/ }));

		await expect(screen.findAllByTestId("FilterOption")).resolves.toHaveLength(5);

		const options = screen.getAllByTestId("FilterOption__checkbox");

		await userEvent.click(options.at(3));

		expect(onSelect).toHaveBeenCalledWith(
			{
				label: expect.any(String),
				value: expect.any(String),
			},
			undefined,
			[],
		);
	});

	it("should deselect all type", async () => {
		const onSelect = vi.fn();
		render(
			<FilterTransactions
				wallets={profile.wallets().values()}
				onSelect={onSelect}
				selectedTransactionTypes={allTypes}
			/>,
		);

		expect(screen.getByRole("button", { name: /Type/ })).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: /Type/ }));

		await expect(screen.findAllByTestId("FilterOption")).resolves.toHaveLength(5);

		const options = screen.getAllByTestId("FilterOption__checkbox");

		await userEvent.click(options.at(0));

		expect(onSelect).toHaveBeenCalledWith(
			{
				label: expect.any(String),
				value: expect.any(String),
			},
			undefined,
			[],
		);
	});

	it("should select others type", async () => {
		const onSelect = vi.fn();

		render(<FilterTransactions wallets={profile.wallets().values()} onSelect={onSelect} />);

		expect(screen.getByRole("button", { name: /Type/ })).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: /Type/ }));

		await expect(screen.findAllByTestId("FilterOption")).resolves.toHaveLength(5);

		const options = screen.getAllByTestId("FilterOption__checkbox");

		await userEvent.click(options.at(-1));

		expect(onSelect).toHaveBeenCalledWith(
			{
				label: expect.any(String),
				value: expect.any(String),
			},
			undefined,
			["delegateRegistration", "delegateResignation", "multiSignature"],
		);
	});

	it("should deselect others type", async () => {
		const onSelect = vi.fn();

		render(
			<FilterTransactions
				wallets={profile.wallets().values()}
				onSelect={onSelect}
				selectedTransactionTypes={["delegateRegistration", "delegateResignation", "multiSignature"]}
			/>,
		);

		expect(screen.getByRole("button", { name: /Type/ })).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: /Type/ }));

		await expect(screen.findAllByTestId("FilterOption")).resolves.toHaveLength(5);

		const options = screen.getAllByTestId("FilterOption__checkbox");

		await userEvent.click(options.at(-1));

		expect(onSelect).toHaveBeenCalledWith(
			{
				label: expect.any(String),
				value: expect.any(String),
			},
			undefined,
			[],
		);
	});

	it("should select transfer type", async () => {
		const onSelect = vi.fn();

		render(
			<FilterTransactions
				wallets={profile.wallets().values()}
				onSelect={onSelect}
				selectedTransactionTypes={[]}
			/>,
		);

		expect(screen.getByRole("button", { name: /Type/ })).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: /Type/ }));

		await expect(screen.findAllByTestId("FilterOption")).resolves.toHaveLength(5);

		const options = screen.getAllByTestId("FilterOption__checkbox");

		await userEvent.click(options.at(1));

		expect(onSelect).toHaveBeenCalledWith(
			{
				label: expect.any(String),
				value: expect.any(String),
			},
			undefined,
			["transfer"],
		);
	});

	it("should deselect transfer type", async () => {
		const onSelect = vi.fn();

		render(
			<FilterTransactions
				wallets={profile.wallets().values()}
				onSelect={onSelect}
				selectedTransactionTypes={["transfer"]}
			/>,
		);

		expect(screen.getByRole("button", { name: /Type/ })).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: /Type/ }));

		await expect(screen.findAllByTestId("FilterOption")).resolves.toHaveLength(5);

		const options = screen.getAllByTestId("FilterOption__checkbox");

		await userEvent.click(options.at(1));

		expect(onSelect).toHaveBeenCalledWith(
			{
				label: expect.any(String),
				value: expect.any(String),
			},
			undefined,
			[],
		);
	});
});
