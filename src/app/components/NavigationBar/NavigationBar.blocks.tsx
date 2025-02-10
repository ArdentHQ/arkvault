import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { generatePath, NavLink, useHistory } from "react-router-dom";
import cn from "classnames";
import { NavigationBarFullProperties, NavigationBarLogoOnlyProperties } from "./NavigationBar.contracts";
import { Button } from "@/app/components/Button";
import { Dropdown, DropdownOption } from "@/app/components/Dropdown";
import { Divider } from "@/app/components/Divider";
import { Icon } from "@/app/components/Icon";
import { BackButton } from "@/app/components/NavigationBar/components/BackButton";
import { UserMenu } from "@/app/components/NavigationBar/components/UserMenu/UserMenu";
import { NotificationsDropdown } from "@/app/components/Notifications";
import { ServerStatusIndicator } from "@/app/components/ServerStatusIndicator";
import { Tooltip } from "@/app/components/Tooltip";
import { getNavigationMenu } from "@/app/constants/navigation";
import { useNavigationContext } from "@/app/contexts";
import { useActiveProfile, useBreakpoint, useInputFocus } from "@/app/hooks";
import { ReceiveFunds } from "@/domains/wallet/components/ReceiveFunds";
import { SearchWallet } from "@/domains/wallet/components/SearchWallet";
import { SelectedWallet } from "@/domains/wallet/components/SearchWallet/SearchWallet.contracts";
import { assertString } from "@/utils/assertions";
import { useLink } from "@/app/hooks/use-link";
import { ProfilePaths } from "@/router/paths";
import { Size } from "@/types";
import { Logo } from "@/app/components/Logo";
import { profileAllEnabledNetworkIds } from "@/utils/network-utils";
import { useZendesk } from "@/app/contexts/Zendesk";
import { twMerge } from "tailwind-merge";
import { SelectNetwork } from "./components/SelectNetwork";

const NavWrapper = ({
	variant = "default",
	...props
}: React.HTMLProps<HTMLDivElement> & { variant?: "default" | "logo-only" }) => (
	<nav
		{...props}
		className={twMerge(
			cn(
				"custom-nav-wrapper sticky inset-x-0 top-0 z-40 bg-white transition-all duration-200 dark:bg-theme-dark-900",
				{
					"h-12 border-b border-b-theme-secondary-300 dark:border-b-theme-dark-700": variant === "default",
					"h-21": variant === "logo-only",
				},
			),
			props.className,
		)}
	/>
);

export const NavigationButtonWrapper = ({ ...props }: React.HTMLProps<HTMLDivElement>) => (
	<div {...props} className={twMerge("custom-button-nav-wrapper", props.className)} />
);

const NavigationBarLogo: React.FC<NavigationBarLogoOnlyProperties> = ({
	title,
	onClick,
	variant = "default",
}: NavigationBarLogoOnlyProperties) => {
	const history = useHistory();
	const { isXs } = useBreakpoint();

	const defaultHandler = useCallback(() => {
		history.push("/");
	}, [history]);

	const getLogoHeight = () => {
		if (variant === "default") {
			return 16;
		}

		return isXs ? 22 : 32;
	};

	return (
		<div className="my-auto flex h-16 items-center sm:h-21">
			<button
				data-testid="NavigationBarLogo--button"
				type="button"
				className={cn(
					"my-auto flex cursor-pointer items-center justify-center rounded bg-theme-primary-600 text-white outline-none focus:outline-none focus:ring-2 focus:ring-theme-primary-400 dark:bg-theme-dark-navy-500",
					{
						"h-11 w-11": variant === "logo-only" && !isXs,
						"h-6 w-6": variant === "default",
						"h-8 w-8": variant === "logo-only" && isXs,
					},
				)}
				onClick={() => (onClick ? onClick() : defaultHandler())}
			>
				<Logo height={getLogoHeight()} />
			</button>

			{title && <span className="ml-4 text-lg uppercase leading-[21px]">{title}</span>}
		</div>
	);
};

