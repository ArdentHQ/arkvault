import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import { PortfolioBreakdown } from "./PortfolioBreakdown";
import { env, render, screen } from "@/utils/testing-library";
import { GRAPH_MIN_VALUE } from "@/app/components/Graphs/Graphs.contracts";
import * as sharedGraphUtils from "@/app/components/Graphs/Graphs.shared";
import * as useThemeHook from "@/app/hooks/use-theme";
import { buildTranslations } from "@/app/i18n/helpers";

const translations = buildTranslations();

describe("PortfolioBreakdown", () => {
	let profile: Contracts.IProfile;

	let firstWallet: Contracts.IReadWriteWallet;
	let secondWallet: Contracts.IReadWriteWallet;

	let portfolioBreakdownMock: vi.SpyInstance;
	let isRestoredMock: vi.SpyInstance;

	let firstWalletColdMock: vi.SpyInstance;
	let secondWalletColdMock: vi.SpyInstance;

	let firstWalletSyncedMock: vi.SpyInstance;
	let secondWalletSyncedMock: vi.SpyInstance;

	let useGraphWidthMock: vi.SpyInstance;

	const liveNetworkIds = ["ark.mainnet", "lsk.mainnet"];

	beforeAll(async () => {
		profile = await env.profiles().create("blank");

		profile.settings().set(Contracts.ProfileSetting.ExchangeCurrency, "USD");

		let walletData: {
			mnemonic: string;
			wallet: Contracts.IReadWriteWallet;
		};

		walletData = await profile.walletFactory().generate({ coin: "ARK", network: "ark.mainnet" });
		firstWallet = walletData.wallet;

		walletData = await profile.walletFactory().generate({ coin: "ARK", network: "ark.mainnet" });
		secondWallet = walletData.wallet;

		profile.wallets().push(firstWallet);
		profile.wallets().push(secondWallet);

		// Mock graph width to a value that would use 5% as minimum threshold for visible data points.
		useGraphWidthMock = vi
			.spyOn(sharedGraphUtils, "useGraphWidth")
			.mockReturnValue([undefined as never, GRAPH_MIN_VALUE.line / 5]);
	});

	afterAll(() => {
		env.profiles().forget(profile.id());

		useGraphWidthMock.mockRestore();
	});

	beforeEach(() => {
		portfolioBreakdownMock = vi.spyOn(profile.portfolio(), "breakdown").mockReturnValue([
			{ coin: firstWallet.coin(), shares: 85, source: 85, target: 85 },
			{ coin: secondWallet.coin(), shares: 15, source: 15, target: 15 },
		]);

		isRestoredMock = vi.spyOn(profile.status(), "isRestored").mockReturnValue(true);

		firstWalletColdMock = vi.spyOn(firstWallet, "isCold").mockReturnValue(false);
		secondWalletColdMock = vi.spyOn(secondWallet, "isCold").mockReturnValue(false);

		firstWalletSyncedMock = vi.spyOn(firstWallet, "hasSyncedWithNetwork").mockReturnValue(true);
		secondWalletSyncedMock = vi.spyOn(secondWallet, "hasSyncedWithNetwork").mockReturnValue(true);
	});

	afterEach(() => {
		portfolioBreakdownMock.mockRestore();
		isRestoredMock.mockRestore();
	});

	it.each([true, false])("should render with dark mode = %s", (isDarkMode) => {
		const useThemeMock = vi.spyOn(useThemeHook, "useTheme").mockReturnValue({ isDarkMode } as never);

		const { asFragment } = render(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={false}
				selectedNetworkIds={liveNetworkIds}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(screen.getByTestId("PortfolioBreakdown")).toBeInTheDocument();

		expect(screen.getByTestId("Amount")).toHaveTextContent("$100.00");
		expect(screen.getByTestId("PortfolioBreakdown__assets")).toHaveTextContent("2");
		expect(screen.getByTestId("PortfolioBreakdown__wallets")).toHaveTextContent("2");

		expect(screen.getByTestId("LineGraph__svg")).toBeInTheDocument();
		expect(screen.getAllByTestId("LineGraph__item")).toHaveLength(2);

		expect(screen.getByText(translations.COMMON.MORE_DETAILS)).not.toBeDisabled();

		expect(asFragment()).toMatchSnapshot();

		useThemeMock.mockRestore();
	});

	it("should render loading when syncing exchange rates", () => {
		const { asFragment } = render(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={true}
				selectedNetworkIds={liveNetworkIds}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(screen.getByTestId("PortfolioBreakdownSkeleton")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render loading when profile is not restored yet", () => {
		isRestoredMock.mockReturnValue(false);

		const { asFragment } = render(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={false}
				selectedNetworkIds={liveNetworkIds}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(screen.getByTestId("PortfolioBreakdownSkeleton")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render loading when no wallets have synced with the network", () => {
		firstWalletSyncedMock.mockReturnValue(false);
		secondWalletSyncedMock.mockReturnValue(false);

		const { asFragment } = render(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={false}
				selectedNetworkIds={liveNetworkIds}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(screen.getByTestId("PortfolioBreakdownSkeleton")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render loading when some wallets have not synced with the network", () => {
		firstWalletSyncedMock.mockReturnValue(false);
		secondWalletSyncedMock.mockReturnValue(true);

		const { asFragment } = render(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={false}
				selectedNetworkIds={liveNetworkIds}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(screen.getByTestId("PortfolioBreakdownSkeleton")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render loading when items converted balance contain a NaN value", () => {
		portfolioBreakdownMock = vi.spyOn(profile.portfolio(), "breakdown").mockReturnValue([
			{ coin: firstWallet.coin(), shares: 85, source: 85, target: 85 },
			{ coin: secondWallet.coin(), shares: 15, source: 15, target: Number.NaN },
		]);

		const { asFragment } = render(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={false}
				selectedNetworkIds={liveNetworkIds}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(screen.getByTestId("PortfolioBreakdownSkeleton")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render when some wallets are cold", () => {
		firstWalletColdMock.mockReturnValue(true);
		secondWalletColdMock.mockReturnValue(false);

		const { asFragment } = render(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={false}
				selectedNetworkIds={liveNetworkIds}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(screen.queryByTestId("PortfolioBreakdownSkeleton")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should return nothing when portfolio is empty and there are no filtered networks", () => {
		portfolioBreakdownMock.mockReturnValue([]);

		const { asFragment } = render(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={false}
				selectedNetworkIds={liveNetworkIds}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render empty block when portfolio is empty and there are filtered networks", () => {
		portfolioBreakdownMock.mockReturnValue([]);

		const { asFragment } = render(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={false}
				selectedNetworkIds={["ark.mainnet"]}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(screen.getByTestId("EmptyBlock")).toBeInTheDocument();
		expect(screen.getByTestId("EmptyBlock")).toHaveTextContent(
			/Please enable at least one public network to display your portfolio report/,
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render empty (filtered) message when there are no assets that match the current network filters", () => {
		portfolioBreakdownMock.mockReturnValue([]);

		const { asFragment } = render(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={false}
				selectedNetworkIds={[]}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(screen.getByTestId("EmptyBlock")).toBeInTheDocument();
		expect(screen.getByTestId("EmptyBlock")).toHaveTextContent(
			/Please enable at least one public network to display your portfolio report/,
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it.each([true, false])("should render zero balance state with dark mode = %s", (isDarkMode) => {
		const useThemeMock = vi.spyOn(useThemeHook, "useTheme").mockReturnValue({ isDarkMode } as never);

		portfolioBreakdownMock = vi
			.spyOn(profile.portfolio(), "breakdown")
			.mockReturnValue([{ coin: firstWallet.coin(), shares: 0, source: 0, target: 0 }]);

		const { asFragment } = render(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={false}
				selectedNetworkIds={liveNetworkIds}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(screen.getByTestId("PortfolioBreakdown")).toBeInTheDocument();
		expect(screen.getByTestId("LineGraph__empty")).toBeInTheDocument();

		expect(screen.getByText(translations.COMMON.MORE_DETAILS)).toBeDisabled();

		expect(asFragment()).toMatchSnapshot();

		useThemeMock.mockRestore();
	});

	it("should have a button to open detail modal", async () => {
		render(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={false}
				selectedNetworkIds={liveNetworkIds}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(screen.getByText(translations.COMMON.MORE_DETAILS)).toBeEnabled();

		await userEvent.click(screen.getByText(translations.COMMON.MORE_DETAILS));

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		expect(screen.getByText(translations.DASHBOARD.PORTFOLIO_BREAKDOWN_DETAILS.TITLE)).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("Modal__close-button"));

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
	});

	it.each([true, false])(
		"should show tooltip when hovering graph elements when dark mode is = %s",
		async (isDarkMode) => {
			const useThemeMock = vi.spyOn(useThemeHook, "useTheme").mockReturnValue({ isDarkMode } as never);

			render(
				<PortfolioBreakdown
					profile={profile}
					profileIsSyncingExchangeRates={false}
					selectedNetworkIds={liveNetworkIds}
					liveNetworkIds={liveNetworkIds}
				/>,
			);

			expect(screen.getByTestId("LineGraph__svg")).toBeInTheDocument();
			expect(screen.getAllByTestId("LineGraph__item")).toHaveLength(2);

			expect(screen.queryByTestId("PortfolioBreakdown__tooltip")).not.toBeInTheDocument();

			await userEvent.hover(screen.getAllByTestId("LineGraph__item-hover-area")[0]);

			expect(screen.getByTestId("PortfolioBreakdown__tooltip")).toBeInTheDocument();
			expect(screen.getByTestId("PortfolioBreakdown__tooltip")).toHaveTextContent(/ARK/);
			expect(screen.getByTestId("PortfolioBreakdown__tooltip")).toHaveTextContent(/\$85.00/);
			expect(screen.getByTestId("PortfolioBreakdown__tooltip")).toHaveTextContent(/85%/);

			await userEvent.unhover(screen.getAllByTestId("LineGraph__item-hover-area")[0]);
			await userEvent.hover(screen.getAllByTestId("LineGraph__item-hover-area")[1]);

			expect(screen.getByTestId("PortfolioBreakdown__tooltip")).toHaveTextContent(/ARK/);
			expect(screen.getByTestId("PortfolioBreakdown__tooltip")).toHaveTextContent(/\$15.00/);
			expect(screen.getByTestId("PortfolioBreakdown__tooltip")).toHaveTextContent(/15%/);

			useThemeMock.mockRestore();
		},
	);

	it("should filter by selected networks", () => {
		const { rerender } = render(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={false}
				selectedNetworkIds={["lsk.mainnet"]}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(screen.getByTestId("EmptyBlock")).toBeVisible();

		rerender(
			<PortfolioBreakdown
				profile={profile}
				profileIsSyncingExchangeRates={false}
				selectedNetworkIds={liveNetworkIds}
				liveNetworkIds={liveNetworkIds}
			/>,
		);

		expect(screen.getByTestId("PortfolioBreakdown__wallets")).toHaveTextContent("2");
	});
});
