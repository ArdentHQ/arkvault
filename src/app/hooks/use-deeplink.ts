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

			/* istanbul ignore next */
			if (
				URLParameters.has("coin") &&
				!allEnabledNetworks.some((network) => lowerCaseEquals(network.coin(), URLParameters.get("coin")!))
			) {
				throw new Error(`Coin "${URLParameters.get("coin")}" not supported.`);
			}

			/* istanbul ignore next */
			if (URLParameters.has("network")) {
				if (!["ark.devnet", "ark.mainnet"].includes(URLParameters.get("network")!)) {
					throw new Error(`Network "${URLParameters.get("network")}" is invalid.`);
				}

				if (
					!allEnabledNetworks.some((network) => lowerCaseEquals(network.id(), URLParameters.get("network")!))
				) {
					throw new Error(`Network "${URLParameters.get("network")}" is not enabled.`);
				}

				const availableWallets = profile
					.wallets()
					.findByCoinWithNetwork(
						URLParameters.get("coin")!.toUpperCase(),
						URLParameters.get("network")!.toLowerCase(),
					);

				if (availableWallets.length === 0) {
					throw new Error(
						`The current profile has no wallets available for the "${URLParameters.get(
							"network",
						)}" network`,
					);
				}
			}

			/* istanbul ignore next */
			if (URLParameters.has("nethash")) {
				if (!allEnabledNetworks.some((network) => network.meta().nethash === URLParameters.get("nethash")!)) {
					throw new Error(
						`Network with nethash "${URLParameters.get("nethash")}" is not enabled or available.`,
					);
				}

				// const availableWallets = [];
				const availableWallets = profile
					.wallets()
					.findByCoinWithNethash(URLParameters.get("coin")!.toUpperCase(), URLParameters.get("nethash")!);

				if (availableWallets.length === 0) {
					throw new Error(
						`The current profile has no wallets available for the network with nethash "${URLParameters.get(
							"nethash",
						)}"`,
					);
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

				if (URLParameters.has("method") && URLParameters.get("method") === "transfer") {
					const path = generatePath(ProfilePaths.SendTransfer, { profileId: profile.id() });
					return navigate(`${path}?${URLParameters.toString()}`);
				}

				return navigate(ProfilePaths.Welcome);
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