export const NavigationBarLogoOnly: React.VFC<NavigationBarLogoOnlyProperties> = ({ title }) => (
	<NavWrapper aria-labelledby="main menu" variant="logo-only">
		<div className="relative flex">
			<div className="flex flex-1 px-4 sm:px-6 md:px-10">
				<NavigationBarLogo title={title} variant="logo-only" />
			</div>
		</div>
	</NavWrapper>
);

const NavigationBarMobileWrapper = ({
	hasFixedFormButtons,
	...props
}: React.HTMLProps<HTMLDivElement> & { hasFixedFormButtons?: boolean }) => (
	<div
		{...props}
		className={twMerge(
			"fixed bottom-0 left-0 z-10 flex w-full flex-col justify-center bg-white dark:bg-black sm:hidden",
			cn({
				"shadow-footer-smooth dark:shadow-footer-smooth-dark": !hasFixedFormButtons,
			}),
			props.className,
		)}
	/>
);

const NavigationBarMobile: React.VFC<{
	sendButtonClickHandler: () => void;
	receiveButtonClickHandler: () => void;
	homeButtonHandler: () => void;
	disabled: boolean;
	hasFixedFormButtons: boolean;
}> = ({ sendButtonClickHandler, receiveButtonClickHandler, homeButtonHandler, disabled, hasFixedFormButtons }) => {
	const { isInputElementFocused } = useInputFocus();

	if (isInputElementFocused) {
		return null;
	}

	return (
		<NavigationBarMobileWrapper data-testid="NavigationBarMobile" hasFixedFormButtons={hasFixedFormButtons}>
			{hasFixedFormButtons && (
				<div
					data-testid="NavigationBar__buttons-separator"
					className="border-t border-theme-secondary-300 dark:border-theme-secondary-900"
				/>
			)}

			<div className="flex h-14 items-center justify-center space-x-4">
				<Button
					data-testid="NavigationBar__buttons__mobile--receive"
					disabled={disabled}
					size="icon"
					variant="transparent"
					onClick={receiveButtonClickHandler}
					className={cn({
						"cursor-not-allowed text-theme-secondary-500": disabled,
						"text-theme-secondary-700 dark:text-theme-secondary-600": !disabled,
					})}
				>
					<Icon name="Received" size="lg" />
				</Button>

				<Divider type="vertical" size="md" />

				<Button
					data-testid="NavigationBar__buttons__mobile--home"
					size="icon"
					variant="transparent"
					onClick={homeButtonHandler}
					className="text-theme-secondary-700 dark:text-theme-secondary-600"
				>
					<Icon name="Dashboard" size="lg" />
				</Button>

				<Divider type="vertical" size="md" />

				<Button
					data-testid="NavigationBar__buttons__mobile--send"
					disabled={disabled}
					size="icon"
					variant="transparent"
					onClick={sendButtonClickHandler}
					className={cn({
						"cursor-not-allowed text-theme-secondary-500": disabled,
						"text-theme-secondary-700 dark:text-theme-secondary-600": !disabled,
					})}
				>
					<Icon name="Sent" size="lg" />
				</Button>
			</div>
		</NavigationBarMobileWrapper>
	);
};

