import { render, screen, waitFor } from "@/utils/testing-library";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { NotificationsSidepanel } from "./NotificationsSidepanel";
import { Contracts } from "@/app/lib/profiles";
import { useNotifications } from "@/app/components/Notifications/hooks/use-notifications";
import { PanelsProvider } from "@/app/contexts/Panels";
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

const Wrapper = ({ children }: { children: React.ReactNode }) => <PanelsProvider>{children}</PanelsProvider>;

describe("NotificationsSidepanel", () => {
	it("should render the side panel with title when open", async () => {
		vi.mocked(useNotifications).mockReturnValue({
			transactions: [],
			isNotificationUnread: () => false,
			markAsRead: vi.fn(),
			markAsRemoved: vi.fn(),
			markAllAsRead: vi.fn(),
			markAllAsRemoved: vi.fn(),
			hasUnread: false,
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
			transactions: [],
			isNotificationUnread: () => false,
			markAsRead: vi.fn(),
			markAsRemoved: vi.fn(),
			markAllAsRead: vi.fn(),
			markAllAsRemoved: vi.fn(),
			hasUnread: false,
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
			transactions: [],
			isNotificationUnread: () => false,
			markAsRead: vi.fn(),
			markAsRemoved: vi.fn(),
			markAllAsRead: vi.fn(),
			markAllAsRemoved: vi.fn(),
			hasUnread: false,
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

	it("should show notification rows when there are transactions", async () => {
		const mockTransaction = {
			hash: (): string => "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
			isSuccess: (): boolean => true,
			isTransfer: (): boolean => true,
			isMultiPayment: (): boolean => false,
			isTokenTransfer: (): boolean => false,
			wallet: () => ({ alias: (): string => "TestWallet" }),
			convertedAmount: (): string => "100.5",
			timestamp: () => ({ toUNIX: (): number => 1743669254 }),
			isConfirmed: (): boolean => true,
			confirmations: () => ({ toNumber: (): number => 10 }),
			data: () => ({
				receipt: () => ({ hasUnknownError: (): boolean => false, prettyError: (): string => "Error" }),
			}),
		};

		vi.mocked(useNotifications).mockReturnValue({
			transactions: [mockTransaction],
			isNotificationUnread: () => false,
			markAsRead: vi.fn(),
			markAsRemoved: vi.fn(),
			markAllAsRead: vi.fn(),
			markAllAsRemoved: vi.fn(),
			hasUnread: false,
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
