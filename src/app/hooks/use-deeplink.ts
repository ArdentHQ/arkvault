import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { matchPath, useHistory, useLocation } from "react-router-dom";

import { generatePath } from "react-router";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useEnvironmentContext } from "@/app/contexts";
import { toasts } from "@/app/services";
import { lowerCaseEquals } from "@/utils/equals";
import { ProfilePaths } from "@/router/paths";
import { useQueryParameters } from "@/app/hooks/use-query-parameters";
import { assertProfile } from "@/utils/assertions";
import { profileAllEnabledNetworks } from "@/utils/network-utils";

export const useDeeplink = () => {
	const { env } = useEnvironmentContext();
	const { t } = useTranslation();

	const [profile, setProfile] = useState<Contracts.IProfile | undefined>();
	const isProfileRestored = profile?.status().isRestored();

	const history = useHistory();
	const location = useLocation();
	const queryParameters = useQueryParameters();
	const [deepLink, setDeepLink] = useState<URLSearchParams | undefined>();

	const navigate = useCallback((url: string, deeplinkSchema?: any) => history.push(url, deeplinkSchema), [history]);

	/** useActiveProfile has no effect here because it is not within the routes */
	const verifyProfile = useCallback(() => {
		const match = matchPath<{ profileId: string }>(history.location.pathname, {
			path: "/profiles/:profileId",
		});

		if (!match) {
			return toasts.warning(t("COMMON.SELECT_A_PROFILE"), { delay: 500 });
		}

		setProfile(env.profiles().findById(match.params.profileId));
	}, [env, history.location.pathname, t]);

	const validateParameters = useCallback(
		(URLParameters: URLSearchParams) => {
			assertProfile(profile);

			const allEnabledNetworks = profileAllEnabledNetworks(profile);

			const coin = URLParameters.get("coin");
			const method = URLParameters.get("method");
			const network = URLParameters.get("network");
			const nethash = URLParameters.get("nethash");

			if (!coin) {
				throw new Error(t("TRANSACTION.VALIDATION.COIN_MISSING"));
			}

			if (!method) {
				throw new Error(t("TRANSACTION.VALIDATION.METHOD_MISSING"));
			}

			if (!network && !nethash) {
				throw new Error(t("TRANSACTION.VALIDATION.NETWORK_OR_NETHASH_MISSING"));
			}

			if (!allEnabledNetworks.some((item) => lowerCaseEquals(item.coin(), coin))) {
				throw new Error(t("TRANSACTION.VALIDATION.COIN_NOT_SUPPORTED", { coin }));
			}

			if (network) {
				if (!["ark.devnet", "ark.mainnet"].includes(network)) {
					throw new Error(t("TRANSACTION.VALIDATION.NETWORK_INVALID", { network }));
				}

				/* istanbul ignore next */
				if (!allEnabledNetworks.some((item) => lowerCaseEquals(item.id(), network))) {
					throw new Error(t("TRANSACTION.VALIDATION.NETWORK_NOT_ENABLED", { network }));
				}

				const availableWallets = profile
					.wallets()
					.findByCoinWithNetwork(coin.toUpperCase(), network.toLowerCase());

				if (availableWallets.length === 0) {
					throw new Error(t("TRANSACTION.VALIDATION.NETWORK_NO_WALLETS", { network }));
				}
			}

			if (nethash) {
				if (!allEnabledNetworks.some((network) => network.meta().nethash === nethash)) {
					throw new Error(t("TRANSACTION.VALIDATION.NETHASH_NOT_ENABLED", { nethash }));
				}

				const availableWallets = profile.wallets().findByCoinWithNethash(coin.toUpperCase(), nethash);

				if (availableWallets.length === 0) {
					throw new Error(t("TRANSACTION.VALIDATION.NETHASH_NO_WALLETS", { nethash }));
				}
			}
		},
		[profile],
	);

	const handleDeepLink = useCallback(
		(URLParameters: URLSearchParams) => {
			if (!profile) {
				return verifyProfile();
			}

			if (!isProfileRestored) {
				return;
			}

			try {
				validateParameters(URLParameters);

				/* istanbul ignore else */
				if (URLParameters.get("method") === "transfer") {
					const path = generatePath(ProfilePaths.SendTransfer, { profileId: profile.id() });
					return navigate(`${path}?${URLParameters.toString()}`);
				}
			} catch (error) {
				toasts.error(`Invalid URI: ${error.message}`);
			} finally {
				setDeepLink(undefined);
				setProfile(undefined);
			}
		},
		[profile, isProfileRestored, verifyProfile, validateParameters, navigate],
	);

	const onLocationChange = useCallback(() => {
		// @ts-ignore
		const pathname = location.pathname || location.location?.pathname;

		if ([ProfilePaths.CreateProfile, ProfilePaths.ImportProfile].includes(pathname)) {
			return setDeepLink(undefined);
		}

		if (pathname === ProfilePaths.Welcome && location.search) {
			setDeepLink(queryParameters);
			return handleDeepLink(queryParameters);
		}

		if (pathname !== ProfilePaths.Welcome && deepLink) {
			handleDeepLink(deepLink);
		}
	}, [handleDeepLink, location, queryParameters]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		onLocationChange();
	}, [location, isProfileRestored]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useDeeplink;
