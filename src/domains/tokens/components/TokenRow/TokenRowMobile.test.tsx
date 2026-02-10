import { Contracts } from "@/app/lib/profiles";
import React from "react";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";

import { TokenRowMobile } from "./TokenRowMobile";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { env, getDefaultProfileId, screen, render } from "@/utils/testing-library";

let profile: Contracts.IProfile;

const createMockWalletToken = (overrides = {}) => ({
	address: () => "0xA5cc0BfEB09742C5e4C610f2EBaaB82Eb142Ca10",
	balance: () => 100,
	contractExplorerLink: () => "https://explorer.com/token1",
	token: () => ({
		address: () => "0xToken1",
		decimals: () => 18,
		name: () => "Test Token",
		symbol: () => "TEST",
	}),
	...overrides,
});

describe("TokenRowMobile", () => {
	let mockWalletToken: any;

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	beforeEach(() => {
		mockWalletToken = createMockWalletToken();
	});

	it("should render", () => {
		render(
			<table>
				<tbody>
					<TokenRowMobile
						isManageMode={false}
						toggleContractVisibility={vi.fn()}
						walletToken={mockWalletToken}
						profile={profile}
						onSend={vi.fn()}
					/>
				</tbody>
			</table>,
		);

		expect(screen.getByTestId("TableRow__mobile")).toBeInTheDocument();
		expect(screen.getAllByRole("cell")).toHaveLength(1);
		expect(screen.getAllByText("Test Token")[0]).toBeInTheDocument();
	});

	it("should render skeleton when isLoading is true", () => {
		render(
			<table>
				<tbody>
					<TokenRowMobile
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

		expect(screen.getByTestId("TokenRow__skeleton")).toBeInTheDocument();
		expect(screen.queryByText("Test Token")).not.toBeInTheDocument();
	});

	it("should render token name", () => {
		render(
			<table>
				<tbody>
					<TokenRowMobile
						isManageMode={false}
						toggleContractVisibility={vi.fn()}
						walletToken={mockWalletToken}
						profile={profile}
						onSend={vi.fn()}
					/>
				</tbody>
			</table>,
		);

		expect(screen.getAllByText("Test Token")[0]).toBeInTheDocument();
	});

	it("should call onSend when send button is clicked", async () => {
		const user = userEvent.setup();
		const onSendMock = vi.fn();

		render(
			<table>
				<tbody>
					<TokenRowMobile
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
					<TokenRowMobile
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

	it("should not trigger onClick when send button is clicked", async () => {
		const user = userEvent.setup();
		const onClickMock = vi.fn();
		const onSendMock = vi.fn();

		render(
			<table>
				<tbody>
					<TokenRowMobile
						isManageMode={false}
						toggleContractVisibility={vi.fn()}
						walletToken={mockWalletToken}
						profile={profile}
						onSend={onSendMock}
						onClick={onClickMock}
					/>
				</tbody>
			</table>,
		);

		const sendButton = screen.getByRole("button", { name: /send/i });
		await user.click(sendButton);

		expect(onSendMock).toHaveBeenCalledTimes(1);
		expect(onClickMock).not.toHaveBeenCalled();
	});

	it.skip("should render favorite button on mobile", () => {
		render(
			<table>
				<tbody>
					<TokenRowMobile
						isManageMode={false}
						toggleContractVisibility={vi.fn()}
						walletToken={mockWalletToken}
						profile={profile}
						onSend={vi.fn()}
					/>
				</tbody>
			</table>,
		);

		expect(screen.getByText(commonTranslations.FAVORITE)).toBeInTheDocument();
	});

	it("should render checkbox when isManageMode is true", () => {
		render(
			<table>
				<tbody>
					<TokenRowMobile
						walletToken={mockWalletToken}
						profile={profile}
						onSend={vi.fn()}
						isManageMode={true}
						toggleContractVisibility={vi.fn()}
					/>
				</tbody>
			</table>,
		);

		expect(screen.getAllByTestId("TokenRow_VisibilityToggle")).toHaveLength(2);
	});

	it("should render Remove button when isManageMode is true", () => {
		render(
			<table>
				<tbody>
					<TokenRowMobile
						walletToken={mockWalletToken}
						profile={profile}
						onSend={vi.fn()}
						isManageMode={true}
						toggleContractVisibility={vi.fn()}
					/>
				</tbody>
			</table>,
		);

		expect(screen.queryByRole("button", { name: /send/i })).not.toBeInTheDocument();
		expect(screen.getByTestId("TokenRow_DeleteToken")).toBeInTheDocument();
	});

	it("should call toggleContractVisibility when checkbox is clicked", async () => {
		const user = userEvent.setup();
		const onClickMock = vi.fn();
		const toggleContractVisibilityMock = vi.fn();

		render(
			<table>
				<tbody>
					<TokenRowMobile
						walletToken={mockWalletToken}
						profile={profile}
						onSend={vi.fn()}
						onClick={onClickMock}
						isManageMode={true}
						toggleContractVisibility={toggleContractVisibilityMock}
					/>
				</tbody>
			</table>,
		);

		const checkboxes = screen.getAllByTestId("TokenRow_VisibilityToggle");
		await user.click(checkboxes[0]);

		expect(onClickMock).not.toHaveBeenCalled();
		expect(toggleContractVisibilityMock).toHaveBeenCalled();
	});

	it("should render checkbox as checked when isHidden is false", () => {
		render(
			<table>
				<tbody>
					<TokenRowMobile
						walletToken={mockWalletToken}
						profile={profile}
						onSend={vi.fn()}
						isManageMode={true}
						isHidden={false}
						toggleContractVisibility={vi.fn()}
					/>
				</tbody>
			</table>,
		);

		const checkboxes = screen.getAllByTestId("TokenRow_VisibilityToggle");
		for (const checkbox of checkboxes) {
			expect(checkbox).toBeChecked();
		}
	});

	it("should render checkbox as unchecked when isHidden is true", () => {
		render(
			<table>
				<tbody>
					<TokenRowMobile
						walletToken={mockWalletToken}
						profile={profile}
						onSend={vi.fn()}
						isManageMode={true}
						isHidden={true}
						toggleContractVisibility={vi.fn()}
					/>
				</tbody>
			</table>,
		);

		const checkboxes = screen.getAllByTestId("TokenRow_VisibilityToggle");
		for (const checkbox of checkboxes) {
			expect(checkbox).not.toBeChecked();
		}
	});

	it("should not render favorite button when isManageMode is true", () => {
		render(
			<table>
				<tbody>
					<TokenRowMobile
						walletToken={mockWalletToken}
						profile={profile}
						onSend={vi.fn()}
						isManageMode={true}
						toggleContractVisibility={vi.fn()}
					/>
				</tbody>
			</table>,
		);

		expect(screen.queryByText(commonTranslations.FAVORITE)).not.toBeInTheDocument();
	});

	it("should call onDelete when Delete button clicked", async () => {
		const user = userEvent.setup();
		const onDeleteMock = vi.fn();

		render(
			<table>
				<tbody>
					<TokenRowMobile
						isManageMode={true}
						toggleContractVisibility={vi.fn()}
						walletToken={mockWalletToken}
						profile={profile}
						onSend={vi.fn()}
						onClick={vi.fn()}
						onDelete={onDeleteMock}
					/>
				</tbody>
			</table>,
		);

		await user.click(screen.getByTestId("TokenRow_DeleteToken"));
		expect(onDeleteMock).toHaveBeenCalled();
	});
});
