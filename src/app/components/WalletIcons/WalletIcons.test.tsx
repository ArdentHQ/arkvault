import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { WalletIcons } from "./WalletIcons";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

let wallet: Contracts.IReadWriteWallet;

describe("WalletIcons", () => {
	beforeEach(async () => {
		wallet = env.profiles().findById(getDefaultProfileId()).wallets().first();
		await wallet.synchroniser().identity();
	});

	it("should render with tooltip in the dark mode", () => {
		const walletSpy = jest.spyOn(wallet, "isKnown").mockReturnValue(true);

		render(<WalletIcons wallet={wallet} tooltipDarkTheme />);

		userEvent.hover(screen.getByTestId("WalletIcon__Verified"));

		expect(screen.getByRole("tooltip")).toHaveAttribute("data-theme", "dark");

		walletSpy.mockRestore();
	});

	it("should render the verified icon", () => {
		const walletSpy = jest.spyOn(wallet, "isKnown").mockReturnValue(true);

		render(<WalletIcons wallet={wallet} />);

		expect(screen.getByTestId("WalletIcon__Verified")).toBeInTheDocument();
		expect(screen.getByTestId("WalletIcon__Verified")).toHaveTextContent("user-check-mark.svg");

		walletSpy.mockRestore();
	});

	it("should render the ledger icon", () => {
		const walletSpy = jest.spyOn(wallet, "isLedger").mockReturnValue(true);

		render(<WalletIcons wallet={wallet} />);

		expect(screen.getByTestId("WalletIcon__Ledger")).toBeInTheDocument();
		expect(screen.getByTestId("WalletIcon__Ledger")).toHaveTextContent("ledger.svg");

		walletSpy.mockRestore();
	});

	it("should render the second signature icon", () => {
		const hasSyncedWithNetworkSpy = jest.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		const walletSpy = jest.spyOn(wallet, "isSecondSignature").mockReturnValue(true);

		render(<WalletIcons wallet={wallet} />);

		expect(screen.getByTestId("WalletIcon__SecondSignature")).toBeInTheDocument();

		walletSpy.mockRestore();
		hasSyncedWithNetworkSpy.mockRestore();
	});

	it("should render the star icon", () => {
		const walletSpy = jest.spyOn(wallet, "isStarred").mockReturnValue(true);

		render(<WalletIcons wallet={wallet} />);

		expect(screen.getByTestId("WalletIcon__Starred")).toBeInTheDocument();
		expect(screen.getByTestId("WalletIcon__Starred")).toHaveTextContent("star-filled.svg");

		walletSpy.mockRestore();
	});

	it("should render the multisignature icon", () => {
		const hasSyncedWithNetworkSpy = jest.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		const isMultiSignatureSpy = jest.spyOn(wallet, "isMultiSignature").mockReturnValue(true);

		render(<WalletIcons wallet={wallet} />);

		expect(screen.getByTestId("WalletIcon__Multisignature")).toBeInTheDocument();
		expect(screen.getByTestId("WalletIcon__Multisignature")).toHaveTextContent("multisignature.svg");

		hasSyncedWithNetworkSpy.mockRestore();
		isMultiSignatureSpy.mockRestore();
	});

	it("should render the test network icon", () => {
		const walletSpy = jest.spyOn(wallet.network(), "isTest").mockReturnValue(true);

		render(<WalletIcons wallet={wallet} />);

		expect(screen.getByTestId("WalletIcon__TestNetwork")).toBeInTheDocument();
		expect(screen.getByTestId("WalletIcon__TestNetwork")).toHaveTextContent("code.svg");

		walletSpy.mockRestore();
	});

	it("should not render excluded icons", () => {
		const walletSpy = jest.spyOn(wallet, "isStarred").mockReturnValue(true);

		const { container } = render(<WalletIcons wallet={wallet} exclude={["isStarred"]} />);

		expect(screen.queryByTestId("WalletIcon__Starred")).not.toBeInTheDocument();
		expect(container).not.toHaveTextContent("star-filled.svg");

		walletSpy.mockRestore();
	});
});
