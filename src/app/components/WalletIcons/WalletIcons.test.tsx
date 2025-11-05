/* eslint-disable testing-library/no-node-access */
import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { WalletIcons, WalletIconsSkeleton } from "./WalletIcons";
import { env, getMainsailProfileId, render, screen } from "@/utils/testing-library";

let wallet: Contracts.IReadWriteWallet;

describe("WalletIcons", () => {
	beforeEach(async () => {
		wallet = env.profiles().findById(getMainsailProfileId()).wallets().first();
		await wallet.synchroniser().identity();
	});

	it("should render with tooltip in the dark mode", async () => {
		const walletSpy = vi.spyOn(wallet, "isKnown").mockReturnValue(true);

		const { asFragment } = render(<WalletIcons wallet={wallet} />);

		await userEvent.hover(screen.getByTestId("WalletIcon__Verified"));

		walletSpy.mockRestore();
		expect(asFragment()).toMatchSnapshot()
	});

	it("should render the verified icon", () => {
		const walletSpy = vi.spyOn(wallet, "isKnown").mockReturnValue(true);

		render(<WalletIcons wallet={wallet} />);

		expect(screen.getByTestId("WalletIcon__Verified")).toBeInTheDocument();
		expect(document.querySelector("svg#user-check-mark")).toBeInTheDocument();

		walletSpy.mockRestore();
	});

	it("should render the ledger icon", () => {
		const walletSpy = vi.spyOn(wallet, "isLedger").mockReturnValue(true);

		render(<WalletIcons wallet={wallet} />);

		expect(screen.getByTestId("WalletIcon__Ledger")).toBeInTheDocument();
		expect(document.querySelector("svg#ledger")).toBeInTheDocument();

		walletSpy.mockRestore();
	});

	it("should render the second signature icon", () => {
		const hasSyncedWithNetworkSpy = vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		const walletSpy = vi.spyOn(wallet, "isSecondSignature").mockReturnValue(true);

		render(<WalletIcons wallet={wallet} />);

		expect(screen.getByTestId("WalletIcon__SecondSignature")).toBeInTheDocument();

		walletSpy.mockRestore();
		hasSyncedWithNetworkSpy.mockRestore();
	});

	it("should render the star icon", () => {
		const walletSpy = vi.spyOn(wallet, "isStarred").mockReturnValue(true);

		render(<WalletIcons wallet={wallet} />);

		expect(screen.getByTestId("WalletIcon__Starred")).toBeInTheDocument();
		expect(document.querySelector("svg#star-filled")).toBeInTheDocument();

		walletSpy.mockRestore();
	});

	it("should render the test network icon", () => {
		const walletSpy = vi.spyOn(wallet.network(), "isTest").mockReturnValue(true);

		render(<WalletIcons wallet={wallet} />);

		expect(screen.getByTestId("WalletIcon__TestNetwork")).toBeInTheDocument();
		expect(document.querySelector("svg#code")).toBeInTheDocument();

		walletSpy.mockRestore();
	});

	it("should not render excluded icons", () => {
		const walletSpy = vi.spyOn(wallet, "isStarred").mockReturnValue(true);

		render(<WalletIcons wallet={wallet} exclude={["isStarred"]} />);

		expect(screen.queryByTestId("WalletIcon__Starred")).not.toBeInTheDocument();
		expect(document.querySelector("svg#star-filled")).not.toBeInTheDocument();

		walletSpy.mockRestore();
	});

	it("should render wallet icon skeleton", () => {
		const { asFragment } = render(<WalletIconsSkeleton />);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render the username icon", async () => {
		vi.spyOn(wallet, "username").mockReturnValue("test");

		render(<WalletIcons wallet={wallet} />);

		expect(screen.getByTestId("WalletIcon__Username")).toBeInTheDocument();

		await userEvent.hover(screen.getByTestId("WalletIcon__Username"));

		expect(screen.getByRole("tooltip")).toHaveTextContent("Username: test");
	});
});
