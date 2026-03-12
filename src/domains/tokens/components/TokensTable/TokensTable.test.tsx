import { env, getMainsailProfileId, render, screen, renderResponsiveWithRoute, waitFor } from "@/utils/testing-library";
import userEvent from "@testing-library/user-event";

import { TokensTable } from "./TokensTable";
import { LayoutBreakpoint } from "@/types";
import { Contracts } from "@/app/lib/profiles";
import * as useRandomNumberHook from "@/app/hooks/use-random-number";
import * as useWalletActionsHook from "@/domains/wallet/hooks";
import { expect } from "vitest";
import { WalletTokenRepository } from "@/app/lib/profiles/wallet-token.repository";
import { TokenDTO } from "@/app/lib/profiles/token.dto";
import { WalletTokenDTO } from "@/app/lib/profiles/wallet-token.dto";
import { WalletToken } from "@/app/lib/profiles/wallet-token";

let profile: Contracts.IProfile;
let route: string;
let useRandomNumberSpy: vi.SpyInstance;
let tokens: WalletToken[];

const defaultProps = (overrides) => ({
	fetchMore: vi.fn(),
	hasEmptyResults: false,
	hasMore: false,
	isLoadingMore: false,
	isLoadingTokens: false,
	tokens,
	...overrides,
});

