import { render, screen, waitFor } from "@/utils/testing-library";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { Contracts } from "@/app/lib/profiles";
import {
	Notifications,
	NotificationLeftSide,
	TransferNotification,
	FailedTransactionNotification,
} from "./Notification.blocks";
import { useNotifications } from "@/app/components/Notifications/hooks/use-notifications";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

let profile: Contracts.IProfile;

beforeAll(async () => {
	profile = env.profiles().findById(getMainsailProfileId());
	await env.profiles().restore(profile);
});

vi.mock("@/app/components/Notifications/hooks/use-notifications", () => ({
	useNotifications: vi.fn(),
}));

const createMockTransaction = (overrides = {}) => {
	const baseTx = {
		convertedAmount: () => "100.5",
		data: () => ({ receipt: () => ({ hasUnknownError: () => false, prettyError: () => "Error" }) }),
		hash: () => "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
		isMultiPayment: () => false,
		isSuccess: () => true,
		isTokenTransfer: () => false,
		isTransfer: () => true,
		timestamp: () => ({ toUNIX: () => 1743669254 }),
		wallet: () => ({ alias: () => "TestWallet" }),
		...overrides,
	};
	return baseTx;
};

describe("Notifications", () => {
	it("should render mark all as read button when there are unread notifications", async () => {
		const mockTransactions = [createMockTransaction()];

		vi.mocked(useNotifications).mockReturnValue({
			hasUnread: true,
			isNotificationUnread: () => true,
			markAllAsRead: vi.fn(),
			markAllAsRemoved: vi.fn(),
			markAsRead: vi.fn(),
			markAsRemoved: vi.fn(),
			transactions: mockTransactions,
		});

		render(<Notifications profile={profile} />);

		await waitFor(() => {
			expect(screen.getByTestId("MarkAllNotificationsRead")).toBeInTheDocument();
		});
	});

	it("should render remove all button", async () => {
		const mockTransactions = [createMockTransaction()];

		vi.mocked(useNotifications).mockReturnValue({
			hasUnread: false,
			isNotificationUnread: () => false,
			markAllAsRead: vi.fn(),
			markAllAsRemoved: vi.fn(),
			markAsRead: vi.fn(),
			markAsRemoved: vi.fn(),
			transactions: mockTransactions,
		});

		render(<Notifications profile={profile} />);

		await waitFor(() => {
			expect(screen.getByTestId("WalletVote__button")).toBeInTheDocument();
		});
	});

	it("should render empty state when no transactions", async () => {
		vi.mocked(useNotifications).mockReturnValue({
			hasUnread: false,
			isNotificationUnread: () => false,
			markAllAsRead: vi.fn(),
			markAllAsRemoved: vi.fn(),
			markAsRead: vi.fn(),
			markAsRemoved: vi.fn(),
			transactions: [],
		});

		render(<Notifications profile={profile} />);

		await waitFor(() => {
			expect(screen.getByText("All caught up!")).toBeInTheDocument();
			expect(screen.getByText("You have no notifications at this time.")).toBeInTheDocument();
		});
	});

	it("should call markAllAsRead when MarkAllNotificationsRead button is clicked", async () => {
		const mockTransactions = [createMockTransaction()];
		const markAllAsReadSpy = vi.fn();

		vi.mocked(useNotifications).mockReturnValue({
			hasUnread: true,
			isNotificationUnread: () => true,
			markAllAsRead: markAllAsReadSpy,
			markAllAsRemoved: vi.fn(),
			markAsRead: vi.fn(),
			markAsRemoved: vi.fn(),
			transactions: mockTransactions,
		});

		render(<Notifications profile={profile} />);

		const user = userEvent.setup();
		await user.click(screen.getByTestId("MarkAllNotificationsRead"));

		expect(markAllAsReadSpy).toHaveBeenCalled();
	});

	it("should disable mark all button when no unread notifications", async () => {
		vi.mocked(useNotifications).mockReturnValue({
			hasUnread: false,
			isNotificationUnread: () => false,
			markAllAsRead: vi.fn(),
			markAllAsRemoved: vi.fn(),
			markAsRead: vi.fn(),
			markAsRemoved: vi.fn(),
			transactions: [createMockTransaction()],
		});

		render(<Notifications profile={profile} />);

		await waitFor(() => {
			const button = screen.getByTestId("MarkAllNotificationsRead");
			expect(button).toBeDisabled();
		});
	});

	it("should disable remove all button when no transactions", async () => {
		vi.mocked(useNotifications).mockReturnValue({
			hasUnread: false,
			isNotificationUnread: () => false,
			markAllAsRead: vi.fn(),
			markAllAsRemoved: vi.fn(),
			markAsRead: vi.fn(),
			markAsRemoved: vi.fn(),
			transactions: [],
		});

		render(<Notifications profile={profile} />);

		await waitFor(() => {
			const button = screen.getByTestId("WalletVote__button");
			expect(button).toBeDisabled();
		});
	});
});

describe("NotificationLeftSide", () => {
	it("should render transfer notification for successful transfers", () => {
		const transaction = createMockTransaction();

		render(<NotificationLeftSide transaction={transaction} />);

		expect(screen.getByText(/Received/)).toBeInTheDocument();
	});

	it("should render failed transaction notification for unsuccessful transactions", () => {
		const failedTransaction = createMockTransaction({
			data: () => ({
				receipt: () => ({ hasUnknownError: () => false, prettyError: () => "Insufficient funds" }),
			}),
			isSuccess: () => false,
		});

		render(<NotificationLeftSide transaction={failedTransaction} />);

		expect(screen.getByText(/Transaction failed/)).toBeInTheDocument();
	});
});

describe("TransferNotification", () => {
	it("should render transfer notification with correct text", async () => {
		const transaction = createMockTransaction();

		render(<TransferNotification transaction={transaction} />);

		await waitFor(() => {
			expect(screen.getByText(/Received/)).toBeInTheDocument();
		});
	});

	it("should render multi-payment notification text for multipayments", async () => {
		const multiPaymentTx = createMockTransaction({
			isMultiPayment: () => true,
		});

		render(<TransferNotification transaction={multiPaymentTx} />);

		await waitFor(() => {
			expect(screen.getByText(/multipayment/)).toBeInTheDocument();
		});
	});
});

describe("FailedTransactionNotification", () => {
	it("should render failed notification with error message", async () => {
		const failedTransaction = createMockTransaction({
			data: () => ({
				receipt: () => ({ hasUnknownError: () => true, prettyError: (): string => "Unknown error" }),
			}),
			isSuccess: () => false,
		});

		render(<FailedTransactionNotification transaction={failedTransaction} />);

		await waitFor(() => {
			expect(screen.getByText(/Transaction failed/)).toBeInTheDocument();
		});
	});
});
