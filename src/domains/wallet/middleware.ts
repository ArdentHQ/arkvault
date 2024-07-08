import { matchPath } from "react-router-dom";
import { generatePath } from "react-router";
import { Middleware, MiddlewareParameters } from "@/router/router.types";
import { ProfilePaths } from "@/router/paths";

export class WalletMiddleware implements Middleware {
	handler({ location, redirect, env }: MiddlewareParameters): boolean {
		const match = matchPath(
			{
				path: ProfilePaths.WalletDetails,
			},
			location.pathname,
		);

		if (match) {
			const { profileId, walletId } = match.params as { profileId: string; walletId: string };

			if (["create", "import"].includes(walletId)) {
				return true;
			}

			try {
				const wallet = env.profiles().findById(profileId).wallets().findById(walletId);
				return !!wallet;
			} catch {
				redirect(generatePath(ProfilePaths.Dashboard, { profileId }));
				return false;
			}
		}

		return true;
	}
}
