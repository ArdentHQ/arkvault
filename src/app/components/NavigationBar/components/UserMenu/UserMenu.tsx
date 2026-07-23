import React, { FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Avatar } from "@/app/components/Avatar";
import { DropdownOption, DropdownOptionGroup } from "@/app/components/Dropdown/Dropdown.contracts";
import { DropdownRoot, DropdownToggle, DropdownContent, DropdownListItem } from "@/app/components/SimpleDropdown";
import { Icon } from "@/app/components/Icon";
import { UserMenuProperties } from "@/app/components/NavigationBar";
import { getUserMenuActions } from "@/app/constants/navigation";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import { useConfiguration } from "@/app/contexts";
import { useProfileBalance } from "@/app/hooks/use-profile-balance";
import { Amount } from "@/app/components/Amount";
import { assertString } from "@/utils/assertions";
import { HideBalance } from "@/app/components/NavigationBar/components/HideBalance/HideBalance";
import { SelectNetworkMobile } from "@/app/components/NavigationBar/components/SelectNetwork";
import { Contracts } from "@/app/lib/profiles";

export const UserMenu: FC<UserMenuProperties> = ({ onUserAction, avatarImage, userInitials }) => {
	const { t } = useTranslation();

	const userMenuActions = useMemo<DropdownOptionGroup[]>(() => getUserMenuActions(t), [t]);
	const { isXs } = useBreakpoint();

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
				{userMenuActions.map((group) => (
					<div key={group.key}>
						{group.hasDivider && (
							<div>
								<div className="h-px w-full bg-theme-secondary-300 dim:bg-theme-dim-700 dark:bg-theme-dark-700" />
							</div>
						)}
						<ul>
							{group.title && (
								<li className="mx-1 my-1 block whitespace-nowrap rounded-lg bg-theme-primary-50 px-5 py-1 text-left text-xs font-semibold text-theme-secondary-700 dim:bg-theme-dim-navy-900 dim:text-theme-dim-200 dark:bg-theme-dark-800 dark:text-theme-dark-200">
									{group.title}
								</li>
							)}
							{group.options.map((option, index) => (
								<DropdownListItem
									key={option.value}
									disabled={option.disabled}
									data-testid={`dropdown__option--${group.key ? group.key + "-" : ""}${index}`}
									onClick={() => {
										if (!option.disabled) {
											onUserAction(option);
										}
									}}
								>
									{option.iconPosition === "start" && option.icon && (
										<Icon
											name={option.icon}
											className="dark:text-theme-secondary-600 dim:text-theme-dim-200"
											size={option.iconSize || "md"}
										/>
									)}
									<span className="flex w-full items-center justify-between">
										{option.element || option.label}
										{option.secondaryLabel && (
											<span className="ml-1 pr-4 text-theme-secondary-500 dark:text-theme-secondary-600">
												{typeof option.secondaryLabel === "function"
													? option.secondaryLabel(!!option.active)
													: option.secondaryLabel}
											</span>
										)}
									</span>
									{option.iconPosition !== "start" && option.icon && (
										<Icon
											name={option.icon}
											className="dark:text-theme-secondary-600 dim:text-theme-dim-200"
											size={option.iconSize || "md"}
										/>
									)}
								</DropdownListItem>
							))}
						</ul>
					</div>
				))}
				{showNetworkToggle ? <SelectNetworkMobile profile={profile} /> : undefined}
			</DropdownContent>
		</DropdownRoot>
	);
};
