import { Contracts } from "@/app/lib/profiles";
import React from "react";
import { env, getDefaultMainsailWalletId, getMainsailProfileId, render } from "@/utils/testing-library";
import { Balance } from "@/app/components/WalletListItem/WalletListItem.blocks";

const dashboardURL = `/profiles/${getMainsailProfileId()}/dashboard`;

describe("WalletListItem.blocks", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		wallet = profile.wallets().findById(getDefaultMainsailWalletId());

		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should render Balance in small screen", () => {
		const walletSpy = vi.spyOn(wallet, "isStarred").mockReturnValue(false);

		const { asFragment } = render(
			<table>
				<tbody>
					<tr>
						<td>
							<Balance wallet={wallet} onToggleStar={vi.fn()} isCompact={true} isLargeScreen={false} />
						</td>
					</tr>
				</tbody>
			</table>,
			{
				route: dashboardURL,
			},
		);

		expect(asFragment).toMatchSnapshot();

		walletSpy.mockRestore();
	});
});
