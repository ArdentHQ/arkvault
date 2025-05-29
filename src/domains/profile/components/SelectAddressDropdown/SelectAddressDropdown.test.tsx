import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { SelectAddressDropdown } from "./SelectAddressDropdown";
import { env, getMainsailProfileId, MAINSAIL_MNEMONICS, render, screen, waitFor } from "@/utils/testing-library";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let wallets: Contracts.IReadWriteWallet[];

describe("SelectAddressDropdown", () => {
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
		const { container } = render(<SelectAddressDropdown wallets={wallets} profile={profile} />);

		expect(container).toMatchSnapshot();
	});

	it("should render disabled", () => {
		const { container } = render(<SelectAddressDropdown disabled wallets={wallets} profile={profile} />);

		expect(container).toMatchSnapshot();
	});

	it("should render without user icon", () => {
		const { container } = render(
			<SelectAddressDropdown showUserIcon={false} wallets={wallets} profile={profile} />,
		);

		expect(container).toMatchSnapshot();
	});

	it("should render without a wallet avatar", () => {
		render(<SelectAddressDropdown showWalletAvatar={false} wallets={wallets} profile={profile} />);

		expect(screen.queryByTestId("Avatar")).not.toBeInTheDocument();
	});

	it("should render with wallet name by default", () => {
		const displayNameSpy = vi.spyOn(wallet, "displayName").mockReturnValue("test");

		render(
			<SelectAddressDropdown
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
			<SelectAddressDropdown
				showWalletName={false}
				wallets={wallets}
				profile={profile}
				wallet={{ address: wallet.address(), network: wallet.network() }}
			/>,
		);

		expect(screen.queryByTestId("Address__alias")).not.toBeInTheDocument();
	});

	it("should render invalid", () => {
		const { container } = render(<SelectAddressDropdown isInvalid wallets={wallets} profile={profile} />);

		expect(screen.getByTestId("Input__error")).toBeVisible();
		expect(container).toMatchSnapshot();
	});

	it("should render with preselected address", () => {
		const { container } = render(
			<SelectAddressDropdown
				wallets={wallets}
				wallet={{ address: wallet.address(), network: wallet.network() }}
				profile={profile}
			/>,
		);

		expect(screen.getByTestId("SelectAddressDropdown__input")).toHaveValue(wallet.address());

		expect(container).toMatchSnapshot();
	});

	it("should open and close wallets modal", async () => {
		render(
			<SelectAddressDropdown
				wallets={wallets}
				wallet={{ address: wallet.address(), network: wallet.network() }}
				profile={profile}
			/>,
		);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("SelectAddressDropdown__wrapper"));

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("Modal__close-button"));

		await waitFor(() => {
			expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		});
	});

	it("should not open if disabled", async () => {
		render(
			<SelectAddressDropdown
				wallets={wallets}
				wallet={{ address: wallet.address(), network: wallet.network() }}
				profile={profile}
				disabled={true}
			/>,
		);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("SelectAddressDropdown__wrapper"));

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
	});

	it("should select address from wallets modal", async () => {
		render(
			<SelectAddressDropdown
				wallets={wallets}
				wallet={{ address: wallet.address(), network: wallet.network() }}
				profile={profile}
			/>,
		);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("SelectAddressDropdown__wrapper"));

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		const firstAddress = screen.getByTestId("SearchWalletListItem__select-0");

		await userEvent.click(firstAddress);

		await waitFor(() => {
			expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		});

		expect(screen.getByTestId("SelectAddressDropdown__input")).toHaveValue(wallets[0].address());
	});

	it("should not open wallets modal if disabled", async () => {
		render(
			<SelectAddressDropdown
				wallets={wallets}
				disabled
				wallet={{ address: wallet.address(), network: wallet.network() }}
				profile={profile}
			/>,
		);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("SelectAddressDropdown__wrapper"));

		await waitFor(() => {
			expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		});
	});

	it("should call onChange prop if provided", async () => {
		const onChange = vi.fn();

		render(
			<SelectAddressDropdown
				wallets={wallets}
				onChange={onChange}
				wallet={{ address: wallet.address(), network: wallet.network() }}
				profile={profile}
			/>,
		);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("SelectAddressDropdown__wrapper"));

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
});
