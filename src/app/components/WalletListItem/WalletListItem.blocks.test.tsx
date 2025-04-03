import { Contracts } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";
import { env, getMainsailProfileId, render } from "@/utils/testing-library";
import { Balance } from "@/app/components/WalletListItem/WalletListItem.blocks";

vi.mock("@/domains/wallet/pages/WalletDetails/hooks/use-wallet-transactions", () => ({
	useWalletTransactions: () => ({
		hasUnsignedPendingTransaction: true,
		syncPending: () => {},
	}),
}));

const dashboardURL = `/profiles/${getMainsailProfileId()}/dashboard`;
const history = createHashHistory();

process.env.RESTORE_MAINSAIL_PROFILE = "true";

describe("WalletListItem.blocks", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeAll(() => {
		history.push(dashboardURL);
	});

	beforeEach(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		wallet = profile.wallets().findById(getDefaultMainsailWalletId());

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
