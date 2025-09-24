import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { SelectAddress } from "./SelectAddress";
import { env, getMainsailProfileId, MAINSAIL_MNEMONICS, render, screen, waitFor } from "@/utils/testing-library";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let wallets: Contracts.IReadWriteWallet[];

describe("SelectAddress", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "Mainsail",
			mnemonic: MAINSAIL_MNEMONICS[0],
			network: "mainsail.devnet",
		});

		await wallet.synchroniser().identity();

		profile.wallets().push(wallet);
		wallets = profile.wallets().values();
	});

	it("should render empty", () => {
		const { container } = render(<SelectAddress wallets={wallets} profile={profile} />);

		expect(container).toMatchSnapshot();
	});

	it("should render disabled", () => {
		const { container } = render(<SelectAddress disabled wallets={wallets} profile={profile} />);

		expect(container).toMatchSnapshot();
	});

	it("should render without user icon", () => {
		const { container } = render(<SelectAddress showUserIcon={false} wallets={wallets} profile={profile} />);

		expect(container).toMatchSnapshot();
	});

	it("should render without a wallet avatar", () => {
		render(<SelectAddress wallets={wallets} profile={profile} />);

		expect(screen.queryByTestId("Avatar")).not.toBeInTheDocument();
	});

	it("should render with wallet name by default", () => {
		const displayNameSpy = vi.spyOn(wallet, "displayName").mockReturnValue("test");

		render(
			<SelectAddress
				wallets={wallets}
				profile={profile}
				wallet={{ address: wallet.address(), network: wallet.network() }}
			/>,
		);

		expect(screen.getByTestId("Address__alias")).toBeInTheDocument();

		displayNameSpy.mockRestore();
	});

	it("should render without wallet name", () => {
		render(
			<SelectAddress
				showWalletName={false}
				wallets={wallets}
				profile={profile}
				wallet={{ address: wallet.address(), network: wallet.network() }}
			/>,
		);

		expect(screen.queryByTestId("Address__alias")).not.toBeInTheDocument();
	});

	it("should render invalid", () => {
		const { container } = render(<SelectAddress isInvalid wallets={wallets} profile={profile} />);

		expect(screen.getByTestId("Input__error")).toBeVisible();
		expect(container).toMatchSnapshot();
	});

	it("should render with preselected address", () => {
		const { container } = render(
			<SelectAddress
				wallets={wallets}
				wallet={{ address: wallet.address(), network: wallet.network() }}
				profile={profile}
			/>,
		);

		expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address());

		expect(container).toMatchSnapshot();
	});

	it("should open and close wallets modal", async () => {
		render(
			<SelectAddress
				wallets={wallets}
				wallet={{ address: wallet.address(), network: wallet.network() }}
				profile={profile}
			/>,
		);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("SelectAddress__wrapper"));

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("Modal__close-button"));

		await waitFor(() => {
			expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		});
	});

	it("should not open if disabled", async () => {
		render(
			<SelectAddress
				wallets={wallets}
				wallet={{ address: wallet.address(), network: wallet.network() }}
				profile={profile}
				disabled={true}
			/>,
		);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("SelectAddress__wrapper"));

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
	});

	it("should select address from wallets modal", async () => {
		render(
			<SelectAddress
				wallets={wallets}
				wallet={{ address: wallet.address(), network: wallet.network() }}
				profile={profile}
			/>,
		);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("SelectAddress__wrapper"));

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		const firstAddress = screen.getByTestId("SearchWalletListItem__select-0");

		await userEvent.click(firstAddress);

		await waitFor(() => {
			expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		});

		expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallets[0].address());
	});

	it("should not open wallets modal if disabled", async () => {
		render(
			<SelectAddress
				wallets={wallets}
				disabled
				wallet={{ address: wallet.address(), network: wallet.network() }}
				profile={profile}
			/>,
		);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("SelectAddress__wrapper"));

		await waitFor(() => {
			expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		});
	});

	it("should call onChange prop if provided", async () => {
		const onChange = vi.fn();

		render(
			<SelectAddress
				wallets={wallets}
				onChange={onChange}
				wallet={{ address: wallet.address(), network: wallet.network() }}
				profile={profile}
			/>,
		);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("SelectAddress__wrapper"));

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		const firstAddress = screen.getByTestId("SearchWalletListItem__select-0");

		await userEvent.click(firstAddress);

		await waitFor(() => {
			expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		});

		expect(onChange).toHaveBeenCalledWith(wallets[0].address());
	});

	it("should render modern variant", async () => {
		render(<SelectAddress variant="modern" wallets={wallets} profile={profile} />);

		expect(screen.getByTestId("SelectAddress__wrapper_modern")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("SelectAddress__wrapper_modern"));

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId("Modal__close-button"));

		await waitFor(() => {
			expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		});
	});

	it("should not display alias in modern variant if showWalletName is false", () => {
		render(<SelectAddress variant="modern" wallets={wallets} profile={profile} showWalletName={false} />);

		expect(screen.queryByTestId("Address__alias")).not.toBeInTheDocument();
	});

	it("should render modern variant with label class name", () => {
		render(
			<SelectAddress
				variant="modern"
				wallets={wallets}
				profile={profile}
				labelClassName="w-auto sm:min-w-[162px]"
			/>,
		);

		expect(screen.getByTestId("SelectAddress__wrapper_modern")).toBeInTheDocument();

		expect(screen.getByTestId("DetailTitle")).toHaveClass("w-auto sm:min-w-[162px]");
	});
});
