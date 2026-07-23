import React, { FC, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { generatePath, useNavigate } from "react-router-dom";

import { Avatar } from "@/app/components/Avatar";
import { DropdownRoot, DropdownToggle, DropdownContent, DropdownListItem } from "@/app/components/SimpleDropdown";
import { Icon } from "@/app/components/Icon";
import { UserMenuProperties } from "@/app/components/NavigationBar";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import { useLink } from "@/app/hooks/use-link";
import { useZendesk } from "@/app/contexts/Zendesk";
import { useConfiguration } from "@/app/contexts";
import { useProfileBalance } from "@/app/hooks/use-profile-balance";
import { Amount } from "@/app/components/Amount";
import { assertString } from "@/utils/assertions";
import { HideBalance } from "@/app/components/NavigationBar/components/HideBalance/HideBalance";
import { SelectNetworkMobile } from "@/app/components/NavigationBar/components/SelectNetwork";
import { Contracts } from "@/app/lib/profiles";
import { ProfilePaths } from "@/router/paths";

export const UserMenu: FC<UserMenuProperties> = ({ avatarImage, userInitials }) => {
	const { t } = useTranslation();
	const { isXs } = useBreakpoint();
	const navigate = useNavigate();
	const { openExternal } = useLink();
	const { showSupportChat } = useZendesk();

	const profile = useActiveProfile();

	const { profileIsSyncingExchangeRates } = useConfiguration().getProfileConfiguration(profile.id());
	const { convertedBalance } = useProfileBalance({ isLoading: profileIsSyncingExchangeRates, profile });
	const ticker = profile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency) || "USD";

	assertString(ticker);

	const showNetworkToggle = [isXs, !!profile.settings().get(Contracts.ProfileSetting.UseTestNetworks)].every(Boolean);

	const renderAvatarSection = useCallback(
		(isOpen: boolean) => (
			<button className="group flex items-center gap-6 rounded bg-transparent py-0.5 hover:bg-theme-secondary-200 dim-hover:bg-theme-dim-700 dark:hover:bg-theme-dark-700">
				<div
					className="relative cursor-pointer items-center justify-center rounded align-middle"
					data-testid="UserMenu"
				>
					<Avatar size="avatarMobile" highlight={isOpen}>
						{avatarImage.endsWith("</svg>") ? (
							<>
								<img
									alt="Profile Avatar"
									src={`data:image/svg+xml;utf8,${encodeURIComponent(avatarImage)}`}
								/>
								<span className="absolute text-xs font-semibold text-theme-background dark:text-theme-text">
									{userInitials}
								</span>
							</>
						) : (
							<img
								alt="Profile Avatar"
								className="h-6 w-6 rounded bg-cover bg-center bg-no-repeat object-cover"
								src={avatarImage}
							/>
						)}
					</Avatar>
				</div>
			</button>
		),
		[avatarImage, userInitials],
	);

	return (
		<DropdownRoot>
			<DropdownToggle>{({ isOpen }) => renderAvatarSection(isOpen)}</DropdownToggle>
			<DropdownContent>
				<div className="flex items-center justify-between bg-theme-secondary-100 px-6 py-3 text-sm font-semibold leading-[17px] text-theme-secondary-700 dark:bg-theme-dark-950 dark:text-theme-dark-200 md-lg:hidden">
					<p>{t("COMMON.BALANCE")}:</p>
					<div className="flex items-center gap-2">
						<HideBalance className="md-lg:hidden" profile={profile} />
						<Amount value={convertedBalance} ticker={ticker} allowHideBalance profile={profile} />
					</div>
				</div>
				<DropdownListItem onClick={() => navigate(generatePath(ProfilePaths.Settings, { profileId: profile.id() }))}>
					{t("COMMON.SETTINGS")}
				</DropdownListItem>
				<DropdownListItem onClick={() => showSupportChat(profile)}>
					{t("COMMON.CONTACT_US")}
				</DropdownListItem>
				<div className="h-px w-full bg-theme-secondary-300 dim:bg-theme-dim-700 dark:bg-theme-dark-700" />
				<DropdownListItem onClick={() => openExternal("https://arkvault.io/docs")}>
					<Icon name="ArrowExternal" className="dark:text-theme-secondary-600 dim:text-theme-dim-200" size="md" />
					<span className="flex w-full items-center justify-between">{t("COMMON.DOCS")}</span>
				</DropdownListItem>
				<DropdownListItem onClick={() => navigate("/")}>
					<Icon name="SignOut" className="dark:text-theme-secondary-600 dim:text-theme-dim-200" size="md" />
					<span className="flex w-full items-center justify-between">{t("COMMON.SIGN_OUT")}</span>
				</DropdownListItem>
				{showNetworkToggle && <SelectNetworkMobile profile={profile} />}
			</DropdownContent>
		</DropdownRoot>
	);
};
