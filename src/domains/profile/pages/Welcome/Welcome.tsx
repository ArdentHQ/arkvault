import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { matchPath, useHistory } from "react-router-dom";

import { LocationState } from "router/router.types";
import cn from "classnames";
import { Card } from "@/app/components/Card";
import { Circle } from "@/app/components/Circle";
import { DropdownOption } from "@/app/components/Dropdown";
import { Icon } from "@/app/components/Icon";
import { Image } from "@/app/components/Image";
import { Page, Section } from "@/app/components/Layout";
import { Link } from "@/app/components/Link";
import { useEnvironmentContext } from "@/app/contexts";
import { useAccentColor, useTheme } from "@/app/hooks";
import { DeleteProfile } from "@/domains/profile/components/DeleteProfile/DeleteProfile";
import { ProfileCard } from "@/domains/profile/components/ProfileCard";
import { SignIn } from "@/domains/profile/components/SignIn/SignIn";

export const Welcome = () => {
	const context = useEnvironmentContext();
	const history = useHistory<LocationState>();
	const [isThemeLoaded, setThemeLoaded] = useState(false);

	const { t } = useTranslation();

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
		(profile: Contracts.IProfile, subPath = "dashboard") => {
			setProfileTheme(profile);
			setProfileAccentColor(profile);
			history.push(`/profiles/${profile.id()}/${subPath}`);
		},
		[history],
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
	}, []);

	const closeSignInModal = useCallback(() => {
		setSelectedProfile(undefined);
		setRequestedAction(undefined);
	}, []);

	const handleClick = useCallback(
		(profile: Contracts.IProfile) => {
			if (profile.usesPassword()) {
				setSelectedProfile(profile);
				setRequestedAction({ label: "Homepage", value: "home" });
			} else {
				navigateToProfile(profile);
			}
		},
		[navigateToProfile],
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

	if (!isThemeLoaded) {
		return <></>;
	}

	return (
		<>
			<Page navbarVariant="logo-only" pageTitle={t("COMMON.WELCOME")} title={<Trans i18nKey="COMMON.APP_NAME" />}>
				<Section className="-mt-5 flex flex-1 flex-col text-center md:mt-0 md:justify-center">
					<div className="mx-auto hidden w-96 md:block">
						<Image name="WelcomeBanner" useAccentColor={false} />
					</div>

					<div className="mx-auto md:mt-8">
						<h2 className="mx-4 text-2xl font-bold">
							{hasProfiles
								? t("PROFILE.PAGE_WELCOME.WITH_PROFILES.TITLE")
								: t("PROFILE.PAGE_WELCOME.WITHOUT_PROFILES.TITLE")}
						</h2>

						<p className="text-base text-theme-secondary-text">
							{hasProfiles
								? t("PROFILE.PAGE_WELCOME.WITH_PROFILES.DESCRIPTION")
								: t("PROFILE.PAGE_WELCOME.WITHOUT_PROFILES.DESCRIPTION")}
						</p>

						<div className="mt-6 flex justify-center md:mt-8">
							<div
								className={cn(
									"gap-5",
									{ "md:grid-cols-4": profiles.length >= 3 },
									{ "md:grid-cols-3": profiles.length === 2 },
									{ "grid grid-cols-2": profiles.length >= 2 },
									{ "flex w-full justify-center": profiles.length < 2 },
								)}
							>
								{profiles.map((profile: Contracts.IProfile, index: number) => (
									<ProfileCard
										key={index}
										actions={profileCardActions}
										profile={profile}
										onClick={() => handleClick(profile)}
										onSelect={(action) => handleProfileAction(profile, action)}
									/>
								))}

								<Card
									variant="secondary"
									className={cn(
										"group h-40 leading-tight sm:w-40",
										{ "w-36": hasProfiles },
										{ "w-full": !hasProfiles },
									)}
									onClick={() => history.push("/profiles/create")}
								>
									<div className="mx-auto flex h-full flex-col items-center justify-center">
										<div>
											<Circle
												size="xl"
												className="border-theme-primary-600 text-theme-primary-600 group-hover:border-white group-hover:text-white"
												durationClassName="duration-200"
												noShadow
											>
												<Icon name="Plus" />
											</Circle>
										</div>
										<span className="mt-3 max-w-32 truncate font-semibold text-theme-primary-600 transition-colors group-hover:text-white">
											{t("COMMON.CREATE")}
										</span>
									</div>
								</Card>
							</div>
						</div>

						<p className="mt-8 text-base text-theme-secondary-text md:mt-16">
							<span>{t("PROFILE.PAGE_WELCOME.HAS_EXPORTED_PROFILES")} </span>
							<Link to="/profiles/import" title={t("PROFILE.PAGE_WELCOME.IMPORT_PROFILE_TITLE")}>
								{t("PROFILE.PAGE_WELCOME.IMPORT_PROFILE")}
							</Link>
						</p>
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
