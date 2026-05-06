import { describe, expect, it } from "vitest";
import { env, getMainsailProfileId, render, screen } from "@/utils/testing-library";
import { SelectToken } from "./SelectToken";
import userEvent from "@testing-library/user-event";
import { WalletTokenDTO } from "@/app/lib/profiles/wallet-token.dto";
import { TokenDTO } from "@/app/lib/profiles/token.dto";
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { Contracts } from "@/app/lib/profiles";

let wallet: Contracts.IReadWriteWallet;
const tokens: any[] = [];

describe("SelectToken", () => {
	beforeEach(() => {
		const profile = env.profiles().findById(getMainsailProfileId());

		wallet = profile.wallets().first();
		const address = wallet.address();

		const walletTokenDarkDto = new WalletTokenDTO({
			address,
			balance: "100000000000000000000000000",
			tokenAddress: "0xdeb478251073157e400c3d8d2ed92a85c958f9fa",
		});

		const walletTokenSamDto = new WalletTokenDTO({
			address,
			balance: "100000000000000000000000000",
			tokenAddress: "0x12f6677522292654A231007C47B07971a7610908",
		});

		const darkTokenDto = new TokenDTO({
			address: "0xdeb478251073157e400c3d8d2ed92a85c958f9fa",
			decimals: 18,
			deploymentHash: "3cedca4b9b80a36bd69378b64ef6f4fe21855706ae14c94a0f7cd45a3cb1170e",
			name: "DARK20",
			symbol: "DARK20",
			totalSupply: "100000000000000000000000000",
		});

		const samTokenDto = new TokenDTO({
			address: "0x12f6677522292654A231007C47B07971a7610908",
			decimals: 18,
			deploymentHash: "3cedca4b9b80a36bd69378b64ef6f4fe21855706ae14c94a0f7cd45a3cb1170e",
			name: "Sam Coin",
			symbol: "SAM",
			totalSupply: "100000000000000000000000000",
		});

		const walletTokenDark = new WalletToken({
			network: profile.activeNetwork(),
			profile,
			token: darkTokenDto,
			walletToken: walletTokenDarkDto,
		});

		const walletTokenSam = new WalletToken({
			network: profile.activeNetwork(),
			profile,
			token: samTokenDto,
			walletToken: walletTokenSamDto,
		});

		tokens.push({
			data: walletTokenDark,
			label: walletTokenDark.token().displaySymbol(),
			value: walletTokenDark.token().address(),
		});

		tokens.push({
			data: walletTokenSam,
			label: walletTokenSam.token().displaySymbol(),
			value: walletTokenSam.token().address(),
		});
	});

	it("should render", () => {
		const { asFragment } = render(<SelectToken tokens={tokens.slice(0, 1)} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render multiple ", () => {
		const { asFragment } = render(<SelectToken tokens={tokens} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with default value ", () => {
		const { asFragment } = render(
			<SelectToken value="0xdeb478251073157e400c3d8d2ed92a85c958f9fa" tokens={tokens} />,
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should change selection", async () => {
		const onChangeMock = vi.fn();
		render(<SelectToken tokens={tokens} onChange={onChangeMock} />);

		await userEvent.clear(screen.getByTestId("SelectDropdown__input"));
		await userEvent.type(screen.getByTestId("SelectDropdown__input"), "dark");

		await userEvent.click(screen.getByTestId("select-list__input"));
		expect(onChangeMock).toHaveBeenCalled();
	});

	it("should display native token when `option.data` is `undefined`", async () => {
		render(<SelectToken wallet={wallet} tokens={[{ data: undefined, label: "ARK", value: "ARK" }, ...tokens]} />);

		await userEvent.clear(screen.getByTestId("SelectDropdown__input"));

		await expect(screen.findByTestId("SelectDropdown__option--0")).resolves.toBeInTheDocument();

		await expect(screen.findByText("95.27653252325068 ARK")).resolves.toBeInTheDocument();
	});
});