describe("TokensTable", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		route = `/profiles/${profile.id()}/tokens`;

		const repo = new WalletTokenRepository(profile.activeNetwork(), profile);

		const wallet = profile.wallets().first();

		repo.create({
			token: new TokenDTO({
				address: "0xabc",
				decimals: 18,
				deploymentHash: "0xabc",
				name: "ABC",
				symbol: "ABC",
				totalSupply: "10000",
			}),
			walletToken: new WalletTokenDTO({
				address: wallet.address(),
				balance: "100",
				tokenAddress: "0xabc",
			}),
		});

		repo.create({
			token: new TokenDTO({
				address: "0xabd",
				decimals: 18,
				deploymentHash: "0xabd",
				name: "DEF",
				symbol: "DEF",
				totalSupply: "20000",
			}),
			walletToken: new WalletTokenDTO({
				address: wallet.address(),
				balance: "200",
				tokenAddress: "0xabd",
			}),
		});

		tokens = repo.values();

		useRandomNumberSpy = vi.spyOn(useRandomNumberHook, "useRandomNumber").mockImplementation(() => 1);
	});

	afterAll(() => {
		useRandomNumberSpy.mockRestore();
	});

	it("should render", () => {
		const { asFragment } = render(
			<TokensTable isManageMode={false} setManageMode={vi.fn()} {...defaultProps({ tokens })} />,
			{
				route,
			},
		);

		expect(screen.getByTestId("TokenList")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs"])("should show no results message if profile has no tokens in %s", async (breakpoint) => {
		const emptyResponseMock = vi.spyOn(profile.tokens(), "aggregated").mockReturnValue({
			hasMorePages: () => false,
			items: () => [],
		});

		const { asFragment } = renderResponsiveWithRoute(
			<TokensTable isManageMode={false} setManageMode={vi.fn()} {...defaultProps({ tokens: [] })} />,
			breakpoint as LayoutBreakpoint,
			{ route },
		);

		await waitFor(() => {
			expect(screen.getAllByTestId("NoResultsMessage")[0]).toBeInTheDocument();
		});

		expect(asFragment()).toMatchSnapshot();
		emptyResponseMock.mockRestore();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should not render in %s", (breakpoint) => {
		const { asFragment } = renderResponsiveWithRoute(
			<TokensTable isManageMode={false} setManageMode={vi.fn()} {...defaultProps({ tokens })} />,
			breakpoint as LayoutBreakpoint,
			{ route },
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should call onClick when a token row is clicked", async () => {
		const user = userEvent.setup();
		const onClickMock = vi.fn();

		render(
			<TokensTable
				isManageMode={false}
				setManageMode={vi.fn()}
				onClick={onClickMock}
				{...defaultProps({ tokens })}
			/>,
			{ route },
		);

		await waitFor(() => {
			expect(screen.getAllByTestId("TokensTableRow")[0]).toBeInTheDocument();
		});

		const row = screen.getAllByTestId("TokensTableRow")[0];
		await user.click(row);

		expect(onClickMock).toHaveBeenCalled();
	});

	it("should call handleSend when send button is clicked", async () => {
		const user = userEvent.setup();
		const handleSendMock = vi.fn();

		vi.spyOn(useWalletActionsHook, "useWalletActions").mockReturnValue({
			handleTokenSend: handleSendMock,
		});

		render(<TokensTable isManageMode={false} setManageMode={vi.fn()} {...defaultProps({ tokens })} />, { route });

		await waitFor(() => {
			expect(screen.getAllByTestId("TokensTableRow")[0]).toBeInTheDocument();
		});

		const sendButton = screen.getAllByRole("button", { name: /send/i })[0];
		await user.click(sendButton);

		expect(handleSendMock).toHaveBeenCalledTimes(1);
	});

	it("should toggle hide dust tokens", async () => {
		render(<TokensTable isManageMode={false} setManageMode={vi.fn()} {...defaultProps({ tokens })} />, {
			route,
		});

		expect(screen.getByTestId("TokenList")).toBeInTheDocument();

		await userEvent.click(screen.getAllByTestId("HideDustTokens")[0]);

		expect(screen.getAllByTestId("HideDustTokens")[0]).toBeEnabled();
	});

	it("should call setManageMode when Manage button is clicked", async () => {
		const setManageModeMock = vi.fn();

		render(<TokensTable isManageMode={false} setManageMode={setManageModeMock} {...defaultProps({ tokens })} />, {
			route,
		});

		await expect(screen.findAllByTestId("TokensTable_Manage")).resolves.toHaveLength(2);

		// switch to manage mode
		await userEvent.click(screen.getAllByTestId("TokensTable_Manage")[0]);

		expect(setManageModeMock).toHaveBeenCalledWith(true);
	});

	it("should call setManageMode when Save button is clicked", async () => {
		const setManageModeMock = vi.fn();

		render(<TokensTable isManageMode={true} setManageMode={setManageModeMock} {...defaultProps({ tokens })} />, {
			route,
		});

		expect(screen.queryByTestId("TokensTable_Manage")).not.toBeInTheDocument();

		// ensure Cancel and Save buttons are visible
		expect(screen.getAllByTestId("TokensTable_Cancel")).toHaveLength(2);
		expect(screen.getAllByTestId("TokensTable_Save")).toHaveLength(2);

		await userEvent.click(screen.getAllByTestId("TokensTable_Save")[0]);

		expect(setManageModeMock).toHaveBeenCalledWith(false);
	});

	it("should call setManageModel when Cancel button is clicked", async () => {
		const setManageModeMock = vi.fn();

		render(<TokensTable isManageMode={true} setManageMode={setManageModeMock} {...defaultProps({ tokens })} />, {
			route,
		});

		expect(screen.queryByTestId("TokensTable_Manage")).not.toBeInTheDocument();

		// ensure Cancel and Save buttons are visible
		expect(screen.getAllByTestId("TokensTable_Cancel")).toHaveLength(2);
		expect(screen.getAllByTestId("TokensTable_Save")).toHaveLength(2);

		await userEvent.click(screen.getAllByTestId("TokensTable_Cancel")[0]);

		expect(setManageModeMock).toHaveBeenCalledWith(false);
	});

	it("should show toggle row visibility", async () => {
		render(
			<TokensTable
				isManageMode={true}
				setManageMode={vi.fn()}
				{...defaultProps({
					tokens: tokens.slice(0, 1),
				})}
			/>,
			{
				route,
			},
		);

		expect(screen.queryByTestId("TokensTable_Manage")).not.toBeInTheDocument();

		const getCheckbox = () => screen.getByTestId("TokenRow_VisibilityToggle");

		await waitFor(() => {
			expect(getCheckbox()).toBeChecked();
		});

		await userEvent.click(getCheckbox());

		expect(getCheckbox()).not.toBeChecked();

		await userEvent.click(getCheckbox());

		expect(getCheckbox()).toBeChecked();
	});

	it("should open delete token confirmation modal when delete button is clicked", async () => {
		const token = tokens.slice(0, 1)[0];

		vi.spyOn(profile, "whitelistedContractAddresses").mockReturnValue([token.token().address()]);

		render(
			<TokensTable
				isManageMode={true}
				setManageMode={vi.fn()}
				{...defaultProps({
					tokens: [token],
				})}
			/>,
			{
				route,
			},
		);

		expect(screen.queryByTestId("TokensTable_Manage")).not.toBeInTheDocument();

		// Verify modal is not visible initially
		expect(screen.queryByText("Delete Token")).not.toBeInTheDocument();

		await expect(screen.findByTestId("TokenRow_DeleteToken")).resolves.toBeVisible();

		// Click delete button to open modal
		const deleteButton = screen.getByTestId("TokenRow_DeleteToken");
		await userEvent.click(deleteButton);

		// Verify modal is open
		await expect(screen.findByText("Delete Token")).resolves.toBeVisible();
	});

	it("should close delete token confirmation modal when onClose is called", async () => {
		render(
			<TokensTable
				isManageMode={true}
				setManageMode={vi.fn()}
				{...defaultProps({
					tokens: tokens.slice(0, 1),
				})}
			/>,
			{
				route,
			},
		);

		expect(screen.queryByTestId("TokensTable_Manage")).not.toBeInTheDocument();

		await expect(screen.findByTestId("TokenRow_DeleteToken")).resolves.toBeVisible();

		// Click delete button to open modal
		const deleteButton = screen.getByTestId("TokenRow_DeleteToken");
		await userEvent.click(deleteButton);

		// Verify modal is open
		await expect(screen.findByText("Delete Token")).resolves.toBeVisible();

		// Click cancel button to close modal
		const cancelButton = screen.getByTestId("DeleteResource__cancel-button");
		await userEvent.click(cancelButton);

		// Verify modal is closed
		await waitFor(() => {
			expect(screen.queryByText("Delete Token")).not.toBeInTheDocument();
		});
	});
});
