import { Contracts, ReadOnlyWallet } from "@/app/lib/profiles";
import React from "react";

import { VoteList } from "./VoteList";
import { data } from "@/tests/fixtures/coins/mainsail/devnet/validators.json";
import { render, renderResponsive } from "@/utils/testing-library";
import { env, getMainsailProfileId } from "@/utils/testing-library";

let votes: Contracts.IReadOnlyWallet[];
let votesWithAmount: Contracts.VoteRegistryItem[];

describe("VoteList", () => {
	let profile: Contracts.IProfile;

	beforeAll(() => {
		profile = env.profiles().findById(getMainsailProfileId());
		const validators = [0, 1, 2].map(
			(index) =>
				new ReadOnlyWallet(
					{
						address: data[index].address,
						explorerLink: "",
						governanceIdentifier: "address",
						isResignedValidator: false,
						isValidator: true,
						publicKey: data[index].publicKey,
						username: data[index].username,
					},
					profile,
				),
		);

		votes = validators;

		votesWithAmount = validators.map((validator) => ({
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
