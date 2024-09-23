import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";
import { WalletListItem } from "./WalletListItem";
import * as useWalletActionsModule from "@/domains/wallet/hooks/use-wallet-actions";

import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";
import * as isFullySyncedModule from "@/domains/wallet/utils/is-fully-synced";

const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;
const history = createHashHistory();

const handleOpen = vi.fn();
const handleSend = vi.fn();

const useWalletActionsReturn = {
	activeModal: "wallet-name",
	handleOpen,
	handleSend,
} as unknown as ReturnType<typeof useWalletActionsModule.useWalletActions>;

vi.spyOn(useWalletActionsModule, "useWalletActions").mockReturnValue(useWalletActionsReturn);

describe("WalletListItem", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeAll(() => {
		history.push(dashboardURL);
	});

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		wallet = profile.wallets().findById("ac38fe6d-4b67-4ef1-85be-17c5f6841129");
		wallet.data().set(Contracts.WalletFlag.Starred, true);
		wallet.data().set(Contracts.WalletData.DerivationPath, "0");

		await env.profiles().restore(profile);
		await profile.sync();
	});

	afterEach(() => {
		handleOpen.mockRestore();
		handleSend.mockRestore();
	});

	const TableWrapper = ({ children }) => (
		<table>
			<tbody>{children}</tbody>
		</table>
	);

	it.each([true, false])("should render when isLargeScreen = %s", async (isLargeScreen: boolean) => {
		const Wrapper = isLargeScreen ? TableWrapper : React.Fragment;

		const { container } = render(
			<Wrapper>
				<Route path="/profiles/:profileId/dashboard">
					<WalletListItem wallet={wallet} isLargeScreen={isLargeScreen} />
				</Route>
			</Wrapper>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getAllByText(wallet.alias()!).length).toBeGreaterThanOrEqual(1);

		if (!isLargeScreen) {
			await userEvent.click(screen.getByTestId("WalletListItemMobile"));
		}

		expect(container).toMatchSnapshot();
	});

	it.each([true, false])(
		"should render when isLargeScreen = %s and wallet is not fully synced",
		async (isLargeScreen: boolean) => {
			const Wrapper = isLargeScreen ? TableWrapper : React.Fragment;

			const syncMock = vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(false);

			const { container } = render(
				<Wrapper>
					<Route path="/profiles/:profileId/dashboard">
						<WalletListItem wallet={wallet} isLargeScreen={isLargeScreen} />
					</Route>
				</Wrapper>,
				{
					history,
					route: dashboardURL,
				},
			);

			expect(screen.getAllByText(wallet.alias()!).length).toBeGreaterThanOrEqual(1);

			if (!isLargeScreen) {
				await userEvent.click(screen.getByTestId("WalletListItemMobile"));
			}

			expect(container).toMatchSnapshot();

			syncMock.mockRestore();
		},
	);

	it.each([true, false])("should render when isCompact = %s", (isCompact: boolean) => {
		const { container } = render(
			<table>
				<tbody>
					<Route path="/profiles/:profileId/dashboard">
						<WalletListItem wallet={wallet} isCompact={isCompact} />
					</Route>
				</tbody>
			</table>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getAllByText(wallet.alias()!).length).toBeGreaterThanOrEqual(1);
		expect(container).toMatchSnapshot();
	});

	it("should render with a N/A for fiat", () => {
		const isTestMock = vi.spyOn(wallet.network(), "isTest").mockReturnValue(true);

		const { asFragment } = render(
			<table>
				<tbody>
					<Route path="/profiles/:profileId/dashboard">
						<WalletListItem wallet={wallet} isCompact={false} />
					</Route>
				</tbody>
			</table>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(asFragment()).toMatchSnapshot();
		expect(screen.getByText("N/A")).toBeInTheDocument();

		isTestMock.mockRestore();
	});

	it("should disable the send button when wallet has no balance", () => {
		const balanceMock = vi.spyOn(wallet, "balance").mockReturnValue(0);

		const { asFragment } = render(
			<table>
				<tbody>
					<Route path="/profiles/:profileId/dashboard">
						<WalletListItem wallet={wallet} isCompact={false} />
					</Route>
				</tbody>
			</table>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("WalletListItem__send-button")).toBeDisabled();

		expect(asFragment()).toMatchSnapshot();

		balanceMock.mockRestore();
	});

	it("should render with default BTC as default exchangeCurrency", () => {
		const mockExchangeCurrency = vi.spyOn(wallet, "exchangeCurrency").mockReturnValue(undefined as any);

		const { container } = render(
			<table>
				<tbody>
					<Route path="/profiles/:profileId/dashboard">
						<WalletListItem wallet={wallet} isCompact={false} />
					</Route>
				</tbody>
			</table>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getAllByText(wallet.alias()!).length).toBeGreaterThanOrEqual(1);

		expect(container).toMatchSnapshot();

		mockExchangeCurrency.mockRestore();
	});

	it("should avoid click on TableRow when syncing", async () => {
		const isFullySyncedSpy = vi.spyOn(isFullySyncedModule, "isFullySynced").mockReturnValue(false);

		const { asFragment } = render(
			<table>
				<tbody>
					<Route path="/profiles/:profileId/dashboard">
						<WalletListItem wallet={wallet} isCompact={false} />
					</Route>
				</tbody>
			</table>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(asFragment).toMatchSnapshot();

		expect(screen.getByTestId("UpdateWalletName__submit")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("TableRow"));

		expect(useWalletActionsReturn.handleOpen).not.toHaveBeenCalled();

		isFullySyncedSpy.mockRestore();
	});

	it("should handle click on responsive item", async () => {
		const isFullySyncedSpy = vi.spyOn(isFullySyncedModule, "isFullySynced").mockReturnValue(true);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletListItem wallet={wallet} isCompact={false} isLargeScreen={false} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(asFragment).toMatchSnapshot();

		expect(screen.getByTestId("WalletListItemMobile")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("WalletListItemMobile"));

		expect(useWalletActionsReturn.handleOpen).toHaveBeenCalledWith(
			expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }),
		);

		isFullySyncedSpy.mockRestore();
	});

	it("should avoid click on responsive item when syncing", async () => {
		const isFullySyncedSpy = vi.spyOn(isFullySyncedModule, "isFullySynced").mockReturnValue(false);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletListItem wallet={wallet} isCompact={false} isLargeScreen={false} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(asFragment).toMatchSnapshot();

		expect(screen.getByTestId("WalletListItemMobile")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("WalletListItemMobile"));

		expect(useWalletActionsReturn.handleOpen).not.toHaveBeenCalled();

		isFullySyncedSpy.mockRestore();
	});

	it("should disable the send button when wallet has no balance on responsive", () => {
		const balanceMock = vi.spyOn(wallet, "balance").mockReturnValue(0);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletListItem wallet={wallet} isCompact={false} isLargeScreen={false} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("WalletListItemMobile--button")).toBeDisabled();

		expect(asFragment()).toMatchSnapshot();

		balanceMock.mockRestore();
	});

	it("should handle click on send button", async () => {
		const isFullySyncedSpy = vi.spyOn(isFullySyncedModule, "isFullySynced").mockReturnValue(true);

		render(
			<table>
				<tbody>
					<Route path="/profiles/:profileId/dashboard">
						<WalletListItem wallet={wallet} isCompact={false} />
					</Route>
				</tbody>
			</table>,
			{
				history,
				route: dashboardURL,
			},
		);

		const button = screen.getByTestId("WalletListItem__send-button");

		expect(button).toBeInTheDocument();

		await userEvent.click(button);

		expect(useWalletActionsReturn.handleSend).toHaveBeenCalledWith(
			expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }),
		);

		isFullySyncedSpy.mockRestore();
	});

	it("should handle click on responsive send button", async () => {
		const isFullySyncedSpy = vi.spyOn(isFullySyncedModule, "isFullySynced").mockReturnValue(true);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletListItem wallet={wallet} isCompact={false} isLargeScreen={false} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		const button = screen.getByTestId("WalletListItemMobile--button");

		expect(button).toBeInTheDocument();

		await userEvent.click(button);

		expect(useWalletActionsReturn.handleSend).toHaveBeenCalledWith(
			expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }),
		);

		isFullySyncedSpy.mockRestore();
	});
});
