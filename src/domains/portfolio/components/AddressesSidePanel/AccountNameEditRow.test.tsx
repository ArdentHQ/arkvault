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
});