export const NavigationBarFull: React.FC<NavigationBarFullProperties> = ({
	isBackDisabled,
}: NavigationBarFullProperties) => {
	const history = useHistory();
	const profile = useActiveProfile();
	const { t } = useTranslation();
	const { openExternal } = useLink();
	const { isLg, isMd } = useBreakpoint();
	const { showSupportChat } = useZendesk();

	const enabledNetworkIds = profileAllEnabledNetworkIds(profile);

	const modalSize = useMemo<Size>(() => {
		if (isLg) {
			return "4xl";
		}

		if (isMd) {
			return "2xl";
		}

		return "5xl";
	}, [isLg, isMd]);

	const { hasFixedFormButtons, showMobileNavigation } = useNavigationContext();

	const [searchWalletIsOpen, setSearchWalletIsOpen] = useState(false);

	const [selectedWallet, setSelectedWallet] = useState<SelectedWallet | undefined>();

	const isProfileRestored = profile.status().isRestored();

	const navigationMenu = useMemo(() => getNavigationMenu(t), [t]);
	const handleSelectMenuItem = useCallback(
		({ value }: DropdownOption) => {
			history.push(String(value));
		},
		[history],
	);

	const network = useMemo(
		() => profile.availableNetworks().find((network) => network.id() === selectedWallet?.network.id()),
		[selectedWallet, profile],
	);

	const renderNavigationMenu = () => (
		<>
			<ul className="hidden h-12 items-center xl:flex" data-testid="NavigationBar__menu">
				{navigationMenu.map((menuItem, index) => (
					<li key={index} className="flex">
						<NavLink
							to={menuItem.mountPath(profile.id())}
							title={menuItem.title}
							className="ring-focus relative flex h-fit items-center rounded bg-transparent px-2 py-1 text-sm font-semibold leading-[17px] text-theme-secondary-700 transition-all duration-200 hover:bg-theme-secondary-200 hover:text-theme-secondary-900 focus:outline-none dark:text-theme-dark-200 dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-50"
						>
							{menuItem.title}
						</NavLink>
					</li>
				))}
			</ul>
			<div
				data-testid="NavigationBar__menu-toggle"
				className="mr-auto flex content-center items-center xl:hidden"
			>
				<Dropdown
					toggleContent={(isOpen) => (
						<button
							type="button"
							className="cursor-pointer rounded py-2 text-theme-secondary-700 focus:outline-none focus:ring-2 focus:ring-theme-primary-400 dark:text-theme-dark-200"
						>
							<Icon size="lg" name={isOpen ? "MenuOpen" : "Menu"} />
						</button>
					)}
					onSelect={handleSelectMenuItem}
					options={navigationMenu.map((menuItem) => ({
						label: menuItem.title,
						value: menuItem.mountPath(profile.id()),
					}))}
				/>
			</div>
		</>
	);

	const userInitials = useMemo(() => {
		if (!isProfileRestored) {
			return;
		}

		const name = profile.settings().get(Contracts.ProfileSetting.Name);

		assertString(name);
		return name.slice(0, 2).toUpperCase();
	}, [profile, isProfileRestored]);

	const wallets = useMemo<Contracts.IReadWriteWallet[]>(() => {
		if (!isProfileRestored) {
			return [];
		}

		return profile
			.wallets()
			.values()
			.filter((wallet) => enabledNetworkIds.includes(wallet.network().id()));
	}, [profile, isProfileRestored, enabledNetworkIds]);

	const handleSelectWallet = (wallet: SelectedWallet) => {
		setSearchWalletIsOpen(false);

		setSelectedWallet(wallet);
	};

	const handleCloseReceiveFunds = useCallback(() => setSelectedWallet(undefined), [setSelectedWallet]);

	const sendButtonClickHandler = useCallback(() => {
		const sendTransferPath = `/profiles/${profile.id()}/send-transfer`;

		// add query param reset = 1 if already on send transfer page
		/* istanbul ignore next: tested in e2e -- @preserve */
		const reset = history.location.pathname === sendTransferPath ? 1 : 0;
		history.push(`${sendTransferPath}?reset=${reset}`);
	}, [history]);

	const receiveButtonClickHandler = useCallback(() => {
		setSearchWalletIsOpen(true);
	}, [history]);

	const homeButtonHandler = useCallback(() => {
		const dashboardPath = generatePath(ProfilePaths.Dashboard, { profileId: profile.id() });

		history.push(dashboardPath);
	}, [history]);

	const transactButtonsDisabled = useMemo(() => wallets.length === 0, [wallets]);

	return (
		<>
			{showMobileNavigation && (
				<NavigationBarMobile
					hasFixedFormButtons={hasFixedFormButtons}
					sendButtonClickHandler={sendButtonClickHandler}
					receiveButtonClickHandler={receiveButtonClickHandler}
					homeButtonHandler={homeButtonHandler}
					disabled={transactButtonsDisabled}
				/>
			)}

			<NavWrapper aria-labelledby="main menu">
				<div className="relative flex h-12 flex-row">
					<div className="hidden w-9 sm:flex">
						<BackButton disabled={isBackDisabled} />
					</div>

					<div className="flex flex-1 items-center justify-between px-6">
						<div className="flex flex-row items-center gap-6">
							<NavigationBarLogo onClick={homeButtonHandler} />
							{renderNavigationMenu()}
						</div>

						<div className="flex flex-row items-center justify-center gap-4 sm:gap-5">
							<NotificationsDropdown profile={profile} />
							<div className="h-6 border-r border-theme-secondary-300 dark:border-theme-dark-700 sm:h-12" />
							<ServerStatusIndicator profile={profile} />
							<div className="hidden h-6 border-r border-theme-secondary-300 dark:border-theme-dark-700 sm:flex sm:h-12" />
							<div className="hidden items-center sm:flex">
								<Tooltip content={wallets.length > 0 ? undefined : t("COMMON.NOTICE_NO_WALLETS")}>
									<div>
										<NavigationButtonWrapper>
											<Button
												data-testid="NavigationBar__buttons--receive"
												disabled={wallets.length === 0}
												size="icon"
												variant="transparent"
												className="text-theme-secondary-700 hover:text-theme-primary-700 dark:text-theme-dark-200 dark:hover:text-theme-dark-50"
												onClick={receiveButtonClickHandler}
											>
												<Icon name="Received" size="lg" className="p-1" />
											</Button>
										</NavigationButtonWrapper>
									</div>
								</Tooltip>
							</div>
							<div className="hidden h-6 border-r border-theme-secondary-300 dark:border-theme-dark-700 sm:flex sm:h-12" />
							<div className="hidden items-center sm:flex">
								<Tooltip content={wallets.length > 0 ? undefined : t("COMMON.NOTICE_NO_WALLETS")}>
									<div>
										<NavigationButtonWrapper>
											<Button
												data-testid="NavigationBar__buttons--send"
												disabled={wallets.length === 0}
												size="icon"
												variant="transparent"
												className="text-theme-secondary-700 hover:text-theme-primary-700 dark:text-theme-dark-200 dark:hover:text-theme-dark-50"
												onClick={sendButtonClickHandler}
											>
												<Icon name="Sent" size="lg" className="p-1" />
											</Button>
										</NavigationButtonWrapper>
									</div>
								</Tooltip>
							</div>

							<div className="h-6 border-r border-theme-secondary-300 dark:border-theme-dark-700 sm:h-12" />

							{!!profile.settings().get(Contracts.ProfileSetting.UseTestNetworks) && <div className="hidden sm:block"><SelectNetwork profile={profile} /></div>}

							<div className="h-6 border-r border-theme-secondary-300 dark:border-theme-dark-700 sm:h-12" />

							<UserMenu
								userInitials={userInitials}
								avatarImage={profile.avatar()}
								onUserAction={(action: DropdownOption) => {
									if (action.value === "contact") {
										return showSupportChat(profile);
									}

									if (action.isExternal) {
										return openExternal(action.mountPath());
									}

									return history.push(action.mountPath(profile.id()));
								}}
							/>
						</div>
					</div>
				</div>

				<SearchWallet
					profile={profile}
					isOpen={searchWalletIsOpen}
					title={t("PROFILE.MODAL_SELECT_ADDRESS.TITLE")}
					description={t("PROFILE.MODAL_SELECT_ADDRESS.DESCRIPTION")}
					searchPlaceholder={t("PROFILE.MODAL_SELECT_ADDRESS.SEARCH_PLACEHOLDER")}
					wallets={wallets}
					size={modalSize}
					onSelectWallet={handleSelectWallet}
					onClose={() => setSearchWalletIsOpen(false)}
				/>

				{selectedWallet && network && (
					<ReceiveFunds
						address={selectedWallet.address}
						name={selectedWallet.name}
						network={network}
						onClose={handleCloseReceiveFunds}
					/>
				)}
			</NavWrapper>
		</>
	);
};
