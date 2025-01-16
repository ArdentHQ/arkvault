import { matchPath } from "react-router-dom";
import { generatePath } from "react-router";
import { Middleware, MiddlewareParameters } from "@/router/router.types";
import { ProfilePaths } from "@/router/paths";

// TODO: Define and implement the criteria for selecting the initial active wallet
// (e.g., profile settings, last used wallet, active wallet)
const navigateToActiveWallet = async (env, profileId, history) => {
	const profile = env.profiles().findById(profileId)

	const password = profile.usesPassword() ? profile.password().get() : undefined;
	await env.profiles().restore(profile, password)

	const wallet = profile.wallets().first()

	if (wallet) {
		history.replace(generatePath(ProfilePaths.WalletDetails, { profileId, walletId: wallet.id() }));
	}
}

export class WalletMiddleware implements Middleware {
	handler({ location, env, history }: MiddlewareParameters): boolean {

		const match = matchPath<{ profileId: string }>(location.pathname, {
			path: ProfilePaths.Dashboard,
		});

		if (match) {
			const { profileId } = match.params;
			navigateToActiveWallet(env, profileId, history);
		}

		return true;
	}
}
