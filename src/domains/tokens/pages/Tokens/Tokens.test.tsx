import { env, getMainsailProfileId, render, waitFor, screen } from "@/utils/testing-library";

import { Contracts } from "@/app/lib/profiles";
import { Tokens } from "./Tokens";
import userEvent from "@testing-library/user-event";
import { BigNumber } from "@/app/lib/helpers";
import { expect, vi } from "vitest";
import { requestMock, server } from "@/tests/mocks/server";
import * as useProfileTokensMock from "@/domains/tokens/pages/hooks/use-profile-tokens";
import React from "react";

let profile: Contracts.IProfile;
let route: string;

describe("Tokens", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		route = `/profiles/${profile.id()}/tokens`;
	});

	it("should render", async () => {
		render(<Tokens />, {
			route,
		});

		const addressButton = screen.getByTestId("ShowAddressesPanel");
		await waitFor(() => {
			expect(screen.getByTestId("ShowAddressesPanel")).toBeInTheDocument();
		});

		await userEvent.click(addressButton);

		expect(screen.getByTestId("TokensHeader")).toBeInTheDocument();
		expect(screen.getByTestId("TokenList")).toBeInTheDocument();
	});

	it("should switch tabs", async () => {
		render(<Tokens />, {
			route,
		});

		expect(screen.getByTestId("TokensHeader")).toBeInTheDocument();
		expect(screen.getByTestId("TokenList")).toBeInTheDocument();

		const tokensTab = screen.getAllByTestId("tabs__tab-button-tokens")[0];
		const transfersTab = screen.getAllByTestId("tabs__tab-button-tokenTransfers")[0];

		await waitFor(() => {
			expect(tokensTab).toBeInTheDocument();
		});

		await userEvent.click(transfersTab);

		expect(screen.queryByTestId("TokenList")).not.toBeInTheDocument();
		expect(screen.getByTestId("TransactionTable")).toBeInTheDocument();
	});

	it("should send token through token details sidepanel", async () => {
		const mockFirstPage = {
			hasMorePages: () => true,
			items: () => [
				{
					address: () => profile.wallets().first().address(),
					balance: () => "1000",
					contractExplorerLink: () => "test",
					token: () => ({
						address: () => "0xToken1",
						decimals: () => 18,
						displaySymbol: () => "TKN1",
						name: () => "Token 1",
						symbol: () => "TKN1",
						totalSupply: () => BigNumber.make(100),
					}),
				},
			],
		};

		vi.spyOn(profile.tokens(), "aggregated").mockReturnValue(mockFirstPage as any);

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

	it("should close token detail side panel when cancel button is clicked", async () => {
		const user = userEvent.setup();

		render(<Tokens />, { route });

		await waitFor(() => {
			expect(screen.getByTestId("TokenList")).toBeInTheDocument();
		});

		// Verify side panel is not open initially
		expect(screen.queryByTestId("TokenDetailSidepanel")).not.toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getAllByTestId("TokensTableRow")[0]).toBeInTheDocument();
		});

		const tokenRow = screen.getAllByTestId("TokensTableRow")[0];
		await user.click(tokenRow);

		await waitFor(() => {
			expect(screen.getByTestId("TokenDetailSidepanel")).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId("TokenDetailSidepanel__close-button"));

		await waitFor(() => {
			expect(screen.queryByTestId("TokenDetailSidepanel")).not.toBeInTheDocument();
		});
	});

	it("should open token detail side panel when a token row is clicked", async () => {
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

	it("should refresh tokens when a token added", async () => {
		const user = userEvent.setup();

		const refreshMock = vi.fn();

		vi.spyOn(useProfileTokensMock, "useProfileTokens").mockReturnValue({
			fetchMore: vi.fn(),
			hasEmptyResults: false,
			hasMore: false,
			isLoadingMore: false,
			isLoadingTokens: false,
			isReloading: false,
			refresh: refreshMock,
			reload: vi.fn(),
			setSortBy: vi.fn(),
			sortBy: { column: "date", desc: true },
			tokens: [],
		});

		render(<Tokens />, { route });

		await waitFor(() => {
			expect(screen.getByTestId("TokenList")).toBeInTheDocument();
		});

		await user.click(screen.getByText("Add Token"));

		await waitFor(() => {
			expect(screen.getByTestId("AddTokenSidePanel")).toBeInTheDocument();
		});

		const validAddress = "0x12f6677522292654a231007c47b07971a7610904";

		server.use(requestMock(`https://dwallets-evm.mainsailhq.com/api/tokens/${validAddress}`, {
			data: {
				address: "0x12f6677522292654a231007c47b07971a7610908",
				decimals: 18,
				deploymentHash: "7a9052d9d5fd73f106cbf6728f0661054de13a03a2c199c51c1a11f547890d0c",
				name: "SamCoin",
				symbol: "SAM",
				totalSupply: "12345678912345000000000000000000",
			},
		}));

		await user.clear(screen.getByTestId("Input__ContractAddress"));
		await user.paste(validAddress);

		await expect(screen.findByText(/SamCoin/)).resolves.toBeVisible();

		const continueButton = () => screen.getByTestId("AddToken__save-button");
		expect(continueButton()).toBeEnabled();

		await user.click(continueButton());

		await waitFor(() => {
			expect(refreshMock).toHaveBeenCalled();
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
