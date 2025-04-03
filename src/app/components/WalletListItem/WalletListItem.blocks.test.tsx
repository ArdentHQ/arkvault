import { Contracts } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";
import { env, getDefaultProfileId, render } from "@/utils/testing-library";
import { Balance } from "@/app/components/WalletListItem/WalletListItem.blocks";

vi.mock("@/domains/wallet/pages/WalletDetails/hooks/use-wallet-transactions", () => ({
	useWalletTransactions: () => ({
		hasUnsignedPendingTransaction: true,
		syncPending: () => {},
	}),
}));

const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;
const history = createHashHistory();

describe("WalletListItem.blocks", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeAll(() => {
		history.push(dashboardURL);
	});

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		wallet = profile.wallets().findById("ac38fe6d-4b67-4ef1-85be-17c5f6841129");

		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should render Balance in small screen", () => {
		const walletSpy = vi.spyOn(wallet, "isStarred").mockReturnValue(false);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<table>
					<tbody>
						<tr>
							<td>
								<Balance
									wallet={wallet}
									onToggleStar={vi.fn()}
									isCompact={true}
									isLargeScreen={false}
								/>
							</td>
						</tr>
					</tbody>
				</table>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(asFragment).toMatchSnapshot();

		walletSpy.mockRestore();
	});
});
