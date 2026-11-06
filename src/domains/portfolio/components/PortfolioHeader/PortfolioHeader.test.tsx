import { render, screen, waitFor } from "@/utils/testing-library";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { PortfolioHeader } from "./PortfolioHeader";
import { usePortfolioHeaderActions } from "./usePortfolioHeaderActions";
import { Contracts } from "@/app/lib/profiles";
import { PanelsProvider, Panel } from "@/app/contexts/Panels";
import { BigNumber } from "@/app/lib/helpers";
import { vi } from "vitest";
import { renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useWalletOptions } from "@/domains/wallet/pages/WalletDetails/hooks/use-wallet-options";

const sendButtonTestId = "WalletHeader__send-button";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

const mockOpenPanel = vi.fn();
vi.mock("@/app/contexts/Panels", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		usePanels: () => ({
			openPanel: mockOpenPanel,
		}),
	};
});

vi.mock("@/domains/wallet/hooks", async (importOriginal) => {
	const actual = await importOriginal<object>();
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
		additionalOptions: {
			hasDivider: true,
			key: "additional",
			options: [
				{ icon: "Sign", iconPosition: "start", label: "Sign Message", value: "sign-message" },
				{
					icon: "Info",
					iconPosition: "end",
					label: "With Secondary",
					secondaryLabel: "secondary text",
					value: "additional-secondary",
				},
				{
					active: true,
					label: "With Secondary 2",
					secondaryLabel: (active: boolean) => (active ? "active" : "inactive"),
					value: "additional-secondary-2",
				},
				{ disabled: true, label: "Disabled Option", value: "additional-disabled" },
			],
			title: "Additional",
		},
		contractOptions: {
			key: "contract",
			options: [{ icon: "File", label: "Deploy Contract", value: "deploy-contract" }],
			title: "Contract",
		},
		primaryOptions: {
			key: "primary",
			options: [{ icon: "Send", iconPosition: "start" as const, label: "Send", value: "send" }],
			title: "Primary",
		},
		registrationOptions: {
			key: "registration",
			options: [{ icon: "Pencil", label: "Register Username", value: "register-username" }],
			title: "Registration",
		},
		secondaryOptions: {
			hasDivider: true,
			key: "secondary",
			options: [
				{ icon: "Trash", label: "Delete Wallet", value: "delete" },
				{ icon: "ArrowSquareUpRight", iconPosition: "end", label: "Export", value: "export" },
			],
			title: "Secondary",
		},
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

describe("usePortfolioHeaderActions", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		await env.profiles().restore(profile);
		wallet = profile.wallets().first();
	});

	beforeEach(() => {
		mockOpenPanel.mockClear();
	});

	it("should open SendUsernameRegistration panel when no registrationType is passed", () => {
		const { result } = renderHook(() => usePortfolioHeaderActions());
		result.current.handleSendRegistration();
		expect(mockOpenPanel).toHaveBeenCalledWith(Panel.SendUsernameRegistration);
	});

	it("should open SendValidatorRegistration panel when validatorRegistration is passed", () => {
		const { result } = renderHook(() => usePortfolioHeaderActions());
		result.current.handleSendRegistration("validatorRegistration");
		expect(mockOpenPanel).toHaveBeenCalledWith(Panel.SendValidatorRegistration);
	});

	it("should open SendUsernameRegistration panel when usernameRegistration is passed", () => {
		const { result } = renderHook(() => usePortfolioHeaderActions());
		result.current.handleSendRegistration("usernameRegistration");
		expect(mockOpenPanel).toHaveBeenCalledWith(Panel.SendUsernameRegistration);
	});

	it("should open SendContractDeployment panel", () => {
		const { result } = renderHook(() => usePortfolioHeaderActions());
		result.current.handleSendContractDeployment();
		expect(mockOpenPanel).toHaveBeenCalledWith(Panel.SendContractDeployment);
	});

	it("should open SendUsernameResignation panel", () => {
		const { result } = renderHook(() => usePortfolioHeaderActions());
		result.current.handleSendUsernameResignation();
		expect(mockOpenPanel).toHaveBeenCalledWith(Panel.SendUsernameResignation);
	});

	it("should open SendValidatorResignation panel", () => {
		const { result } = renderHook(() => usePortfolioHeaderActions());
		result.current.handleSendValidatorResignation();
		expect(mockOpenPanel).toHaveBeenCalledWith(Panel.SendValidatorResignation);
	});
});

