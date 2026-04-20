import { describe, it, expect, beforeAll } from "vitest";
import { env, getMainsailProfileId, renderResponsiveWithRoute, screen, waitFor } from "@/utils/testing-library";

import { Contracts } from "@/app/lib/profiles";
import { WalletTokenDTO } from "@/app/lib/profiles/wallet-token.dto";
import { TokenDTO } from "@/app/lib/profiles/token.dto";
import Fixtures from "@/tests/fixtures/coins/mainsail/devnet/tokens.json";
import { TokenDetailSidepanel } from "./TokensDetailSidepanel";
import { LayoutBreakpoint } from "@/types";
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import userEvent from "@testing-library/user-event";

let profile: Contracts.IProfile;
let route: string;

describe("TokensTable", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		route = `/profiles/${profile.id()}/tokens`;
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", async (breakpoint) => {
		const closeMock = vi.fn();
		const fixtureData = Fixtures.ByContractAddress.data;
		const walletTokenData = Fixtures.ByWalletAddress.data[0];

		const walletToken = new WalletToken({
			network: profile.activeNetwork(),
			profile: profile,
			token: new TokenDTO(fixtureData),
			walletToken: new WalletTokenDTO(walletTokenData),
		});

		renderResponsiveWithRoute(
			<TokenDetailSidepanel isOpen walletToken={walletToken} onClose={closeMock} />,
			breakpoint as LayoutBreakpoint,
			{ route },
		);

		expect(screen.getByTestId("TokenDetailSidepanel")).toBeInTheDocument();
		await userEvent.click(screen.getByTestId("TokenDetailSidepanel__close-button"));
		await waitFor(() => {
			expect(closeMock).toHaveBeenCalled();
		});
	});
});
