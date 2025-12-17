import { env, getMainsailProfileId, render, screen } from "@/utils/testing-library";

import { TokenHeader } from "./TokenHeader";

let profile: any;
let route: string;

describe("TokenHeader", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		route = `/profiles/${profile.id()}/tokens`;
	});

	it("should render", () => {
		const { asFragment } = render(<TokenHeader profile={profile} />, {
			route,
		});

		expect(screen.getByTestId("TokensHeader")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should display correct wallet information", () => {
		render(<TokenHeader profile={profile} />, {
			route,
		});

		expect(screen.getByTestId("TokensHeader")).toBeInTheDocument();
		expect(screen.getByTestId("TokensHeader__tokens")).toBeInTheDocument();
		expect(screen.getByTestId("TokensHeader__balance")).toBeInTheDocument();
	});

	it("should handle address viewing when multiple wallets exist", () => {
		render(<TokenHeader profile={profile} />, {
			route,
		});

		const addressButton = screen.getByTestId("ShowAddressesPanel");
		expect(addressButton).toBeInTheDocument();
	});

	it("should not show address button when only one wallet exists", () => {
		const tokensSpy = vi.spyOn(profile.tokens(), "selectedCount").mockReturnValue(0);
		const totalBalanceSpy = vi.spyOn(profile.tokens(), "selectedTotalBalance").mockReturnValue(0);

		const { asFragment } = render(<TokenHeader profile={profile} />, {
			route,
		});

		expect(asFragment()).toMatchSnapshot();

		tokensSpy.mockRestore();
		totalBalanceSpy.mockRestore();
	});

	it("should show account name label when wallet is HD and single wallet selected", () => {
		const hdWalletSpy = vi.spyOn(profile.wallets().first(), "isHDWallet").mockReturnValue(true);
		const accountNameSpy = vi.spyOn(profile.wallets().first(), "accountName").mockReturnValue("Main Account");
		const tokensSpy = vi.spyOn(profile.tokens(), "selectedCount").mockReturnValue(0);
		const totalBalanceSpy = vi.spyOn(profile.tokens(), "selectedTotalBalance").mockReturnValue(0);

		const { asFragment } = render(<TokenHeader profile={profile} />, {
			route,
		});

		expect(screen.getByText("Main Account")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		hdWalletSpy.mockRestore();
		accountNameSpy.mockRestore();
		tokensSpy.mockRestore();
		totalBalanceSpy.mockRestore();
	});

	it("should not show wallet hd label", () => {
		const hdWalletSpy = vi.spyOn(profile.wallets().first(), "isHDWallet").mockReturnValue(false);
		const accountNameSpy = vi.spyOn(profile.wallets().first(), "accountName").mockReturnValue("Main Account");
		const tokensSpy = vi.spyOn(profile.tokens(), "selectedCount").mockReturnValue(0);
		const totalBalanceSpy = vi.spyOn(profile.tokens(), "selectedTotalBalance").mockReturnValue(0);

		const { asFragment } = render(<TokenHeader profile={profile} />, {
			route,
		});

		expect(screen.queryByText("Main Account")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		hdWalletSpy.mockRestore();
		accountNameSpy.mockRestore();
		tokensSpy.mockRestore();
		totalBalanceSpy.mockRestore();
	});

	it("should show balance information when tokens are available", () => {
		const hdWalletSpy = vi.spyOn(profile.wallets().first(), "balance").mockReturnValue(100);
		const spyCurrency = vi.spyOn(profile.wallets().first(), "currency").mockReturnValue("ARK");
		const spyExchangeCurrency = vi.spyOn(profile.wallets().first(), "exchangeCurrency").mockReturnValue("USD");
		const tokensSpy = vi.spyOn(profile.tokens(), "selectedCount").mockReturnValue(5);
		const totalBalanceSpy = vi.spyOn(profile.tokens(), "selectedTotalBalance").mockReturnValue(100);

		const { asFragment } = render(<TokenHeader profile={profile} />, {
			route,
		});

		expect(asFragment()).toMatchSnapshot();

		hdWalletSpy.mockRestore();
		spyCurrency.mockRestore();
		spyExchangeCurrency.mockRestore();
		tokensSpy.mockRestore();
		totalBalanceSpy.mockRestore();
	});

	it("should show not available when no tokens are selected", () => {
		const tokensSpy = vi.spyOn(profile.tokens(), "selectedCount").mockReturnValue(0);
		const totalBalanceSpy = vi.spyOn(profile.tokens(), "selectedTotalBalance").mockReturnValue(0);

		const { asFragment } = render(<TokenHeader profile={profile} />, {
			route,
		});

		expect(asFragment()).toMatchSnapshot();

		tokensSpy.mockRestore();
		totalBalanceSpy.mockRestore();
	});
});
