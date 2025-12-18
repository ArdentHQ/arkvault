import { env, getMainsailProfileId, render, screen, renderResponsiveWithRoute } from "@/utils/testing-library";

import { TokensTable } from "./TokensTable";
import { LayoutBreakpoint } from "@/types";
import { Contracts } from "@/app/lib/profiles";
import { WalletTokenDTO } from "@/app/lib/profiles/wallet-token.dto";
import { TokenDTO } from "@/app/lib/profiles/token.dto";
import Fixtures from "@/tests/fixtures/coins/mainsail/devnet/tokens.json";

let profile: Contracts.IProfile;
let route: string;

describe("TokensTable", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		route = `/profiles/${profile.id()}/tokens`;
	});

	it("should render", () => {
		const { asFragment } = render(<TokensTable />, {
			route,
		});

		expect(screen.getByTestId("TokenList")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should not render in %s", (breakpoint) => {
		const { asFragment } = renderResponsiveWithRoute(<TokensTable />, breakpoint as LayoutBreakpoint, { route });
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should not render in %s with tokens", (breakpoint) => {
		const fixtureData = Fixtures.ByContractAddress.data;
		const walletTokenData = Fixtures.ByWalletAddress.data[0];

		profile
			.wallets()
			.first()
			.tokens()
			.create({
				token: new TokenDTO(fixtureData),
				walletToken: new WalletTokenDTO(walletTokenData),
			});

		const { asFragment } = renderResponsiveWithRoute(<TokensTable />, breakpoint as LayoutBreakpoint, { route });
		expect(asFragment()).toMatchSnapshot();
	});
});
