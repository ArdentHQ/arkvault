import userEvent from "@testing-library/user-event";

import { DeleteTokenConfirmationModal } from "./DeleteTokenConfirmationModal";
import { buildTranslations } from "@/app/i18n/helpers";
import { render, screen, waitFor } from "@/utils/testing-library";
import { BigNumber } from "@/app/lib/helpers";

const translations = buildTranslations();

const createMockWalletToken = (overrides = {}) => ({
	address: () => "0xA5cc0BfEB09742C5e4C610f2EBaaB82Eb142Ca10",
	balance: () => BigNumber.make(100),
	contractExplorerLink: () => "https://explorer.com/token/0xToken1",
	token: () => ({
		address: () => "0xToken1",
		decimals: () => 18,
		name: () => "Test Token",
		symbol: () => "TEST",
		displaySymbol: () => "TEST",
	}),
	...overrides,
});

describe("DeleteTokenConfirmationModal", () => {
	let mockWalletToken: any;

	beforeEach(() => {
		mockWalletToken = createMockWalletToken();
	});

	it("should render", async () => {
		render(<DeleteTokenConfirmationModal walletToken={mockWalletToken} onClose={vi.fn()} onDelete={vi.fn()} />);

		await expect(screen.findByText("Delete Token")).resolves.toBeVisible();
	});

	it("should call onClose when cancel button is clicked", async () => {
		const user = userEvent.setup();
		const onCloseMock = vi.fn();

		render(<DeleteTokenConfirmationModal walletToken={mockWalletToken} onClose={onCloseMock} onDelete={vi.fn()} />);

		await expect(screen.findByText("Delete Token")).resolves.toBeVisible();

		const cancelButton = screen.getByTestId("DeleteResource__cancel-button");
		await user.click(cancelButton);

		expect(onCloseMock).toHaveBeenCalledTimes(1);
	});

	it("should call onDelete when delete button is clicked", async () => {
		const user = userEvent.setup();
		const onDeleteMock = vi.fn();

		render(
			<DeleteTokenConfirmationModal walletToken={mockWalletToken} onClose={vi.fn()} onDelete={onDeleteMock} />,
		);

		await expect(screen.findByText("Delete Token")).resolves.toBeVisible();

		const deleteButton = screen.getByTestId("DeleteResource__submit-button");
		await user.click(deleteButton);

		await waitFor(() => expect(onDeleteMock).toHaveBeenCalledTimes(1));
	});

	it("should display all detail labels", async () => {
		render(<DeleteTokenConfirmationModal walletToken={mockWalletToken} onClose={vi.fn()} onDelete={vi.fn()} />);

		await expect(screen.findByText("Delete Token")).resolves.toBeVisible();

		expect(screen.getByText(translations.COMMON.TOKEN)).toBeInTheDocument();
		expect(screen.getByText(translations.COMMON.SYMBOL)).toBeInTheDocument();
		expect(screen.getByText(translations.COMMON.CONTRACT)).toBeInTheDocument();
		expect(screen.getByText(translations.COMMON.BALANCE)).toBeInTheDocument();
	});
});
