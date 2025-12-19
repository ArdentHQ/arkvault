import { describe, it, expect, beforeAll } from "vitest";
import { env, getMainsailProfileId, renderResponsiveWithRoute } from "@/utils/testing-library";

import { Contracts } from "@/app/lib/profiles";
import { WalletTokenDTO } from "@/app/lib/profiles/wallet-token.dto";
import { TokenDTO } from "@/app/lib/profiles/token.dto";
import Fixtures from "@/tests/fixtures/coins/mainsail/devnet/tokens.json";
import { TokenDetailSidepanel } from "./TokensDetailSidepanel";
import { LayoutBreakpoint } from "@/types";

let profile: Contracts.IProfile;
let route: string;

describe("TokensTable", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		route = `/profiles/${profile.id()}/tokens`;

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
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint) => {
		const { asFragment } = renderResponsiveWithRoute(
			<TokenDetailSidepanel isOpen walletToken={profile.tokens().selected().first()} />,
			breakpoint as LayoutBreakpoint,
			{ route },
		);
		expect(asFragment()).toMatchSnapshot();
	});
});
