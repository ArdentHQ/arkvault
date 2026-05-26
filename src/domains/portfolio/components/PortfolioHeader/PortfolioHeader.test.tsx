import { render, screen, waitFor } from "@/utils/testing-library";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { PortfolioHeader } from "./PortfolioHeader";
import { Contracts } from "@/app/lib/profiles";
import { PanelsProvider } from "@/app/contexts/Panels";
import { BigNumber } from "@/app/lib/helpers";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { useWalletOptions } from "@/domains/wallet/pages/WalletDetails/hooks/use-wallet-options";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

beforeAll(async () => {
	profile = env.profiles().findById(getMainsailProfileId());
	await env.profiles().restore(profile);
	wallet = profile.wallets().first();
});

vi.mock("@/domains/wallet/hooks", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/domains/wallet/hooks")>();
	return {
		...actual,
		useWalletActions: () => ({
			activeModal: undefined,
			handleSelectOption: vi.fn(),
			handleSend: vi.fn(),
			setActiveModal: vi.fn(),
		}),
	};
});

vi.mock("@/domains/wallet/pages/WalletDetails/hooks/use-wallet-options", () => {
	const mockUseWalletOptions = vi.fn(() => ({
		additionalOptions: { key: "additional", options: [], title: "Additional" },
		contractOptions: { key: "contract", options: [], title: "Contract" },
		primaryOptions: { key: "primary", options: [], title: "Primary" },
		registrationOptions: { key: "registration", options: [], title: "Registration" },
		secondaryOptions: { key: "secondary", options: [], title: "Secondary" },
	}));

	return { useWalletOptions: mockUseWalletOptions };
});

vi.mock("@/domains/wallet/hooks/use-ledger-wallet-migration", () => ({
	useLedgerMigrationMenuOptions: () => [],
	useLedgerMigrationStatus: () => ({
		hasWalletsToMigrate: false,
		ignore: vi.fn(),
		isIgnored: false,
		isLoading: false,
		isMigratingLater: false,
		migrateLater: vi.fn(),
	}),
}));

vi.mock("@/app/hooks/use-breakpoint", () => ({
	useBreakpoint: () => ({ isMdAndAbove: true, isXs: false }),
}));

vi.mock("@/app/components/WalletIcons", () => ({
	WalletIcons: () => <div data-testid="WalletIcons" />,
}));

const renderPortfolioHeader = (props: Partial<React.ComponentProps<typeof PortfolioHeader>> = {}) => {
	const defaultProps: React.ComponentProps<typeof PortfolioHeader> = {
		handleVotesButtonClick: vi.fn(),
		hasFocus: true,
		isLoadingVotes: false,
		isUpdatingTransactions: false,
		onUpdate: vi.fn(),
		onViewTokens: vi.fn(),
		profile,
		votes: [],
		...props,
	};

	return render(
		<PanelsProvider>
			<PortfolioHeader {...defaultProps} />,
		</PanelsProvider>,
		{
			route: `/profiles/${getMainsailProfileId()}/portfolio`,
			withProviders: true,
		},
	);
};

describe("PortfolioHeader", () => {
	it("should render the wallet header with balance information", async () => {
		const mockBalance = {
			decimalPlaces: vi.fn().mockReturnValue(new BigNumber(100)),
			isZero: vi.fn().mockReturnValue(false),
		};

		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(mockBalance);

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});
	});

	it("should render total balance label", async () => {
		const mockBalance = {
			decimalPlaces: vi.fn().mockReturnValue(new BigNumber(100)),
			isZero: vi.fn().mockReturnValue(false),
		};

		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(mockBalance);

		renderPortfolioHeader();

		await waitFor(() => {
			const balanceContainer = screen.getByTestId("WalletHeader__balance");
			expect(balanceContainer).toBeInTheDocument();
		});
	});

	it("should render the send button for single wallet when restored and synced", async () => {
		const mockBalance = {
			decimalPlaces: vi.fn().mockReturnValue(new BigNumber(100)),
			isZero: vi.fn().mockReturnValue(false),
		};

		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(mockBalance);

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader__send-button")).toBeInTheDocument();
		});
	});

	it("should render the refresh button", async () => {
		const mockBalance = {
			decimalPlaces: vi.fn().mockReturnValue(new BigNumber(100)),
			isZero: vi.fn().mockReturnValue(false),
		};

		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(mockBalance);

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader__refresh")).toBeInTheDocument();
		});
	});

	it("should render showing addresses panel trigger", async () => {
		const mockBalance = {
			decimalPlaces: vi.fn().mockReturnValue(new BigNumber(100)),
			isZero: vi.fn().mockReturnValue(false),
		};

		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(mockBalance);

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("ShowAddressesPanel")).toBeInTheDocument();
		});
	});

	it("should render the dropdown menu with additional options", async () => {
		const mockBalance = {
			decimalPlaces: vi.fn().mockReturnValue(new BigNumber(100)),
			isZero: vi.fn().mockReturnValue(false),
		};

		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(mockBalance);

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});

		// Click the more button to open dropdown
		const user = userEvent.setup();
		const moreButton = screen.getByTestId("WalletHeaderMobile__more-button");
		await user.click(moreButton);
	});

	it("should render the wallet address display", async () => {
		const mockBalance = {
			decimalPlaces: vi.fn().mockReturnValue(new BigNumber(100)),
			isZero: vi.fn().mockReturnValue(false),
		};

		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(mockBalance);

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});
	});

	it("should call useWalletOptions with selected wallets", async () => {
		const mockBalance = {
			decimalPlaces: vi.fn().mockReturnValue(new BigNumber(100)),
			isZero: vi.fn().mockReturnValue(false),
		};

		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(mockBalance);

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});

		expect(vi.mocked(useWalletOptions)).toHaveBeenCalledWith(profile.wallets().selected());
	});
});
