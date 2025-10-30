/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable sonarjs/no-duplicate-string */

import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { Transactions } from "./Transactions";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import {
	env,
	getDefaultProfileId,
	MAINSAIL_MNEMONICS,
	render,
	renderResponsiveWithRoute,
	screen,
	syncValidators,
	waitFor,
	within,
} from "@/utils/testing-library";
import { server, requestMock, requestMockOnce } from "@/tests/mocks/server";
import transactionsFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions.json";

let profile: Contracts.IProfile;

const fixtureProfileId = getDefaultProfileId();
let dashboardURL: string;

describe("Transactions", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(fixtureProfileId);

		await env.profiles().restore(profile);
		await profile.sync();

		await syncValidators(profile);
	});

	beforeEach(async () => {
		dashboardURL = `/profiles/${fixtureProfileId}/dashboard`;
	});

	it("should render", async () => {
		render(<Transactions profile={profile} wallets={profile.wallets().values()} />, {
			route: dashboardURL,
		});

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(10),
		);
	});

	it("should render with custom title", async () => {
		render(<Transactions profile={profile} wallets={profile.wallets().values()} title={<span>Test</span>} />, {
			route: dashboardURL,
		});

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(10),
		);
	});

	it("should render hidden", async () => {
		const { asFragment } = render(
			<Transactions profile={profile} wallets={profile.wallets().values()} isVisible={false} />,
			{
				route: dashboardURL,
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should filter by type and see empty results text", async () => {
		const emptyProfile = await env.profiles().create("test2");

		const wallet = await emptyProfile.walletFactory().fromMnemonicWithBIP39({
			coin: "Mainsail",
			mnemonic: MAINSAIL_MNEMONICS[2],
			network: "mainsail.devnet",
		});

		emptyProfile.wallets().push(wallet);

		render(<Transactions profile={profile} wallets={profile.wallets().values()} />, {
			route: dashboardURL,
		});

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(10),
		);

		const button = screen.getAllByRole("button", { name: /Type/ })[0];

		expect(button).toBeInTheDocument();

		expect(button).not.toBeDisabled();

		server.use(
			requestMock("https://dwallets-evm.mainsailhq.com/api/transactions", {
				data: [],
				meta: transactionsFixture.meta,
			}),
		);

		await userEvent.click(button);

		const options = screen.getAllByTestId("FilterOption__checkbox");

		await userEvent.click(options.at(0));

		await expect(screen.findByTestId("Transactions__no-filters-selected")).resolves.toBeVisible();
	});

	it("should filter by type", async () => {
		render(<Transactions profile={profile} wallets={profile.wallets().values()} />, {
			route: dashboardURL,
		});

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(10),
		);

		const button = screen.getAllByRole("button", { name: /Type/ })[0];

		expect(button).toBeInTheDocument();

		expect(button).not.toBeDisabled();

		await userEvent.click(button);

		const options = screen.getAllByTestId("FilterOption__checkbox");

		await userEvent.click(options.at(1));

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(10),
		);
	});

	it("should filter by type on mobile", async () => {
		renderResponsiveWithRoute(<Transactions profile={profile} wallets={profile.wallets().values()} />, "xs", {
			route: dashboardURL,
		});

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(10),
		);

		const button = within(screen.getByTestId("FilterTransactions--Mobile")).getByTestId("CollapseToggleButton");

		expect(button).toBeInTheDocument();

		expect(button).not.toBeDisabled();

		await userEvent.click(button);

		const options = screen.getAllByTestId("FilterOption__checkbox");

		await userEvent.click(options.at(1));

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(10),
		);
	});

	it("should disable type filter when there are no transactions", async () => {
		const emptyProfile = await env.profiles().create("test9");

		const wallet = await emptyProfile.walletFactory().fromMnemonicWithBIP39({
			coin: "Mainsail",
			mnemonic: MAINSAIL_MNEMONICS[2],
			network: "mainsail.devnet",
		});

		emptyProfile.wallets().push(wallet);

		render(<Transactions profile={emptyProfile} wallets={[wallet]} />, {
			route: dashboardURL,
		});

		await expect(screen.findByTestId("Transactions__no-results")).resolves.toBeVisible();

		const button = screen.getAllByRole("button", { name: /Type/ })[0];
		expect(button).toBeDisabled();
	});

	it("should filter by type and see empty screen", async () => {
		render(<Transactions profile={profile} wallets={[profile.wallets().first()]} />, {
			route: dashboardURL,
		});

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(10),
		);

		let button = screen.getAllByRole("button", { name: /Type/ })[0];

		expect(button).toBeInTheDocument();

		expect(button).not.toBeDisabled();

		server.use(
			requestMock("https://dwallets-evm.mainsailhq.com/api/transactions", {
				data: [],
				meta: transactionsFixture.meta,
			}),
		);

		await userEvent.click(button);

		const options = screen.getAllByTestId("FilterOption__checkbox");

		await userEvent.click(options.at(-1));

		await expect(screen.findByTestId("Transactions__no-results")).resolves.toBeVisible();

		button = screen.getAllByRole("button", { name: /Type/ })[0];
		expect(button).not.toBeDisabled();
	});

	it("should open detail side panel on transaction row click", async () => {
		await env.profiles().restore(profile);
		await profile.sync();

		const { asFragment } = render(<Transactions profile={profile} wallets={profile.wallets().values()} />, {
			route: dashboardURL,
		});

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(10),
		);

		await userEvent.click(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")[0]);

		await waitFor(() => {
			expect(screen.getByTestId("SidePanel__content")).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId("SidePanel__close-button"));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should maximize and update side panel on transaction row click", async () => {
		await env.profiles().restore(profile);
		await profile.sync();

		render(<Transactions profile={profile} wallets={profile.wallets().values()} />, {
			route: dashboardURL,
			withProviders: true,
		});

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(10),
		);

		await userEvent.click(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")[0]);

		await waitFor(() => {
			expect(screen.getByTestId("SidePanel__content")).toBeInTheDocument();
		});

		expect(within(screen.getByTestId("TransactionId")).getByText(/2dc489ca6683b7c2bc380165204/)).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("SidePanel__minimize-button"));

		await waitFor(() => {
			expect(screen.getByTestId("MinimizedSidePanel")).toBeInTheDocument();
		});

		await userEvent.click(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")[1]);

		await waitFor(() => {
			expect(screen.getByTestId("MaximizedSidePanel")).toBeInTheDocument();
		});
	});

	it("should fetch more transactions", async () => {
		process.env.REACT_APP_IS_UNIT = "1";

		await env.profiles().restore(profile);
		await profile.sync();

		// Paginated result
		server.use(
			requestMock("https://dwallets-evm.mainsailhq.com/api/transactions", {
				// transaction.data only has 10 items, create 5 items more
				data: [...transactionsFixture.data, ...transactionsFixture.data, ...transactionsFixture.data].slice(
					0,
					30,
				),
				meta: {
					...transactionsFixture.meta,
					count: 15,
					next: "/transactions?limit=30&orderBy=timestamp%3Adesc&address=0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6&fullReceipt=false&transform=true&page=2",
					totalCount: 63,
				},
			}),
		);

		const { asFragment } = render(
			<Transactions profile={profile} isLoading={false} wallets={profile.wallets().values()} />,
			{
				route: dashboardURL,
			},
		);

		await expect(screen.findByTestId("transactions__fetch-more-button")).resolves.toBeVisible();

		const fetchMoreButtonHasContent = (content) =>
			expect(screen.getByTestId("transactions__fetch-more-button")).toHaveTextContent(content);

		await waitFor(() => fetchMoreButtonHasContent(commonTranslations.LOAD_MORE));

		expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(30);

		await userEvent.click(screen.getByTestId("transactions__fetch-more-button"));

		await waitFor(() => fetchMoreButtonHasContent(commonTranslations.LOAD_MORE));

		expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(60);

		process.env.REACT_APP_IS_UNIT = undefined;

		expect(asFragment()).toMatchSnapshot();
	});

	it("should hide view more button when there are no next pages", async () => {
		await env.profiles().restore(profile);
		await profile.sync();

		const { asFragment } = render(
			<Transactions profile={profile} isLoading={false} wallets={profile.wallets().values()} />,
			{
				route: dashboardURL,
			},
		);

		await waitFor(() => {
			expect(screen.queryByTestId("transactions__fetch-more-button")).not.toBeInTheDocument();
		});

		await waitFor(() => {
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(10);
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should show loading state if set", async () => {
		await env.profiles().restore(profile);
		await profile.sync();

		render(<Transactions isLoading profile={profile} wallets={profile.wallets().values()} />, {
			route: dashboardURL,
		});

		await waitFor(() => {
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(8);
		});
	});

	it("should filter by mode", async () => {
		server.use(
			requestMockOnce("https://dwallets-evm.mainsailhq.com/api/transactions", {
				data: transactionsFixture.data,
				meta: transactionsFixture.meta,
			}),
			requestMockOnce("https://dwallets-evm.mainsailhq.com/api/transactions", {
				data: transactionsFixture.data.slice(0, 8),
				meta: transactionsFixture.meta,
			}),
		);

		render(<Transactions profile={profile} wallets={profile.wallets().values()} />, {
			route: dashboardURL,
		});

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(8),
		);

		await userEvent.click(screen.getByTestId("tabs__tab-button-sent"));

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(10),
		);
	});

	it("should filter by mode on mobile", async () => {
		server.use(
			requestMockOnce("https://dwallets-evm.mainsailhq.com/api/transactions", {
				data: transactionsFixture.data,
				meta: transactionsFixture.meta,
			}),
			requestMockOnce("https://dwallets-evm.mainsailhq.com/api/transactions", {
				data: transactionsFixture.data.slice(0, 8),
				meta: transactionsFixture.meta,
			}),
		);

		renderResponsiveWithRoute(<Transactions profile={profile} wallets={profile.wallets().values()} />, "xs", {
			route: dashboardURL,
		});

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow__mobile")).toHaveLength(8),
		);

		const button = screen.getByTestId("dropdown__toggle-Transactions--filter-dropdown");

		expect(button).toBeInTheDocument();

		expect(button).not.toBeDisabled();

		await userEvent.click(button);

		const dropdownContainer = within(screen.getByTestId("dropdown__content-Transactions--filter-dropdown"));

		await expect(dropdownContainer.findByTestId("dropdown__option--2")).resolves.toBeVisible();

		await userEvent.click(dropdownContainer.getByTestId("dropdown__option--2"));

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow__mobile")).toHaveLength(10),
		);
	});

	it("should ignore tab change on loading state", async () => {
		render(<Transactions profile={profile} wallets={profile.wallets().values()} isLoading={true} />, {
			route: dashboardURL,
		});

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(8),
		);

		await userEvent.click(screen.getByTestId("tabs__tab-button-sent"));

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(10),
		);
	});

	it("should show empty message", async () => {
		const emptyProfile = await env.profiles().create("test-empty");
		const emptyProfileURL = `/profiles/${emptyProfile.id()}/dashboard`;

		render(<Transactions profile={emptyProfile} wallets={[]} />, {
			route: emptyProfileURL,
		});

		await expect(screen.findByTestId("Transactions__no-filters-selected")).resolves.toBeVisible();
	});

	it("should update wallet filters", async () => {
		const { asFragment } = render(<Transactions isUpdatingWallet={true} profile={profile} wallets={[]} />, {
			route: dashboardURL,
		});

		await expect(screen.findByTestId("Transactions__no-filters-selected")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});
});
