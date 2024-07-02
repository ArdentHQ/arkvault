import { generatePath } from "react-router";
import { matchPath } from "react-router-dom";

import { ProfilePaths } from "@/router/paths";
import { Middleware, MiddlewareParameters } from "@/router/router.types";

export class WalletMiddleware implements Middleware {
	handler({ location, redirect, env }: MiddlewareParameters): boolean {
		const match = matchPath<{ profileId: string; walletId: string }>(location.pathname, {
			path: ProfilePaths.WalletDetails,
		});

		if (match) {
			const { profileId, walletId } = match.params;

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
