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

	it("should send token through token details sidepanel", async () => {
		const user = userEvent.setup();

		render(<Tokens />, { route });

		await waitFor(() => {
			expect(screen.getByTestId("TokenList")).toBeInTheDocument();
		});

		expect(screen.queryByTestId("TokenDetailSidepanel")).not.toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getAllByTestId("TokensTableRow")[0]).toBeInTheDocument();
		});

		const tokenRow = screen.getAllByTestId("TokensTableRow")[0];
		await user.click(tokenRow);

		await waitFor(() => {
			expect(screen.getByTestId("TokenDetailSidepanel")).toBeInTheDocument();
		});

		const sendTokenButton = screen.getAllByTestId("TokenDetailSidepanel__send-button")[0];
		await user.click(sendTokenButton);

		await waitFor(() => expect(screen.queryByTestId("TokenDetailSidepanel")).not.toBeInTheDocument());

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

	it("should close confirmation modal and stay in manage mode when cancel is clicked", async () => {
		const user = userEvent.setup();

		render(<Tokens />, { route });

		await waitFor(() => {
			expect(screen.getByTestId("TokenList")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getAllByTestId("TokensTable_Manage")[0]).toBeInTheDocument();
		});

		await user.click(screen.getAllByTestId("TokensTable_Manage")[0]);

		await waitFor(() => {
			expect(screen.getAllByTestId("TokensTable_Save")[0]).toBeInTheDocument();
		});

		const addressButton = screen.getByTestId("ShowAddressesPanel");
		await user.click(addressButton);

		// Verify confirmation modal is open
		await waitFor(() => {
			expect(screen.getByTestId("ConfirmationModal")).toBeInTheDocument();
		});

		const cancelButton = screen.getByTestId("ConfirmationModal__no-button");
		await user.click(cancelButton);

		await waitFor(() => {
			expect(screen.queryByTestId("ConfirmationModal")).not.toBeInTheDocument();
		});

		expect(screen.getAllByTestId("TokensTable_Save")[0]).toBeInTheDocument();
	});

	it("should close confirmation modal and exit manage mode when confirm is clicked", async () => {
		const user = userEvent.setup();

		render(<Tokens />, { route });

		await waitFor(() => {
			expect(screen.getByTestId("TokenList")).toBeInTheDocument();
		});

		// Enter manage mode
		await waitFor(() => {
			expect(screen.getAllByTestId("TokensTable_Manage")[0]).toBeInTheDocument();
		});

		await user.click(screen.getAllByTestId("TokensTable_Manage")[0]);

		await waitFor(() => {
			expect(screen.getAllByTestId("TokensTable_Save")[0]).toBeInTheDocument();
		});

		await user.click(screen.getByTestId("ShowAddressesPanel"));

		await waitFor(() => {
			expect(screen.getByTestId("ConfirmationModal")).toBeInTheDocument();
		});

		const confirmButton = screen.getByTestId("ConfirmationModal__yes-button");
		await user.click(confirmButton);

		await waitFor(() => {
			expect(screen.queryByTestId("ConfirmationModal")).not.toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getAllByTestId("TokensTable_Manage")[0]).toBeInTheDocument();
		});
	});
});
