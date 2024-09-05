import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { generatePath, NavLink, useHistory } from "react-router-dom";
import tw, { css, styled } from "twin.macro";
import cn from "classnames";
import { NavigationBarFullProperties, NavigationBarLogoOnlyProperties } from "./NavigationBar.contracts";
import { defaultStyle } from "./NavigationBar.styles";
import { Button } from "@/app/components/Button";
import { Dropdown, DropdownOption } from "@/app/components/Dropdown";
import { Divider } from "@/app/components/Divider";
import { Icon } from "@/app/components/Icon";
import { BackButton } from "@/app/components/NavigationBar/components/BackButton";
import { Balance } from "@/app/components/NavigationBar/components/Balance";
import { UserMenu } from "@/app/components/NavigationBar/components/UserMenu/UserMenu";
import { NotificationsDropdown } from "@/app/components/Notifications";
import { ServerStatusIndicator } from "@/app/components/ServerStatusIndicator";
import { Tooltip } from "@/app/components/Tooltip";
import { getNavigationMenu } from "@/app/constants/navigation";
import { useConfiguration, useNavigationContext } from "@/app/contexts";
import { useActiveProfile, useBreakpoint, useInputFocus, useScroll } from "@/app/hooks";
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

const NavWrapper = styled.nav<{ noBorder?: boolean; noShadow?: boolean; scroll?: number }>`
	${defaultStyle}

	${tw`sticky inset-x-0 top-0 transition-all duration-200 border-b border-theme-background bg-theme-background`}

	${({ noBorder, scroll }) => {
		if (!noBorder && !scroll) {
			return tw`border-theme-secondary-300 dark:border-theme-secondary-800`;
		}
	}}

	${({ noShadow, scroll }) => {
		if (!noShadow && scroll) {
			return tw`shadow-header-smooth dark:shadow-header-smooth-dark`;
		}
	}};
`;

export const NavigationButtonWrapper = styled.div`
	${css`
		button {
			${tw`w-10 h-10 sm:w-11 sm:h-11 overflow-hidden rounded text-theme-secondary-700 dark:text-theme-secondary-600 not-disabled:(hover:text-theme-primary-600 hover:bg-theme-primary-100 dark:hover:bg-theme-secondary-800 dark:hover:text-theme-secondary-100)`};
		}
	`};
`;

const NavigationBarLogo: React.FC<NavigationBarLogoOnlyProperties> = ({
	title,
	onClick,
}: NavigationBarLogoOnlyProperties) => {
	const history = useHistory();
	const { isXs } = useBreakpoint();

	const defaultHandler = useCallback(() => {
		history.push("/");
	}, [history]);

	return (
		<div className="my-auto flex items-center">
			<button
				data-testid="NavigationBarLogo--button"
				type="button"
				className="my-auto mr-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-theme-primary-600 text-white outline-none focus:outline-none focus:ring-2 focus:ring-theme-primary-400 sm:mr-4 sm:h-11 sm:w-11 sm:rounded-xl"
				onClick={() => (onClick ? onClick() : defaultHandler())}
			>
				<Logo height={isXs ? 22 : 28} />
			</button>

			{title && <span className="text-lg uppercase">{title}</span>}
		</div>
	);
};

export const NavigationBarLogoOnly: React.VFC<NavigationBarLogoOnlyProperties> = ({ title }) => {
	const scroll = useScroll();

	return (
		<NavWrapper aria-labelledby="main menu" noBorder scroll={scroll}>
			<div className="relative flex h-21">
				<div className="flex flex-1 px-6 md:px-10">
					<NavigationBarLogo title={title} />
				</div>
			</div>
		</NavWrapper>
	);
};

const NavigationBarMobileWrapper = styled.div<{
	hasFixedFormButtons?: boolean;
}>`
	${({ hasFixedFormButtons }) => !hasFixedFormButtons && tw`shadow-footer-smooth dark:shadow-footer-smooth-dark`};
	${tw`fixed bottom-0 left-0 z-10 flex w-full flex-col justify-center bg-white dark:bg-black sm:hidden`}
	${css`
		@supports (padding-bottom: env(safe-area-inset-bottom)) {
			padding-bottom: env(safe-area-inset-bottom);
		}
	`}
`;

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
	const scroll = useScroll();
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

	const { profileIsSyncingExchangeRates } = useConfiguration();

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
			<ul className="ml-4 mr-auto hidden h-21 space-x-8 lg:flex" data-testid="NavigationBar__menu">
				{navigationMenu.map((menuItem, index) => (
					<li key={index} className="flex">
						<NavLink
							to={menuItem.mountPath(profile.id())}
							title={menuItem.title}
							className="text-md ring-focus relative flex items-center font-semibold text-theme-secondary-text transition-colors duration-200 focus:outline-none"
							data-ring-focus-margin="-mx-2"
						>
							{menuItem.title}
						</NavLink>
					</li>
				))}
			</ul>
			<div
				data-testid="NavigationBar__menu-toggle"
				className="ml-2 mr-auto flex content-center items-center lg:hidden"
			>
				<Dropdown
					dropdownClass="w-full sm:w-auto mt-6 sm:mt-10 mx-0 rounded-none sm:rounded-xl"
					toggleContent={(isOpen) => (
						<button
							type="button"
							className="cursor-pointer rounded p-2 focus:outline-none focus:ring-2 focus:ring-theme-primary-400"
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

			<NavWrapper aria-labelledby="main menu" scroll={scroll}>
				<div className="relative flex h-21">
					<div className="hidden w-12 sm:flex">
						<BackButton disabled={isBackDisabled} />
					</div>

					<div className="flex flex-1 items-center px-6 sm:px-8">
						<NavigationBarLogo onClick={homeButtonHandler} />

						{renderNavigationMenu()}

						<div className="mr-4 flex items-center space-x-2 sm:space-x-4">
							<ServerStatusIndicator profile={profile} />

							<div className="h-8 border-r border-theme-secondary-300 dark:border-theme-secondary-800" />

							<NotificationsDropdown profile={profile} />

							<div className="h-8 border-r border-theme-secondary-300 dark:border-theme-secondary-800" />

							<div className="hidden items-center space-x-4 sm:flex">
								<div className="flex items-center">
									<Tooltip content={wallets.length > 0 ? undefined : t("COMMON.NOTICE_NO_WALLETS")}>
										<NavigationButtonWrapper>
											<Button
												data-testid="NavigationBar__buttons--receive"
												disabled={wallets.length === 0}
												size="icon"
												variant="transparent"
												onClick={receiveButtonClickHandler}
											>
												<Icon name="Received" size="lg" className="p-1" />
											</Button>
										</NavigationButtonWrapper>
									</Tooltip>
								</div>

								<div className="h-8 border-r border-theme-secondary-300 dark:border-theme-secondary-800" />

								<div className="flex items-center">
									<Tooltip content={wallets.length > 0 ? undefined : t("COMMON.NOTICE_NO_WALLETS")}>
										<NavigationButtonWrapper>
											<Button
												data-testid="NavigationBar__buttons--send"
												disabled={wallets.length === 0}
												size="icon"
												variant="transparent"
												onClick={sendButtonClickHandler}
											>
												<Icon name="Sent" size="lg" className="p-1" />
											</Button>
										</NavigationButtonWrapper>
									</Tooltip>
								</div>

								<div className="h-8 border-r border-theme-secondary-300 dark:border-theme-secondary-800" />
							</div>
						</div>

						<div className="mx-4 my-auto hidden items-center md:flex" data-testid="NavigationBar__balance">
							<Balance profile={profile} isLoading={profileIsSyncingExchangeRates} />
						</div>

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
