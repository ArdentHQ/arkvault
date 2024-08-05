import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { SearchRecipient } from "./SearchRecipient";
import { RecipientProperties } from "./SearchRecipient.contracts";
import { translations } from "@/domains/transaction/i18n";
import { env, getDefaultProfileId, render, screen, waitFor, within, renderResponsive } from "@/utils/testing-library";

let profile: Contracts.IProfile;
let recipients: RecipientProperties[];

const modalDescription = () =>
	expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SEARCH_RECIPIENT.DESCRIPTION);

const firstAddress = () => screen.getByTestId("RecipientListItem__selected-button-0");

describe("SearchRecipient", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		const wallets: Contracts.IReadWriteWallet[] = profile.wallets().values();

		recipients = wallets.map((wallet) => ({
			address: wallet.address(),
			alias: wallet.alias(),
			avatar: wallet.avatar(),
			id: wallet.id(),
			network: wallet.networkId(),
			type: "wallet",
		}));
	});

	it("should not render if not open", () => {
		const { asFragment } = render(
			<SearchRecipient profile={profile} isOpen={false} recipients={recipients} onAction={vi.fn} />,
		);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a modal", () => {
		const { asFragment } = render(
			<SearchRecipient profile={profile} isOpen={true} recipients={recipients} onAction={vi.fn} />,
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SEARCH_RECIPIENT.TITLE);
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SEARCH_RECIPIENT.DESCRIPTION);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should handle close", () => {
		const onClose = vi.fn();

		render(
			<SearchRecipient
				profile={profile}
				isOpen={true}
				recipients={recipients}
				onClose={onClose}
				onAction={vi.fn}
			/>,
		);

		userEvent.click(screen.getByTestId("Modal__close-button"));

		expect(onClose).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should render a modal with custom title and description", () => {
		const title = "Modal title";
		const description = "Modal description";
		const { asFragment } = render(
			<SearchRecipient
				profile={profile}
				isOpen={true}
				recipients={recipients}
				title={title}
				description={description}
				onAction={vi.fn()}
			/>,
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent("Modal title");
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent("Modal description");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with selected address", () => {
		const onAction = vi.fn();

		const { asFragment } = render(
			<SearchRecipient
				profile={profile}
				isOpen={true}
				recipients={recipients}
				selectedAddress="D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD"
				onAction={onAction}
			/>,
		);

		expect(firstAddress()).toBeInTheDocument();

		userEvent.click(firstAddress());

		expect(onAction).toHaveBeenCalledWith(recipients[0].address);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with selected address when no compact", () => {
		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, true);

		const onAction = vi.fn();

		const { asFragment } = render(
			<SearchRecipient
				profile={profile}
				isOpen={true}
				recipients={recipients}
				selectedAddress="D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD"
				onAction={onAction}
			/>,
		);

		expect(firstAddress()).toBeInTheDocument();

		userEvent.click(firstAddress());

		expect(onAction).toHaveBeenCalledWith(recipients[0].address);

		expect(asFragment()).toMatchSnapshot();

		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, false);
	});

	it("should render with no alias if the recipient address is undefined", () => {
		const onAction = vi.fn();

		const { asFragment } = render(
			<SearchRecipient
				profile={profile}
				isOpen={true}
				recipients={[
					{
						...recipients[0],
						alias: undefined,
					},
				]}
				onAction={onAction}
			/>,
		);

		expect(screen.getByTestId("RecipientListItem__select-button-0")).toBeInTheDocument();
		expect(screen.queryByTestId("RecipientListItem__alias-0")).not.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	})

	it("should call onAction when no address is selected", () => {
		const onAction = vi.fn();

		const { asFragment } = render(
			<SearchRecipient profile={profile} isOpen={true} recipients={recipients} onAction={onAction} />,
		);

		userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));
		expect(onAction).toHaveBeenCalledWith(recipients[0].address);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with contact on mobile", () => {
		const { asFragment } = renderResponsive(
			<SearchRecipient
				profile={profile}
				isOpen={true}
				recipients={[
					{
						...recipients[0],
						type: "contact",
					},
				]}
				selectedAddress={recipients[0].address}
				onAction={vi.fn()}
			/>,
			"xs",
		);

		expect(within(screen.getByTestId("WalletListItemMobile--selected")).getByText("(Contact)")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with my wallet on mobile", () => {
		const { asFragment } = renderResponsive(
			<SearchRecipient
				profile={profile}
				isOpen={true}
				recipients={[
					{
						...recipients[0],
						type: "wallet",
					},
				]}
				selectedAddress={recipients[0].address}
				onAction={vi.fn()}
			/>,
			"xs",
		);

		expect(within(screen.getByTestId("WalletListItemMobile--selected")).getByText("(My Wallet)")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with my wallet on desktop", () => {
		const { asFragment } = renderResponsive(
			<SearchRecipient
				profile={profile}
				isOpen={true}
				recipients={[
					{
						...recipients[0],
						type: "wallet",
					},
				]}
				selectedAddress={recipients[0].address}
				onAction={vi.fn()}
			/>,
			"md",
		);

		expect(screen.getByTestId("RecipientListItem__type")).toHaveTextContent("My Wallet");

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with contact on desktop", () => {
		const { asFragment } = renderResponsive(
			<SearchRecipient
				profile={profile}
				isOpen={true}
				recipients={[
					{
						...recipients[0],
						type: "contact",
					},
				]}
				selectedAddress={recipients[0].address}
				onAction={vi.fn()}
			/>,
			"md",
		);

		expect(screen.getByTestId("RecipientListItem__type")).toHaveTextContent("Contact");

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with selected address on mobile", () => {
		const onAction = vi.fn();

		const { asFragment } = renderResponsive(
			<SearchRecipient
				profile={profile}
				isOpen={true}
				recipients={recipients}
				selectedAddress="D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD"
				onAction={onAction}
			/>,
			"xs",
		);

		const selected = within(screen.getByTestId("SearchRecipientListItemResponsive--item-0")).getByTestId(
			"WalletListItemMobile--selected",
		);

		expect(selected).toBeInTheDocument();

		userEvent.click(
			within(screen.getByTestId("SearchRecipientListItemResponsive--item-1")).getByTestId("WalletListItemMobile"),
		);

		expect(onAction).toHaveBeenCalledWith(recipients[1].address);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with selected address on md screen", () => {
		const onAction = vi.fn();

		const { asFragment } = renderResponsive(
			<SearchRecipient
				isOpen={true}
				recipients={recipients}
				selectedAddress="D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD"
				onAction={onAction}
			/>,
			"md",
		);

		expect(firstAddress()).toBeInTheDocument();

		userEvent.click(firstAddress());

		expect(onAction).toHaveBeenCalledWith(recipients[0].address);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should filter recipients by address", async () => {
		render(<SearchRecipient profile={profile} isOpen={true} recipients={recipients} onAction={vi.fn} />);

		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SEARCH_RECIPIENT.TITLE),
		);
		await waitFor(modalDescription);

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(2));

		userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		await expect(screen.findByTestId("HeaderSearchBar__input")).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId("HeaderSearchBar__input")).getByTestId("Input");
		await waitFor(() => expect(searchInput).toBeInTheDocument());

		userEvent.paste(searchInput, "D8rr7B1d6TL6pf1");

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(1));
	});

	it("should filter recipients by alias", async () => {
		render(<SearchRecipient profile={profile} isOpen={true} recipients={recipients} onAction={vi.fn} />);

		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SEARCH_RECIPIENT.TITLE),
		);
		await waitFor(modalDescription);

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(2));

		userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		await expect(screen.findByTestId("HeaderSearchBar__input")).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId("HeaderSearchBar__input")).getByTestId("Input");
		await waitFor(() => expect(searchInput).toBeInTheDocument());

		userEvent.paste(searchInput, "Ark Wallet 1");

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(1));
	});

	it("should reset recipient search", async () => {
		render(<SearchRecipient profile={profile} isOpen={true} recipients={recipients} onAction={vi.fn} />);

		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SEARCH_RECIPIENT.TITLE),
		);
		await waitFor(modalDescription);

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(2));

		userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		await expect(screen.findByTestId("HeaderSearchBar__input")).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId("HeaderSearchBar__input")).getByTestId("Input");
		await waitFor(() => expect(searchInput).toBeInTheDocument());

		userEvent.paste(searchInput, "Ark Wallet 1");

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(1));

		// Reset search
		userEvent.click(screen.getByTestId("header-search-bar__reset"));

		await waitFor(() => expect(searchInput).not.toHaveValue());
		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(2));
	});

	it("should not find recipient and show empty results screen", async () => {
		render(<SearchRecipient profile={profile} isOpen={true} recipients={recipients} onAction={vi.fn} />);

		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SEARCH_RECIPIENT.TITLE),
		);
		await waitFor(modalDescription);

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(2));

		userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		await expect(screen.findByTestId("HeaderSearchBar__input")).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId("HeaderSearchBar__input")).getByTestId("Input");
		await waitFor(() => expect(searchInput).toBeInTheDocument());

		userEvent.paste(searchInput, "non-existent recipient address");

		await waitFor(() => expect(screen.getByTestId("Input")).toHaveValue("non-existent recipient address"));
		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(0));

		await expect(screen.findByTestId("EmptyResults")).resolves.toBeVisible();
	});

	it.each(["xs", "sm"])("has a search input on responsive screen", (breakpoint) => {
		renderResponsive(
			<SearchRecipient
				profile={profile}
				isOpen={true}
				recipients={recipients}
				selectedAddress="D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD"
			/>,
			breakpoint,
		);

		const searchInput = screen.getByTestId("HeaderSearchInput__input__input");

		expect(searchInput).toBeInTheDocument();
		expect(searchInput).toHaveValue("");

		userEvent.paste(searchInput, "something");

		expect(searchInput).toHaveValue("something");

		const resetSearchButton = screen.getByTestId("HeaderSearchInput__input__reset");

		expect(resetSearchButton).toBeInTheDocument();

		userEvent.click(resetSearchButton);

		expect(searchInput).toHaveValue("");
	});
});
