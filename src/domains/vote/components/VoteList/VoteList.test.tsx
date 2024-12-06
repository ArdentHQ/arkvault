import { Contracts, ReadOnlyWallet } from "@ardenthq/sdk-profiles";
import React from "react";

import { VoteList } from "./VoteList";
import { data } from "@/tests/fixtures/coins/ark/devnet/delegates.json";
import { render, renderResponsive } from "@/utils/testing-library";

let votes: Contracts.IReadOnlyWallet[];
let votesWithAmount: Contracts.VoteRegistryItem[];

describe("VoteList", () => {
	beforeAll(() => {
		const delegates = [0, 1, 2].map(
			(index) =>
				new ReadOnlyWallet({
					address: data[index].address,
					explorerLink: "",
					governanceIdentifier: "address",
					isDelegate: true,
					isResignedDelegate: false,
					publicKey: data[index].publicKey,
					username: data[index].username,
				}),
		);

		votes = delegates;

		votesWithAmount = delegates.map((validator) => ({
			amount: 10,
			wallet: validator,
		}));
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint) => {
		const { container, asFragment } = renderResponsive(<VoteList currency="BTC" votes={votes} />, breakpoint);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render with amount in %s", (breakpoint) => {
		const { container, asFragment } = renderResponsive(
			<VoteList currency="BTC" votes={votesWithAmount} />,
			breakpoint,
		);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with empty list", () => {
		const { container, asFragment } = render(<VoteList currency="BTC" votes={[]} />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
