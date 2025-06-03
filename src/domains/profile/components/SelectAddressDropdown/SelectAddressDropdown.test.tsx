import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { SelectAddressDropdown } from "./SelectAddressDropdown";
import { env, getMainsailProfileId, MAINSAIL_MNEMONICS, render, screen, waitFor } from "@/utils/testing-library";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let wallets: Contracts.IReadWriteWallet[];

const firstOptionTestId = "SelectDropdown__option--0";

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

	it("should render with wallet name by default", () => {
		const displayNameSpy = vi.spyOn(wallet, "displayName").mockReturnValue("test");

		render(<SelectAddressDropdown wallets={wallets} profile={profile} wallet={wallet} />);

		expect(screen.getByText("test")).toBeInTheDocument();

		displayNameSpy.mockRestore();
	});

	it("should render invalid", () => {
		const { container } = render(
			<SelectAddressDropdown isInvalid wallets={wallets} profile={profile} wallet={wallet} />,
		);

		expect(screen.getAllByTestId("Input__error")[0]).toBeVisible();

		expect(container).toMatchSnapshot();
	});

	it("should render with preselected address", () => {
		const { container } = render(<SelectAddressDropdown wallets={wallets} wallet={wallet} profile={profile} />);

		expect(screen.getByTestId("select-list__input")).toHaveValue(wallet.address());

		expect(container).toMatchSnapshot();
	});

	it("should open and close wallets modal", async () => {
		render(<SelectAddressDropdown wallets={wallets} wallet={wallet} profile={profile} />);

		expect(screen.queryByTestId(firstOptionTestId)).not.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("SelectDropdown__input"));

		expect(screen.getByTestId(firstOptionTestId)).toBeInTheDocument();

		await userEvent.keyboard("{Escape}");

		await waitFor(() => {
			expect(screen.queryByTestId(firstOptionTestId)).not.toBeInTheDocument();
		});
	});

	it("should not open if disabled", async () => {
		render(<SelectAddressDropdown wallets={wallets} wallet={wallet} profile={profile} disabled={true} />);

		expect(screen.queryByTestId(firstOptionTestId)).not.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("SelectDropdown__input"));

		expect(screen.queryByTestId(firstOptionTestId)).not.toBeInTheDocument();
	});

	it("should call onChange prop if provided", async () => {
		const onChange = vi.fn();

		render(<SelectAddressDropdown wallets={wallets} onChange={onChange} wallet={wallet} profile={profile} />);

		expect(screen.queryByTestId(firstOptionTestId)).not.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("SelectDropdown__input"));

		await waitFor(() => {
			expect(screen.getByTestId(firstOptionTestId)).toBeInTheDocument();
		});

		const firstAddress = screen.getByTestId(firstOptionTestId);

		await userEvent.click(firstAddress);

		await waitFor(() => {
			expect(screen.queryByTestId(firstOptionTestId)).not.toBeInTheDocument();
		});

		expect(onChange).toHaveBeenCalledWith(wallets[0]);
	});
});
