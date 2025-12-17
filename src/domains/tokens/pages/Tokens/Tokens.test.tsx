import { env, getMainsailProfileId, render, waitFor, screen } from "@/utils/testing-library";

import { Contracts } from "@/app/lib/profiles";
import { Tokens } from "./Tokens";
import userEvent from "@testing-library/user-event";

let profile: Contracts.IProfile;
let route: string;

describe("Tokens", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		route = `/profiles/${profile.id()}/tokens`;
	});

	it("should render", async () => {
		const { asFragment } = render(<Tokens />, {
			route,
		});

		expect(screen.getByTestId("TokensHeader")).toBeInTheDocument();
		expect(screen.getByTestId("TokenList")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should switch tabs", async () => {
		render(<Tokens />, {
			route,
		});

		expect(screen.getByTestId("TokensHeader")).toBeInTheDocument();
		expect(screen.getByTestId("TokenList")).toBeInTheDocument();

		const tokensTab = screen.getAllByTestId("tabs__tab-button-tokens")[0];
		const transactionsTab = screen.getAllByTestId("tabs__tab-button-transactions")[0];

		await waitFor(() => {
			expect(tokensTab).toBeInTheDocument();
		});

		await userEvent.click(transactionsTab);

		expect(screen.queryByTestId("TokenList")).not.toBeInTheDocument();
	});
});
