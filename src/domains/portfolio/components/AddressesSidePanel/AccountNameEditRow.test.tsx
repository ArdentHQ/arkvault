import { Contracts } from "@/app/lib/profiles";
import { env, getMainsailProfileId, render, screen, waitFor } from "@/utils/testing-library";
import { AccountNameEditRow } from "./AccountNameEditRow";
import { expect } from "vitest";
import userEvent from "@testing-library/user-event";

describe("AccountNameEditRow", () => {
	let profile: Contracts.IProfile;

	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should render", () => {
		render(
			<AccountNameEditRow profile={profile} wallets={profile.wallets().values()} accountName="Test Account" />,
		);

		expect(screen.getByTestId("AccountNameEditRow__wrapper")).toBeInTheDocument();
	});

	it("should render as regular", () => {
		render(<AccountNameEditRow profile={profile} wallets={profile.wallets().values()} accountName="undefined" />);

		expect(screen.getByTestId("AccountNameEditRow__empty")).toBeInTheDocument();
	});

	it("should edit account name", async () => {
		render(
			<AccountNameEditRow profile={profile} wallets={profile.wallets().values()} accountName="Test Account" />,
		);

		expect(screen.getByTestId("AccountNameEditRow__wrapper")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("AccountNameEditRow__edit"));
		expect(screen.getByTestId("AccountNameEditRow__edit"));

		await waitFor(() => {
			expect(screen.getByTestId("UpdateWalletName__input")).toBeInTheDocument();
		});

		await userEvent.clear(screen.getByTestId("UpdateWalletName__input"));
		await userEvent.type(screen.getByTestId("UpdateWalletName__input"), "new name");

		await waitFor(() => {
			expect(screen.getByTestId("UpdateWalletName__input")).toHaveValue("new name");
		});

		await userEvent.click(screen.getByTestId("UpdateWalletName__submit"));

		await waitFor(() => expect(screen.queryByTestId("UpdateWalletName__submit")).not.toBeInTheDocument());
	});

	it("should call onDelete when delete button clicked", async () => {
		const onDelete = vi.fn();
		render(
			<AccountNameEditRow
				profile={profile}
				wallets={profile.wallets().values()}
				accountName="Test Account"
				onDelete={onDelete}
			/>,
		);

		const buttons = await screen.findAllByRole("button");
		await userEvent.click(buttons[1]);
		expect(onDelete).toHaveBeenCalled();
	});

	it("should render delete confirmation when isDeleting is true", async () => {
		const onConfirmDelete = vi.fn();
		const onCancelDelete = vi.fn();
		render(
			<AccountNameEditRow
				profile={profile}
				wallets={profile.wallets().values()}
				accountName="Test Account"
				isDeleting={true}
				onConfirmDelete={onConfirmDelete}
				onCancelDelete={onCancelDelete}
			/>,
		);

		expect(screen.getByTestId("DeleteAddressMessage")).toBeInTheDocument();
	});

	it("should call onConfirmDelete when confirm button clicked", async () => {
		const onConfirmDelete = vi.fn();
		render(
			<AccountNameEditRow
				profile={profile}
				wallets={profile.wallets().values()}
				accountName="Test Account"
				isDeleting={true}
				onConfirmDelete={onConfirmDelete}
			/>,
		);

		await userEvent.click(screen.getByTestId("ConfirmDelete"));
		expect(onConfirmDelete).toHaveBeenCalled();
	});

	it("should call onCancelDelete and reset editing state when cancel button clicked", async () => {
		const onCancelDelete = vi.fn();
		render(
			<AccountNameEditRow
				profile={profile}
				wallets={profile.wallets().values()}
				accountName="Test Account"
				isDeleting={true}
				onCancelDelete={onCancelDelete}
			/>,
		);

		await userEvent.click(screen.getByTestId("CancelDelete"));
		expect(onCancelDelete).toHaveBeenCalled();
	});

	it("should call onCancel when cancel button clicked in UpdateAccountName", async () => {
		render(
			<AccountNameEditRow profile={profile} wallets={profile.wallets().values()} accountName="Test Account" />,
		);

		await userEvent.click(screen.getByTestId("AccountNameEditRow__edit"));

		await waitFor(() => {
			expect(screen.getByTestId("UpdateWalletName__input")).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId("UpdateWalletName__cancel"));

		await waitFor(() => {
			expect(screen.queryByTestId("UpdateWalletName__input")).not.toBeInTheDocument();
		});
	});
});