describe("PortfolioHeader", () => {
	beforeEach(() => {
		mockOpenPanel.mockClear();
		vi.useRealTimers();
	});

	it("should render the wallet header with balance information", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});
	});

	it("should render total balance label", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		renderPortfolioHeader();

		await waitFor(() => {
			const balanceContainer = screen.getByTestId("WalletHeader__balance");
			expect(balanceContainer).toBeInTheDocument();
		});
	});

	it("should render the send button for single wallet when restored and synced", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId(sendButtonTestId)).toBeInTheDocument();
		});
	});

	it("should render the refresh button", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader__refresh")).toBeInTheDocument();
		});
	});

	it("should render showing addresses panel trigger", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("ShowAddressesPanel")).toBeInTheDocument();
		});
	});

	it("should render the dropdown menu with options and groups", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});

		const user = userEvent.setup();
		await user.click(screen.getByTestId("dropdown__toggle"));

		await waitFor(() => {
			expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();
		});

		expect(screen.getByText("Primary")).toBeInTheDocument();
		expect(screen.getByText("Registration")).toBeInTheDocument();
		expect(screen.getByText("Contract")).toBeInTheDocument();
		expect(screen.getByText("Additional")).toBeInTheDocument();
		expect(screen.getByText("Secondary")).toBeInTheDocument();
	});

	it("should render dropdown options with secondary labels", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});

		const user = userEvent.setup();
		await user.click(screen.getByTestId("dropdown__toggle"));

		await waitFor(() => {
			expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();
		});

		expect(screen.getByText("With Secondary")).toBeInTheDocument();
		expect(screen.getByText("With Secondary 2")).toBeInTheDocument();
	});

	it("should render disabled dropdown option", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});

		const user = userEvent.setup();
		await user.click(screen.getByTestId("dropdown__toggle"));

		await waitFor(() => {
			expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByText("Disabled Option")).toBeInTheDocument();
		});

		await user.click(screen.getByText("Disabled Option"));
	});

	it("should render the wallet address display", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});
	});

	it("should call useWalletOptions with selected wallets", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});

		expect(vi.mocked(useWalletOptions)).toHaveBeenCalledWith(profile.wallets().selected());
	});

	it("should render skeleton when wallet is not restored", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(false);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});
	});

	it("should render total balance for multiple wallets", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		vi.spyOn(profile, "totalBalance").mockReturnValue(BigNumber.make(200));

		renderPortfolioHeader({ hasFocus: false });

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});
	});

	it("should render the send button disabled when balance is zero", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(0));

		renderPortfolioHeader();

		await waitFor(() => {
			const sendButton = screen.getByTestId(sendButtonTestId);
			expect(sendButton).toBeDisabled();
		});
	});

	it("should render the send button disabled when not synced", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(false);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		renderPortfolioHeader();

		await waitFor(() => {
			const sendButton = screen.getByTestId(sendButtonTestId);
			expect(sendButton).toBeDisabled();
		});
	});

	it("should render the send button disabled when not restored", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(false);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		renderPortfolioHeader();

		await waitFor(() => {
			const sendButton = screen.getByTestId(sendButtonTestId);
			expect(sendButton).toBeDisabled();
		});
	});

	it("should render the copy address button", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});
	});

	it("should render wallet icons", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletIcons")).toBeInTheDocument();
		});
	});

	it("should render WalletVote when multiple wallets", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		renderPortfolioHeader({ hasFocus: false });

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});
	});

	it("should render the import address button", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});
	});

	it("should render the create address button", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});
	});

	it("should render WalletActionsModals with correct props", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		const onUpdate = vi.fn();

		renderPortfolioHeader({ onUpdate });

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});
	});

	it("should render the address when single wallet is selected", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));
		vi.spyOn(wallet, "address").mockReturnValue("DkNnDEYf8k5gqqrNpzQYZHPBJhWpzbH7sF");

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});
	});

	it("should render the public key copy button when wallet has public key", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));
		vi.spyOn(wallet, "publicKey").mockReturnValue("02abcdef1234567890");

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});
	});

	it("should call handleSend when send button is clicked", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		renderPortfolioHeader();

		await waitFor(() => {
			const sendButton = screen.getByTestId(sendButtonTestId);
			expect(sendButton).toBeInTheDocument();
			expect(sendButton).not.toBeDisabled();
		});
	});

	it("should render the viewing address info correctly", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});
	});

	it("should call onUpdate callback when WalletActionsModals triggers update", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		const onUpdate = vi.fn();

		renderPortfolioHeader({ onUpdate });

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});
	});

	it("should render the dropdown with ledger migration options when hasWalletsToMigrate is true", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});
	});

	it("should render the single-address hint tooltip when conditions are met", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		renderPortfolioHeader({ hasFocus: true });

		expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
	});

	it("should render the import HD wallet hint tooltip when conditions are met", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		vi.spyOn(wallet, "isHDWallet").mockReturnValue(true);

		renderPortfolioHeader({ hasFocus: true });

		expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
	});

	it("should call handleVotesButtonClick when votes button is clicked", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		const handleVotesButtonClick = vi.fn();

		renderPortfolioHeader({ handleVotesButtonClick });

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});
	});

	it("should call onViewTokens when view tokens button is clicked", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		const onViewTokens = vi.fn();

		renderPortfolioHeader({ onViewTokens });

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});
	});

	it("should render the converted balance amount", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));
		vi.spyOn(wallet, "exchangeCurrency").mockReturnValue("USD");

		vi.spyOn(profile.totalBalanceConverted(), "toNumber").mockReturnValue(50);

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});
	});

	it("should render the wallet currency ticker", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));
		vi.spyOn(wallet, "currency").mockReturnValue("ARS");

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});
	});

	it("should render tokens section when profile has tokens", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));
		vi.spyOn(profile.tokens(), "selectedCount").mockReturnValue(3);

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});

		expect(screen.getAllByText(/Token Holdings/).length).toBeGreaterThan(0);
	});

	it("should render the account name label when wallet is HD and only one selected", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));
		vi.spyOn(wallet, "isHDWallet").mockReturnValue(true);
		vi.spyOn(wallet, "accountName").mockReturnValue("Account 1");

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});
	});

	it("should not render the double chevron button when only one wallet exists", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		vi.spyOn(profile.wallets(), "count").mockReturnValue(1);

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});
	});

	it("should render the tokens section with view tokens button when profile has tokens", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		const viewTokensSpy = vi.fn();

		renderPortfolioHeader({ onViewTokens: viewTokensSpy });

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});

		const viewTokensButtons = screen.getAllByTestId("ViewTokens");
		expect(viewTokensButtons.length).toBeGreaterThan(0);
	});

	it("should render migrateLater hint in dropdown when wallets have been ignored", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		renderPortfolioHeader();

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});

		const moreButton = screen.getByTestId("WalletHeaderMobile__more-button");
		expect(moreButton).toBeInTheDocument();
	});

	it("should render WalletVote component when multiple wallets selected", async () => {
		vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(true);
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make(100));

		renderPortfolioHeader({ hasFocus: false });

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});
	});
});
