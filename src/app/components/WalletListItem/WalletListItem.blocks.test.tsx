import { Contracts } from "@/app/lib/profiles";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";
import { env, getDefaultMainsailWalletId, getMainsailProfileId, render } from "@/utils/testing-library";
import { Balance } from "@/app/components/WalletListItem/WalletListItem.blocks";

const dashboardURL = `/profiles/${getMainsailProfileId()}/dashboard`;
const history = createHashHistory();

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
