import { env, getMainsailProfileId, render, screen, renderResponsiveWithRoute, waitFor } from "@/utils/testing-library";
import userEvent from "@testing-library/user-event";

import { TokensTable } from "./TokensTable";
import { LayoutBreakpoint } from "@/types";
import { Contracts } from "@/app/lib/profiles";
import { WalletTokenDTO } from "@/app/lib/profiles/wallet-token.dto";
import { TokenDTO } from "@/app/lib/profiles/token.dto";
import Fixtures from "@/tests/fixtures/coins/mainsail/devnet/tokens.json";
import * as useRandomNumberHook from "@/app/hooks/use-random-number";
import * as useWalletActionsHook from "@/domains/wallet/hooks";
import { expect } from "vitest";

let profile: Contracts.IProfile;
let route: string;
let useRandomNumberSpy: vi.SpyInstance;

describe("TokensTable", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		route = `/profiles/${profile.id()}/tokens`;

		useRandomNumberSpy = vi.spyOn(useRandomNumberHook, "useRandomNumber").mockImplementation(() => 1);
	});

	afterAll(() => {
		useRandomNumberSpy.mockRestore();
	});

	it("should render", () => {
		const { asFragment } = render(<TokensTable isManageMode={false} setManageMode={vi.fn()} />, {
			route,
		});

		expect(screen.getByTestId("TokenList")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should not render in %s", (breakpoint) => {
		const { asFragment } = renderResponsiveWithRoute(
			<TokensTable isManageMode={false} setManageMode={vi.fn()} />,
			breakpoint as LayoutBreakpoint,
			{ route },
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should call onClick when a token row is clicked", async () => {
		const user = userEvent.setup();
		const onClickMock = vi.fn();

		render(<TokensTable isManageMode={false} setManageMode={vi.fn()} onClick={onClickMock} />, { route });

		await waitFor(() => {
			expect(screen.getAllByTestId("TokensTableRow")[0]).toBeInTheDocument();
		});

		const row = screen.getAllByTestId("TokensTableRow")[0];
		await user.click(row);

		expect(onClickMock).toHaveBeenCalled();
	});

	it("should call handleSend when send button is clicked", async () => {
		const user = userEvent.setup();
		const handleSendMock = vi.fn();

		vi.spyOn(useWalletActionsHook, "useWalletActions").mockReturnValue({
			handleTokenSend: handleSendMock,
		});

		render(<TokensTable isManageMode={false} setManageMode={vi.fn()} />, { route });

		await waitFor(() => {
			expect(screen.getAllByTestId("TokensTableRow")[0]).toBeInTheDocument();
		});

		const sendButton = screen.getAllByRole("button", { name: /send/i })[0];
		await user.click(sendButton);

		expect(handleSendMock).toHaveBeenCalledTimes(1);
	});

	it("should toggle hide dust tokens", async () => {
		render(<TokensTable isManageMode={false} setManageMode={vi.fn()} />, {
			route,
		});

		expect(screen.getByTestId("TokenList")).toBeInTheDocument();

		await userEvent.click(screen.getAllByTestId("HideDustTokens")[0]);

		expect(screen.getAllByTestId("HideDustTokens")[0]).toBeEnabled();
	});

	it("should call setManageMode when Manage button is clicked", async () => {
		const setManageModeMock = vi.fn();

		render(<TokensTable isManageMode={false} setManageMode={setManageModeMock} />, {
			route,
		});

		await expect(screen.findAllByTestId("TokensTable_Manage")).resolves.toHaveLength(2);

		// switch to manage mode
		await userEvent.click(screen.getAllByTestId("TokensTable_Manage")[0]);

		expect(setManageModeMock).toHaveBeenCalledWith(true);
	});

	it("should call setManageMode when Save button is clicked", async () => {
		const setManageModeMock = vi.fn();

		render(<TokensTable isManageMode={true} setManageMode={setManageModeMock} />, {
			route,
		});

		expect(screen.queryByTestId("TokensTable_Manage")).not.toBeInTheDocument();

		// ensure Cancel and Save buttons are visible
		expect(screen.getAllByTestId("TokensTable_Cancel")).toHaveLength(2);
		expect(screen.getAllByTestId("TokensTable_Save")).toHaveLength(2);

		await userEvent.click(screen.getAllByTestId("TokensTable_Save")[0]);

		expect(setManageModeMock).toHaveBeenCalledWith(false);
	});

	it("should call setManageModel when Cancel button is clicked", async () => {
		const setManageModeMock = vi.fn();

		render(<TokensTable isManageMode={true} setManageMode={setManageModeMock} />, {
			route,
		});

		expect(screen.queryByTestId("TokensTable_Manage")).not.toBeInTheDocument();

		// ensure Cancel and Save buttons are visible
		expect(screen.getAllByTestId("TokensTable_Cancel")).toHaveLength(2);
		expect(screen.getAllByTestId("TokensTable_Save")).toHaveLength(2);

		await userEvent.click(screen.getAllByTestId("TokensTable_Cancel")[0]);

		expect(setManageModeMock).toHaveBeenCalledWith(false);
	});

	it("should show toggle row visibility", async () => {
		render(<TokensTable isManageMode={true} setManageMode={vi.fn()} />, {
			route,
		});

		expect(screen.queryByTestId("TokensTable_Manage")).not.toBeInTheDocument();

		const getCheckbox = () => screen.getByTestId("TokenRow_VisibilityToggle");

		await waitFor(() => {
			expect(getCheckbox()).toBeChecked();
		});

		await userEvent.click(getCheckbox());

		expect(getCheckbox()).not.toBeChecked();

		await userEvent.click(getCheckbox());

		expect(getCheckbox()).toBeChecked();
	});

	it("should open delete token confirmation modal when delete button is clicked", async () => {
		render(<TokensTable isManageMode={true} setManageMode={vi.fn()} />, {
			route,
		});

		expect(screen.queryByTestId("TokensTable_Manage")).not.toBeInTheDocument();

		// Verify modal is not visible initially
		expect(screen.queryByText("Delete Token")).not.toBeInTheDocument();

		await expect(screen.findByTestId("TokenRow_DeleteToken")).resolves.toBeVisible();

		// Click delete button to open modal
		const deleteButton = screen.getByTestId("TokenRow_DeleteToken");
		await userEvent.click(deleteButton);

		// Verify modal is open
		await expect(screen.findByText("Delete Token")).resolves.toBeVisible();
	});

	it("should close delete token confirmation modal when onClose is called", async () => {
		render(<TokensTable isManageMode={true} setManageMode={vi.fn()} />, {
			route,
		});

		expect(screen.queryByTestId("TokensTable_Manage")).not.toBeInTheDocument();

		await expect(screen.findByTestId("TokenRow_DeleteToken")).resolves.toBeVisible();

		// Click delete button to open modal
		const deleteButton = screen.getByTestId("TokenRow_DeleteToken");
		await userEvent.click(deleteButton);

		// Verify modal is open
		await expect(screen.findByText("Delete Token")).resolves.toBeVisible();

		// Click cancel button to close modal
		const cancelButton = screen.getByTestId("DeleteResource__cancel-button");
		await userEvent.click(cancelButton);

		// Verify modal is closed
		await waitFor(() => {
			expect(screen.queryByText("Delete Token")).not.toBeInTheDocument();
		});
	});
});
