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

		const addressButton = screen.getByTestId("ShowAddressesPanel");
		await waitFor(() => {
			expect(screen.getByTestId("ShowAddressesPanel")).toBeInTheDocument();
		});

		await userEvent.click(addressButton);

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

	it("should open token detail sidepanel when a token row is clicked", async () => {
		const user = userEvent.setup();

		render(<Tokens />, { route });

		await waitFor(() => {
			expect(screen.getByTestId("TokenList")).toBeInTheDocument();
		});

		// Verify sidepanel is not open initially
		expect(screen.queryByTestId("TokenDetailSidepanel")).not.toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getAllByTestId("TokensTableRow")[0]).toBeInTheDocument();
		});

		const tokenRow = screen.getAllByTestId("TokensTableRow")[0];
		await user.click(tokenRow);

		await waitFor(() => {
			expect(screen.getByTestId("TokenDetailSidepanel")).toBeInTheDocument();
		});
	});
});
