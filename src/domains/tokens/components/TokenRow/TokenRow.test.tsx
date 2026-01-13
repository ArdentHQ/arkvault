import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";

import { TokenRow } from "./TokenRow";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

let profile: Contracts.IProfile;

const createMockWalletToken = (overrides = {}) => ({
	address: () => "0xA5cc0BfEB09742C5e4C610f2EBaaB82Eb142Ca10",
	balance: () => 100,
	contractExplorerLink: () => "https://explorer.com/token/0xToken1",
	token: () => ({
		address: () => "0xToken1",
		decimals: () => 18,
		name: () => "Test Token",
		symbol: () => "TEST",
	}),
	...overrides,
});

describe("TokenRow", () => {
	let mockWalletToken: any;

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	beforeEach(() => {
		mockWalletToken = createMockWalletToken();
	});

	it("should render token row", () => {
		render(
			<table>
				<tbody>
					<TokenRow
						isManageMode={false}
						toggleContractVisibility={vi.fn()}
						walletToken={mockWalletToken}
						profile={profile}
						onSend={vi.fn()}
					/>
				</tbody>
			</table>,
		);

		expect(screen.getByText("Test Token")).toBeInTheDocument();
		expect(screen.getByText("TEST")).toBeInTheDocument();
		expect(screen.getByText("0xToken1")).toBeInTheDocument();
	});

	it("should call onSend when send button is clicked", async () => {
		const user = userEvent.setup();
		const onSendMock = vi.fn();

		render(
			<table>
				<tbody>
					<TokenRow
						isManageMode={false}
						toggleContractVisibility={vi.fn()}
						walletToken={mockWalletToken}
						profile={profile}
						onSend={onSendMock}
					/>
				</tbody>
			</table>,
		);

		const sendButton = screen.getByRole("button", { name: /send/i });
		await user.click(sendButton);

		expect(onSendMock).toHaveBeenCalledTimes(1);
	});

	it("should call onClick when row is clicked", async () => {
		const user = userEvent.setup();
		const onClickMock = vi.fn();

		render(
			<table>
				<tbody>
					<TokenRow
						isManageMode={false}
						toggleContractVisibility={vi.fn()}
						walletToken={mockWalletToken}
						profile={profile}
						onSend={vi.fn()}
						onClick={onClickMock}
					/>
				</tbody>
			</table>,
		);

		const row = screen.getByRole("row");
		await user.click(row);

		expect(onClickMock).toHaveBeenCalledTimes(1);
	});

	it("should render TokenRowSkeleton when isLoading is true", () => {
		render(
			<table>
				<tbody>
					<TokenRow
						isManageMode={false}
						toggleContractVisibility={vi.fn()}
						walletToken={mockWalletToken}
						profile={profile}
						onSend={vi.fn()}
						isLoading
					/>
				</tbody>
			</table>,
		);

		expect(screen.getByRole("row")).toBeInTheDocument();
		expect(screen.queryByText("Test Token")).not.toBeInTheDocument();
	});

	it("should render checkbox when isManageMode  is true", () => {
		render(
			<table>
				<tbody>
					<TokenRow
						isManageMode={true}
						toggleContractVisibility={vi.fn()}
						walletToken={mockWalletToken}
						profile={profile}
						onSend={vi.fn()}
					/>
				</tbody>
			</table>,
		);

		expect(screen.queryByTestId("TokenRow_Favorite")).not.toBeInTheDocument();
		expect(screen.getByTestId("TokenRow_VisibilityToggle")).toBeInTheDocument();
	});

	it("should render Remove button when isManageMode  is true", () => {
		render(
			<table>
				<tbody>
					<TokenRow
						isManageMode={true}
						toggleContractVisibility={vi.fn()}
						walletToken={mockWalletToken}
						profile={profile}
						onSend={vi.fn()}
					/>
				</tbody>
			</table>,
		);

		expect(screen.queryByRole("button", { name: /send/i })).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: /remove/i })).toBeInTheDocument();
	});

	it("should call toggleContractVisibility when checkbox checked", async () => {
		const user = userEvent.setup();
		const onClickMock = vi.fn();
		const onToggleContractVisibilityMock = vi.fn();

		render(
			<table>
				<tbody>
				<TokenRow
					isManageMode={true}
					toggleContractVisibility={onToggleContractVisibilityMock}
					walletToken={mockWalletToken}
					profile={profile}
					onSend={vi.fn()}
					onClick={onClickMock}
				/>
				</tbody>
			</table>,
		);

		await user.click(screen.getByTestId("TokenRow_VisibilityToggle"));
		expect(onClickMock).not.toHaveBeenCalled();
		expect(onToggleContractVisibilityMock).toHaveBeenCalled();
	});
});
