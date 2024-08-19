import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { matchPath, useHistory } from "react-router-dom";
import { LocationState } from "router/router.types";
import cn from "classnames";
import { DropdownOption } from "@/app/components/Dropdown";
import { Icon, ThemeIcon } from "@/app/components/Icon";
import { Page, Section } from "@/app/components/Layout";
import { Link } from "@/app/components/Link";
import { useEnvironmentContext } from "@/app/contexts";
import { useAccentColor, useDeeplink, useTheme } from "@/app/hooks";
import { DeleteProfile } from "@/domains/profile/components/DeleteProfile/DeleteProfile";
import { SignIn } from "@/domains/profile/components/SignIn/SignIn";
import { toasts } from "@/app/services";
import { WelcomeSlider } from "@/domains/profile/components/WelcomeSlider/WelcomeSlider";
import { Profiles } from "@/domains/profile/components/Profiles/Profiles";
import { Button } from "@/app/components/Button";

export const Welcome = () => {
	const context = useEnvironmentContext();
	const history = useHistory<LocationState>();
	const [isThemeLoaded, setThemeLoaded] = useState(false);
	const isProfileCardClickedOnce = useRef(false);

	const { t } = useTranslation();
	const { handleDeepLink, isDeeplink, validateDeeplink } = useDeeplink();

	const profileCardActions = useMemo(
		() => [
			{ label: t("COMMON.SETTINGS"), value: "setting" },
			{ label: t("COMMON.DELETE"), value: "delete" },
		],
		[],
	);

	const profiles = useMemo(() => context.env.profiles().values(), [context]);

	const [deletingProfileId, setDeletingProfileId] = useState<string | undefined>();
	const [selectedProfile, setSelectedProfile] = useState<Contracts.IProfile | undefined>(() => {
		if (!history.location.state?.from) {
			return;
		}

		const match = matchPath<{ profileId: string }>(history.location.state.from, {
			path: "/profiles/:profileId",
		});

		if (!match) {
			return;
		}

		const { profileId } = match.params;
		return context.env.profiles().findById(profileId);
	});

	const [requestedAction, setRequestedAction] = useState<DropdownOption | undefined>(
		selectedProfile ? { label: "Previous page", value: "previous" } : undefined,
	);

	const { setProfileTheme, resetTheme } = useTheme();
	const { setProfileAccentColor } = useAccentColor();

	useEffect(() => {
		resetTheme();
		setThemeLoaded(true);
	}, [resetTheme]);

	const navigateToProfile = useCallback(
		async (profile: Contracts.IProfile, subPath = "dashboard") => {
			if (isDeeplink()) {
				toasts.dismiss();

				const validatingToastId = toasts.warning(t("COMMON.VALIDATING_URI"));

				const password = profile.usesPassword() ? profile.password().get() : undefined;

				await context.env.profiles().restore(profile, password);
				await profile.sync();

				const error = await validateDeeplink(profile);

				profile.status().reset();

				if (error) {
					toasts.update(validatingToastId, "error", error);
					isProfileCardClickedOnce.current = false;

					history.push("/");
					return;
				}

				setProfileTheme(profile);
				setProfileAccentColor(profile);

				handleDeepLink(profile);
				return;
			}

			setProfileTheme(profile);
			setProfileAccentColor(profile);

			history.push(`/profiles/${profile.id()}/${subPath}`);
		},
		[history, isDeeplink],
	);

	const navigateToPreviousPage = useCallback(
		(profile: Contracts.IProfile) => {
			setProfileTheme(profile);
			setProfileAccentColor(profile);
			history.push(history.location.state!.from!);
		},
		[history],
	);

	const closeDeleteProfileModal = useCallback(() => {
		setDeletingProfileId(undefined);
		isProfileCardClickedOnce.current = false;
	}, []);

	const closeSignInModal = useCallback(() => {
		setSelectedProfile(undefined);
		setRequestedAction(undefined);
		isProfileCardClickedOnce.current = false;
	}, []);

	const handleClick = useCallback(
		(profile: Contracts.IProfile) => {
			if (isProfileCardClickedOnce.current) {
				return;
			}

			isProfileCardClickedOnce.current = true;

			if (profile.usesPassword()) {
				setSelectedProfile(profile);
				setRequestedAction({ label: "Homepage", value: "home" });
			} else {
				navigateToProfile(profile);
			}
		},
		[navigateToProfile, selectedProfile],
	);

	const handleRequestedAction = useCallback(
		(profile: Contracts.IProfile, action: DropdownOption, password?: string) => {
			closeSignInModal();

			if (password) {
				profile.password().set(password);
			}

			const actions = {
				delete: () => setDeletingProfileId(profile.id()),
				home: () => navigateToProfile(profile),
				previous: () => navigateToPreviousPage(profile),
				setting: () => navigateToProfile(profile, "settings"),
			};

			return actions[action.value as keyof typeof actions]();
		},
		[closeSignInModal, navigateToProfile, navigateToPreviousPage],
	);

	const handleProfileAction = useCallback(
		(profile: Contracts.IProfile, action: DropdownOption) => {
			if (profile.usesPassword()) {
				setRequestedAction(action);
				setSelectedProfile(profile);
			} else {
				handleRequestedAction(profile, action);
			}
		},
		[handleRequestedAction],
	);

	const handleSuccessSignIn = useCallback(
		(password) => {
			handleRequestedAction(selectedProfile!, requestedAction!, password);
		},
		[handleRequestedAction, selectedProfile, requestedAction],
	);

	const hasProfiles = profiles.length > 0;

	useEffect(() => {
		// The timeout prevents this action from running twice (apparently caused
		// by lazy loading of this page). If removed, a toast with an error quickly
		// appears and disappears.
		let navigateTimeout: ReturnType<typeof setTimeout> | undefined;

		if (!isDeeplink()) {
			return;
		}

		navigateTimeout = setTimeout(() => {
			if (profiles.length === 1) {
				const firstProfile = profiles[0];
				isProfileCardClickedOnce.current = true;

				if (firstProfile.usesPassword()) {
					setSelectedProfile(firstProfile);
					setRequestedAction({ label: "Homepage", value: "home" });
				} else {
					navigateToProfile(firstProfile);
				}
			} else {
				toasts.warning(t("COMMON.SELECT_A_PROFILE"), { delay: 500 });
			}
		}, 1);

		return () => {
			clearTimeout(navigateTimeout);
		};
	}, []);

	if (!isThemeLoaded) {
		return <></>;
	}

	return (
		<>
			<Page navbarVariant="logo-only" pageTitle={t("COMMON.WELCOME")} title={<Trans i18nKey="COMMON.APP_NAME" />}>
				<Section className="-mt-5 flex flex-1 md:mt-0 xl:px-20" innerClassName="w-full">
					<div className="flex flex-col gap-3 lg:flex-row">
						<div
							className={cn(
								"min-w-0 basis-1/2 rounded-xl border border-theme-navy-100 bg-theme-navy-50 bg-[url('/welcome-bg-white.svg')] dark:border-theme-secondary-800 dark:bg-theme-secondary-800 dark:bg-[url('/welcome-bg-dark.svg')]",
								{
									"hidden sm:block": hasProfiles,
									"mb-6 sm:mb-0": !hasProfiles,
								},
							)}
						>
							<WelcomeSlider />
						</div>
						<div className="min-w-0 basis-1/2 rounded-xl border-theme-navy-100 dark:border-theme-secondary-800 sm:border sm:p-6">
							<div className="mx-auto flex h-full max-w-[400px] flex-col">
								<div className="flex flex-1 flex-col items-center justify-center">
									<div className="flex flex-col items-center space-y-2 text-center sm:px-4">
										<ThemeIcon
											darkIcon="PersonDark"
											lightIcon="PersonLight"
											dimensions={[24, 24]}
										/>

										<h2 className="mx-4 text-2xl font-bold">
											{hasProfiles
												? t("PROFILE.PAGE_WELCOME.WITH_PROFILES.TITLE")
												: t("PROFILE.PAGE_WELCOME.WITHOUT_PROFILES.TITLE")}
										</h2>

										<p className="text-base leading-7 text-theme-secondary-text">
											{hasProfiles
												? t("PROFILE.PAGE_WELCOME.WITH_PROFILES.DESCRIPTION")
												: t("PROFILE.PAGE_WELCOME.WITHOUT_PROFILES.DESCRIPTION")}
										</p>
									</div>

									<div className="mt-4 flex w-full flex-col justify-center">
										<Profiles
											profiles={profiles}
											actions={profileCardActions}
											onClick={handleClick}
											onSelect={handleProfileAction}
										/>

										<Button
											data-testid="CreateProfile"
											variant="primary"
											className={cn({ "mt-3": profiles.length })}
											onClick={() => history.push("/profiles/create")}
										>
											<Icon name="Plus" />
											<span className="pl-2"> {t("COMMON.CREATE")} </span>
										</Button>
									</div>
								</div>

								<div className="fixed bottom-8 left-1/2 mt-8 w-full -translate-x-1/2 sm:static sm:bottom-0 sm:translate-x-0">
									<p className="text-center text-base text-theme-secondary-text">
										<span>{t("PROFILE.PAGE_WELCOME.HAS_EXPORTED_PROFILES")} </span>
										<Link
											to="/profiles/import"
											title={t("PROFILE.PAGE_WELCOME.IMPORT_PROFILE_TITLE")}
										>
											{t("PROFILE.PAGE_WELCOME.IMPORT_PROFILE")}
										</Link>
									</p>
								</div>
							</div>
						</div>
					</div>
				</Section>
			</Page>

			<DeleteProfile
				profileId={deletingProfileId!}
				isOpen={!!deletingProfileId}
				onCancel={closeDeleteProfileModal}
				onClose={closeDeleteProfileModal}
				onDelete={closeDeleteProfileModal}
			/>

			<SignIn
				isOpen={!!selectedProfile && !!requestedAction}
				profile={selectedProfile!}
				onCancel={closeSignInModal}
				onClose={closeSignInModal}
				onSuccess={handleSuccessSignIn}
			/>
		</>
	);
};
