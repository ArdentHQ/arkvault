/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { Transactions } from "./Transactions";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import {
	env,
	getDefaultProfileId,
	MNEMONICS,
	render,
	renderResponsiveWithRoute,
	screen,
	syncDelegates,
	waitFor,
	within,
} from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";
import transactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions.json";

const history = createHashHistory();
let profile: Contracts.IProfile;

const fixtureProfileId = getDefaultProfileId();
let dashboardURL: string;

describe("Transactions", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(fixtureProfileId);

		await env.profiles().restore(profile);
		await profile.sync();

		await syncDelegates(profile);
	});

	beforeEach(async () => {
		dashboardURL = `/profiles/${fixtureProfileId}/dashboard`;
		history.push(dashboardURL);
	});

	it("should render", async () => {
		render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} wallets={profile.wallets().values()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(30),
		);
	});

	it("should render with custom title", async () => {
		render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} wallets={profile.wallets().values()} title={<span>Test</span>} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(30),
		);
	});

	it("should render hidden", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} wallets={profile.wallets().values()} isVisible={false} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should filter by type and see empty results text", async () => {
		const emptyProfile = await env.profiles().create("test2");

		const wallet = await emptyProfile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: MNEMONICS[2],
			network: "ark.devnet",
		});

		emptyProfile.wallets().push(wallet);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} wallets={profile.wallets().values()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(30),
		);

		const button = screen.getAllByRole("button", { name: /Type/ })[0];

		expect(button).toBeInTheDocument();

		expect(button).not.toBeDisabled();

		server.use(
			requestMock("https://ark-test.arkvault.io/api/transactions", {
				data: [],
				meta: transactionsFixture.meta,
			}),
		);

		await userEvent.click(button);

		const options = screen.getAllByTestId("FilterOption__checkbox");

		await userEvent.click(options.at(0));

		await expect(screen.findByTestId("EmptyBlock")).resolves.toBeVisible();
	});

	it("should filter by type", async () => {
		render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} wallets={profile.wallets().values()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(30),
		);

		const button = screen.getAllByRole("button", { name: /Type/ })[0];

		expect(button).toBeInTheDocument();

		expect(button).not.toBeDisabled();

		await userEvent.click(button);

		const options = screen.getAllByTestId("FilterOption__checkbox");

		await userEvent.click(options.at(1));

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(30),
		);
	});

	it("should filter by type on mobile", async () => {
		renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} wallets={profile.wallets().values()} />
			</Route>,
			"xs",
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(30),
		);

		const button = within(screen.getByTestId("FilterTransactions--Mobile")).getByTestId("CollapseToggleButton");

		expect(button).toBeInTheDocument();

		expect(button).not.toBeDisabled();

		await userEvent.click(button);

		const options = screen.getAllByTestId("FilterOption__checkbox");

		await userEvent.click(options.at(1));

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(30),
		);
	});

	it("should filter by type and see empty screen", async () => {
		render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} wallets={[profile.wallets().first()]} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(15),
		);

		const button = screen.getAllByRole("button", { name: /Type/ })[0];

		expect(button).toBeInTheDocument();

		expect(button).not.toBeDisabled();

		server.use(
			requestMock("https://ark-test.arkvault.io/api/transactions", {
				data: [],
				meta: transactionsFixture.meta,
			}),
		);

		await userEvent.click(button);

		const options = screen.getAllByTestId("FilterOption__checkbox");

		await userEvent.click(options.at(-1));

		await expect(screen.findByTestId("EmptyBlock")).resolves.toBeVisible();
	});

	it("should open detail modal on transaction row click", async () => {
		await env.profiles().restore(profile);
		await profile.sync();

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} wallets={profile.wallets().values()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(30),
		);

		await userEvent.click(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")[0]);

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId("Modal__close-button"));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should fetch more transactions", async () => {
		process.env.REACT_APP_IS_UNIT = "1";

		await env.profiles().restore(profile);
		await profile.sync();

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} isLoading={false} wallets={profile.wallets().values()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

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
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} isLoading={false} wallets={profile.wallets().values()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() => {
			expect(screen.queryByTestId("transactions__fetch-more-button")).not.toBeInTheDocument();
		});

		await waitFor(() => {
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(30);
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should show loading state if set", async () => {
		await env.profiles().restore(profile);
		await profile.sync();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions isLoading profile={profile} wallets={profile.wallets().values()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() => {
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(8);
		});
	});

	it("should abort previous request", async () => {
		server.use(
			requestMock("https://ark-test.arkvault.io/api/transactions", {
				data: transactionsFixture.data.slice(0, 4),
				meta: transactionsFixture.meta,
			}),
			requestMock("https://ark-test.arkvault.io/api/transactions", {
				data: transactionsFixture.data.slice(0, 1),
				meta: transactionsFixture.meta,
			}),
		);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} isLoading={false} wallets={profile.wallets().values()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() => expect(screen.getAllByTestId("TableRow")).toHaveLength(30), { timeout: 500 });

		await userEvent.click(screen.getByTestId("tabs__tab-button-received"));
		await userEvent.click(screen.getByTestId("tabs__tab-button-sent"));

		await waitFor(() => expect(screen.getAllByTestId("TableRow")).toHaveLength(8), { timeout: 1000 });
	});

	it("should filter by mode", async () => {
		render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} wallets={profile.wallets().values()} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(30),
		);

		await userEvent.click(screen.getByTestId("tabs__tab-button-sent"));

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(8),
		);
	});

	it("should filter by mode on mobile", async () => {
		renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} wallets={profile.wallets().values()} />
			</Route>,
			"xs",
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow__mobile")).toHaveLength(30),
		);

		const button = screen.getByTestId("dropdown__toggle-Transactions--filter-dropdown");

		expect(button).toBeInTheDocument();

		expect(button).not.toBeDisabled();

		await userEvent.click(button);

		const dropdownContainer = within(screen.getByTestId("dropdown__content-Transactions--filter-dropdown"));

		await expect(dropdownContainer.findByTestId("dropdown__option--2")).resolves.toBeVisible();

		await userEvent.click(dropdownContainer.getByTestId("dropdown__option--2"));

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow__mobile")).toHaveLength(8),
		);
	});

	it("should ignore tab change on loading state", async () => {
		render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={profile} wallets={profile.wallets().values()} isLoading={true} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(8),
		);

		await userEvent.click(screen.getByTestId("tabs__tab-button-sent"));

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(8),
		);
	});

	it("should show empty message", async () => {
		const emptyProfile = await env.profiles().create("test-empty");
		const emptyProfileURL = `/profiles/${emptyProfile.id()}/dashboard`;

		history.push(emptyProfileURL);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions profile={emptyProfile} wallets={[]} />
			</Route>,
			{
				history,
				route: emptyProfileURL,
			},
		);

		await expect(screen.findByTestId("EmptyBlock")).resolves.toBeVisible();
	});

	it("should update wallet filters", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<Transactions isUpdatingWallet={true} profile={profile} wallets={[]} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await expect(screen.findByTestId("EmptyBlock")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});
});
