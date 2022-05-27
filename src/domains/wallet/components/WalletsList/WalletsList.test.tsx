import { Networks } from "@payvo/sdk";
import { Contracts } from "@payvo/sdk-profiles";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import userEvent from "@testing-library/user-event";
import { WalletsList } from "./WalletsList";
import * as envHooks from "@/app/hooks/env";
import {
	env,
	getDefaultProfileId,
	render,
	renderResponsive,
	screen,
	syncDelegates,
	within,
} from "@/utils/testing-library";
const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;
const history = createHashHistory();

const starredButton = () => within(screen.getByTestId("table__th--0")).getByRole("button");

const otherButton = () => screen.getByTestId("table__th--1");

describe("WalletsList", () => {
	let profile: Contracts.IProfile;
	let wallets: Contracts.IReadWriteWallet[];
	let network: Networks.Network;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		wallets = profile.wallets().valuesWithCoin();

		network = wallets[0].network();

		wallets = wallets.filter((wallet) => wallet.network() === network);

		await profile.sync();
		await syncDelegates(profile);

		history.push(dashboardURL);

		jest.spyOn(envHooks, "useActiveProfile").mockReturnValue(profile);
	});

	it("should render", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsList wallets={wallets} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("WalletsList")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render responsive", () => {
		const { asFragment } = renderResponsive(<WalletsList wallets={wallets} />, "xs");

		expect(screen.getByTestId("WalletsList")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render empty skeleton block", () => {
		const { asFragment } = renderResponsive(<WalletsList wallets={[]} />, "lg");

		expect(screen.getByTestId("WalletsList")).toBeInTheDocument();
		expect(screen.getAllByTestId("TableRow")).toHaveLength(3);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should group starred wallets at the top", () => {
		// Mark second wallet as starred
		wallets[1].toggleStarred();

		const { asFragment } = renderResponsive(<WalletsList wallets={wallets} />, "lg");

		expect(starredButton()).toHaveTextContent("star-filled.svg");

		expect(screen.getAllByTestId("TableCell_Wallet")[0]).toHaveTextContent(wallets[1].displayName());

		expect(screen.getAllByTestId("TableCell_Wallet")[1]).toHaveTextContent(wallets[0].displayName());

		userEvent.click(starredButton());

		expect(starredButton()).toHaveTextContent("star.svg");

		expect(screen.getAllByTestId("TableCell_Wallet")[0]).toHaveTextContent(wallets[0].displayName());

		expect(screen.getAllByTestId("TableCell_Wallet")[1]).toHaveTextContent(wallets[1].displayName());

		userEvent.click(starredButton());

		expect(starredButton()).toHaveTextContent("star-filled.svg");

		expect(screen.getAllByTestId("TableCell_Wallet")[0]).toHaveTextContent(wallets[1].displayName());

		expect(screen.getAllByTestId("TableCell_Wallet")[1]).toHaveTextContent(wallets[0].displayName());

		expect(asFragment()).toMatchSnapshot();

		// Rollback starred state
		wallets[1].toggleStarred();
	});

	it("should keep the original sort method when grouping starred wallets at the top", () => {
		renderResponsive(<WalletsList wallets={wallets} />, "lg");

		expect(starredButton()).toHaveTextContent("star-filled.svg");

		expect(otherButton()).toHaveTextContent("chevron-down-small.svg");

		userEvent.click(starredButton());

		expect(starredButton()).toHaveTextContent("star.svg");

		expect(otherButton()).toHaveTextContent("chevron-down-small.svg");

		userEvent.click(otherButton());

		userEvent.click(starredButton());

		expect(otherButton()).toHaveTextContent("chevron-down-small.svg");

		expect(starredButton()).toHaveTextContent("star-filled.svg");
	});
});
