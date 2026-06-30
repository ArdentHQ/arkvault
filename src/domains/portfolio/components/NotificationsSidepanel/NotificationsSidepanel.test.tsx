import { render, screen, waitFor } from "@/utils/testing-library";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { NotificationsSidepanel } from "./NotificationsSidepanel";
import { Contracts } from "@/app/lib/profiles";
import { useNotifications } from "@/app/components/Notifications/hooks/use-notifications";
import { PanelsProvider } from "@/app/contexts/Panels";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";

let profile: Contracts.IProfile;

beforeAll(async () => {
	profile = env.profiles().findById(getMainsailProfileId());
	await env.profiles().restore(profile);
});

vi.mock("@/app/components/Notifications/hooks/use-notifications", () => ({
	useNotifications: vi.fn(),
}));

vi.mock("@/domains/transaction/components/TransactionDetailSidePanel", () => ({
	TransactionDetailContent: () => <div data-testid="TransactionDetailContent">Transaction Detail</div>,
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => <PanelsProvider>{children}</PanelsProvider>;

describe("NotificationsSidepanel", () => {
	it("should render the side panel with title when open", async () => {
		vi.mocked(useNotifications).mockReturnValue({
			hasUnread: false,
			isNotificationUnread: () => false,
			markAllAsRead: vi.fn(),
			markAllAsRemoved: vi.fn(),
			markAsRead: vi.fn(),
			markAsRemoved: vi.fn(),
			transactions: [],
		});

		render(
			<Wrapper>
				<NotificationsSidepanel open={true} onOpenChange={() => {}} />,
			</Wrapper>,
			{
				route: `/profiles/${getMainsailProfileId()}/portfolio`,
				withProviders: true,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("NotificationsSidepanel")).toBeInTheDocument();
		});
	});

	it("should not render content when closed", async () => {
		vi.mocked(useNotifications).mockReturnValue({
			hasUnread: false,
			isNotificationUnread: () => false,
			markAllAsRead: vi.fn(),
			markAllAsRemoved: vi.fn(),
			markAsRead: vi.fn(),
			markAsRemoved: vi.fn(),
			transactions: [],
		});

		render(
			<Wrapper>
				<NotificationsSidepanel open={false} onOpenChange={() => {}} />,
			</Wrapper>,
			{
				route: `/profiles/${getMainsailProfileId()}/portfolio`,
				withProviders: true,
			},
		);

		await waitFor(() => {
			expect(screen.queryByTestId("NotificationsSidepanel")).not.toBeInTheDocument();
		});
	});

	it("should render empty state when there are no notifications", async () => {
		vi.mocked(useNotifications).mockReturnValue({
			hasUnread: false,
			isNotificationUnread: () => false,
			markAllAsRead: vi.fn(),
			markAllAsRemoved: vi.fn(),
			markAsRead: vi.fn(),
			markAsRemoved: vi.fn(),
			transactions: [],
		});

		render(
			<Wrapper>
				<NotificationsSidepanel open={true} onOpenChange={() => {}} />,
			</Wrapper>,
			{
				route: `/profiles/${getMainsailProfileId()}/portfolio`,
				withProviders: true,
			},
		);

		await waitFor(() => {
			expect(screen.getByText("All caught up!")).toBeInTheDocument();
		});
	});

	it("should show transaction details when a notification is clicked", async () => {
		const mockTransaction = {
			confirmations: () => ({ toNumber: (): number => 10 }),
			convertedAmount: (): string => "100.5",
			data: () => ({
				receipt: () => ({ hasUnknownError: (): boolean => false, prettyError: (): string => "Error" }),
			}),
			hash: (): string => "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
			isConfirmed: (): boolean => true,
			isMultiPayment: (): boolean => false,
			isSuccess: (): boolean => true,
			isTokenTransfer: (): boolean => false,
			isTransfer: (): boolean => true,
			timestamp: () => ({ toUNIX: (): number => 1743669254 }),
			wallet: () => ({ alias: (): string => "TestWallet" }),
		};

		vi.mocked(useNotifications).mockReturnValue({
			hasUnread: false,
			isNotificationUnread: () => false,
			markAllAsRead: vi.fn(),
			markAllAsRemoved: vi.fn(),
			markAsRead: vi.fn(),
			markAsRemoved: vi.fn(),
			transactions: [mockTransaction],
		});

		render(
			<Wrapper>
				<NotificationsSidepanel open={true} onOpenChange={() => {}} />,
			</Wrapper>,
			{
				route: `/profiles/${getMainsailProfileId()}/portfolio`,
				withProviders: true,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("NotificationRow")).toBeInTheDocument();
		});

		const user = userEvent.setup();
		await user.click(screen.getByTestId("NotificationRow"));

		await waitFor(() => {
			expect(screen.queryByTestId("NotificationRow")).not.toBeInTheDocument();
		});

		// Wait for SidePanel transition to complete so footer renders
		await new Promise((_) => setTimeout(_, 200));

		// Verify the footer back button is rendered
		expect(screen.getByTestId("ExchangeForm__back-button")).toBeInTheDocument();
	});

	it("should call onOpenChange with false when the side panel close button is clicked", async () => {
		const mockTransaction = {
			confirmations: () => ({ toNumber: (): number => 10 }),
			convertedAmount: (): string => "100.5",
			data: () => ({
				receipt: () => ({ hasUnknownError: (): boolean => false, prettyError: (): string => "Error" }),
			}),
			hash: (): string => "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
			isConfirmed: (): boolean => true,
			isMultiPayment: (): boolean => false,
			isSuccess: (): boolean => true,
			isTokenTransfer: (): boolean => false,
			isTransfer: (): boolean => true,
			timestamp: () => ({ toUNIX: (): number => 1743669254 }),
			wallet: () => ({ alias: (): string => "TestWallet" }),
		};

		const onOpenChangeSpy = vi.fn();

		vi.mocked(useNotifications).mockReturnValue({
			hasUnread: false,
			isNotificationUnread: () => false,
			markAllAsRead: vi.fn(),
			markAllAsRemoved: vi.fn(),
			markAsRead: vi.fn(),
			markAsRemoved: vi.fn(),
			transactions: [mockTransaction],
		});

		render(
			<Wrapper>
				<NotificationsSidepanel open={true} onOpenChange={onOpenChangeSpy} />,
			</Wrapper>,
			{
				route: `/profiles/${getMainsailProfileId()}/portfolio`,
				withProviders: true,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("NotificationsSidepanel")).toBeInTheDocument();
		});

		const user = userEvent.setup();
		const closeButton = screen.getByTestId("SidePanel__close-button");
		await user.click(closeButton);

		expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
	});

	it("should render footer back button when transaction modal is open", async () => {
		const mockTransaction = {
			confirmations: () => ({ toNumber: (): number => 10 }),
			convertedAmount: (): string => "100.5",
			data: () => ({
				receipt: () => ({ hasUnknownError: (): boolean => false, prettyError: (): string => "Error" }),
			}),
			hash: (): string => "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
			isConfirmed: (): boolean => true,
			isMultiPayment: (): boolean => false,
			isSuccess: (): boolean => true,
			isTokenTransfer: (): boolean => false,
			isTransfer: (): boolean => true,
			isVote: (): boolean => false,
			isUnvote: (): boolean => false,
			isValidatorRegistration: (): boolean => false,
			isValidatorResignation: (): boolean => false,
			timestamp: () => ({ toUNIX: (): number => 1743669254 }),
			wallet: () => ({ alias: (): string => "TestWallet" }),
		};

		vi.mocked(useNotifications).mockReturnValue({
			hasUnread: false,
			isNotificationUnread: () => false,
			markAllAsRead: vi.fn(),
			markAllAsRemoved: vi.fn(),
			markAsRead: vi.fn(),
			markAsRemoved: vi.fn(),
			transactions: [mockTransaction],
		});

		render(
			<Wrapper>
				<NotificationsSidepanel open={true} onOpenChange={() => {}} />,
			</Wrapper>,
			{
				route: `/profiles/${getMainsailProfileId()}/portfolio`,
				withProviders: true,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("NotificationRow")).toBeInTheDocument();
		});

		const user = userEvent.setup();
		await user.click(screen.getByTestId("NotificationRow"));

		await waitFor(() => {
			expect(screen.getByTestId("ExchangeForm__back-button")).toBeInTheDocument();
		});
	});

	it("should show notification rows when there are transactions", async () => {
		const mockTransaction = {
			confirmations: () => ({ toNumber: (): number => 10 }),
			convertedAmount: (): string => "100.5",
			data: () => ({
				receipt: () => ({ hasUnknownError: (): boolean => false, prettyError: (): string => "Error" }),
			}),
			hash: (): string => "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
			isConfirmed: (): boolean => true,
			isMultiPayment: (): boolean => false,
			isSuccess: (): boolean => true,
			isTokenTransfer: (): boolean => false,
			isTransfer: (): boolean => true,
			timestamp: () => ({ toUNIX: (): number => 1743669254 }),
			wallet: () => ({ alias: (): string => "TestWallet" }),
		};

		vi.mocked(useNotifications).mockReturnValue({
			hasUnread: false,
			isNotificationUnread: () => false,
			markAllAsRead: vi.fn(),
			markAllAsRemoved: vi.fn(),
			markAsRead: vi.fn(),
			markAsRemoved: vi.fn(),
			transactions: [mockTransaction],
		});

		render(
			<Wrapper>
				<NotificationsSidepanel open={true} onOpenChange={() => {}} />,
			</Wrapper>,
			{
				route: `/profiles/${getMainsailProfileId()}/portfolio`,
				withProviders: true,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("NotificationRow")).toBeInTheDocument();
		});
	});
});
