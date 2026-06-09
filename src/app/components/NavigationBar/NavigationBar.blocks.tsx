import { Contracts } from "@/app/lib/profiles";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { generatePath, NavLink, useLocation, useNavigate } from "react-router-dom";
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
import { LogoAlpha } from "@/app/components/Logo";
import { useZendesk } from "@/app/contexts/Zendesk";
import { twMerge } from "tailwind-merge";
import { HideBalance } from "@/app/components/NavigationBar/components/HideBalance/HideBalance";
import { SelectNetwork } from "./components/SelectNetwork";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { Panel, usePanels } from "@/app/contexts/Panels";

const NavWrapper = ({
	variant = "default",
	...props
}: React.HTMLProps<HTMLDivElement> & { variant?: "default" | "logo-only" }) => (
	<nav
		{...props}
		className={twMerge(
			cn(
				"custom-nav-wrapper sticky inset-x-0 top-0 z-40 bg-white transition-all duration-200 dim:bg-theme-dim-900 dark:bg-theme-dark-900",
				{
					"h-12 border-b border-b-theme-secondary-300 dim:border-b-theme-dim-700 dark:border-b-theme-dark-700":
						variant === "default",
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
	const navigate = useNavigate();
	const { isXs } = useBreakpoint();

	const getLogoHeight = () => {
		if (variant === "default") {
			return 16;
		}

		return isXs ? 22 : 32;
	};

	return (
		<div className="my-auto flex h-12 items-center">
			<LogoAlpha
				height={getLogoHeight()}
				variant={variant}
				onClick={() => (onClick ? onClick() : navigate("/"))}
			/>

			{title && <span className="ml-4 text-lg uppercase leading-[21px]">{title}</span>}
		</div>
	);
};

export const NavigationBarLogoOnly = ({ title }: NavigationBarLogoOnlyProperties) => (
	<NavWrapper aria-labelledby="main menu" variant="logo-only">
		<div className="relative flex">
			<div className="mt-6 flex flex-1 px-6 md:px-10">
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
			"fixed bottom-0 left-0 z-50 flex w-full flex-col justify-center bg-white dim:bg-theme-dim-950 dark:bg-black sm:hidden",
			cn({
				"shadow-footer-smooth dark:shadow-footer-smooth-dark": !hasFixedFormButtons,
			}),
			props.className,
		)}
	/>
);

const NavigationBarMobile = ({
	sendButtonClickHandler,
	receiveButtonClickHandler,
	homeButtonHandler,
	disabled,
	hasFixedFormButtons,
}: {
	sendButtonClickHandler: () => void;
	receiveButtonClickHandler: () => void;
	homeButtonHandler: () => void;
	disabled: boolean;
	hasFixedFormButtons: boolean;
}) => {
	const { isInputElementFocused } = useInputFocus();

	if (isInputElementFocused) {
		return null;
	}

	return (
		<NavigationBarMobileWrapper data-testid="NavigationBarMobile" hasFixedFormButtons={hasFixedFormButtons}>
			{hasFixedFormButtons && (
				<div
					data-testid="NavigationBar__buttons-separator"
					className="border-t border-theme-secondary-300 dim:border-theme-dim-950 dark:border-theme-secondary-900"
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
						"text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-secondary-600": !disabled,
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
					className="text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-secondary-600"
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
						"text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-secondary-600": !disabled,
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
	const navigate = useNavigate();
	const location = useLocation();
	const profile = useActiveProfile();
	const { t } = useTranslation();
	const { openExternal } = useLink();
	const { isLg, isMd } = useBreakpoint();
	const { showSupportChat } = useZendesk();
	const { activeNetwork } = useActiveNetwork({ profile });

	const modalSize = useMemo<Size>(() => {
		if (isLg) {
			return "3xl";
		}

		if (isMd) {
			return "2xl";
		}

		return "3xl";
	}, [isLg, isMd]);

	const { hasFixedFormButtons, showMobileNavigation } = useNavigationContext();

	const [searchWalletIsOpen, setSearchWalletIsOpen] = useState(false);

	const [selectedWallet, setSelectedWallet] = useState<SelectedWallet | undefined>();

	const isProfileRestored = profile.status().isRestored();

	const wallets = useMemo<Contracts.IReadWriteWallet[]>(() => {
		if (!isProfileRestored) {
			return [];
		}

		return profile
			.wallets()
			.values()
			.filter((wallet) => wallet.network().id() === activeNetwork.id());
	}, [profile, isProfileRestored, activeNetwork]);

	const navigationMenu = useMemo(() => getNavigationMenu(t, location.pathname), [t, location.pathname]);
	const handleSelectMenuItem = useCallback(
		({ value }: DropdownOption) => {
			navigate(String(value));
		},
		[navigate],
	);

	const network = useMemo(
		() => profile.availableNetworks().find((network) => network.id() === selectedWallet?.network.id()),
		[selectedWallet, profile],
	);

	const isMenuItemDisabled = (id: string) =>
		["tokens", "votes", "exchange"].includes(id) && profile.wallets().count() === 0;

	const renderNavigationMenu = () => (
		<>
			<ul className="hidden h-12 items-center gap-0.5 xl:flex" data-testid="NavigationBar__menu">
				{navigationMenu.map((menuItem, index) => {
					if (isMenuItemDisabled(menuItem.id)) {
						return (
							<li key={index} className="flex">
								<Tooltip content={menuItem.disabledMessage}>
									<span className="cursor-pointer border-transparent bg-transparent px-2 py-1 text-sm font-semibold leading-[17px] text-theme-secondary-500 dim:text-theme-dim-500 dark:text-theme-dark-500">
										{" "}
										{menuItem.title}{" "}
									</span>
								</Tooltip>
							</li>
						);
					}

					return (
						<li key={index} className="flex">
							<NavLink
								to={menuItem.mountPath(profile.id())}
								title={menuItem.title}
								className={cn(
									"ring-focus focus:outline-hidden relative flex h-fit items-center rounded border px-2 py-1 text-sm font-semibold leading-[17px] transition-all duration-200 hover:bg-theme-secondary-200 hover:text-theme-secondary-900 dim-hover:bg-theme-dim-700 dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-50",
									{
										"border-theme-primary-200 bg-theme-secondary-200 text-theme-primary-600 dim:border-theme-dim-700 dim:bg-theme-dim-950 dim:text-theme-dim-50 dark:border-theme-dark-700 dark:bg-theme-dark-950 dark:text-theme-dark-50":
											menuItem.isActive,
										"border-transparent bg-transparent text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200":
											!menuItem.isActive,
									},
								)}
							>
								{menuItem.title}
							</NavLink>
						</li>
					);
				})}
			</ul>
			<div
				data-testid="NavigationBar__menu-toggle"
				className="mr-auto flex content-center items-center xl:hidden"
			>
				<Dropdown
					variant="navbar"
					toggleContent={(isOpen) => (
						<button
							type="button"
							className="focus:outline-hidden flex h-7 cursor-pointer items-center rounded text-theme-secondary-700 focus:ring-2 focus:ring-theme-primary-400 dark:text-theme-dark-200"
						>
							<Icon size="lg" name={isOpen ? "MenuOpen" : "Menu"} />
						</button>
					)}
					onSelect={handleSelectMenuItem}
					options={navigationMenu.map((menuItem) => ({
						disabled: isMenuItemDisabled(menuItem.id),
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

	const handleSelectWallet = (wallet: SelectedWallet) => {
		setSearchWalletIsOpen(false);

		setSelectedWallet(wallet);
	};

	const handleCloseReceiveFunds = useCallback(() => setSelectedWallet(undefined), [setSelectedWallet]);

	const { openPanel } = usePanels();

	const sendButtonClickHandler = () => {
		openPanel(Panel.SendTransfer, { isTokenTransfer: false });
	};

	const receiveButtonClickHandler = useCallback(() => {
		setSearchWalletIsOpen(true);
	}, [location]);

	const homeButtonHandler = useCallback(() => {
		const dashboardPath = generatePath(ProfilePaths.Dashboard, { profileId: profile.id() });

		navigate(dashboardPath);
	}, [location]);

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

					<div className="flex flex-1 items-center justify-between gap-3 px-6">
						<div className="flex flex-row items-center gap-5">
							<NavigationBarLogo onClick={homeButtonHandler} />
							{renderNavigationMenu()}
						</div>

						<div className="flex flex-row items-center justify-center gap-3 sm:gap-5">
							<NotificationsDropdown profile={profile} />
							<div className="h-6 border-r border-theme-secondary-300 dim:border-theme-dim-700 dark:border-theme-dark-700 sm:h-12" />
							<ServerStatusIndicator profile={profile} />
							<div className="hidden h-6 border-r border-theme-secondary-300 dim:border-theme-dim-700 dark:border-theme-dark-700 sm:flex sm:h-12" />
							<div className="hidden items-center sm:flex">
								<Tooltip
									content={wallets.length > 0 ? t("COMMON.RECEIVE") : t("COMMON.NOTICE_NO_ADDRESSES")}
								>
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
							<div className="hidden h-6 border-r border-theme-secondary-300 dim:border-theme-dim-700 dark:border-theme-dark-700 sm:flex sm:h-12" />
							<div className="hidden items-center sm:flex">
								<Tooltip
									content={wallets.length > 0 ? t("COMMON.SEND") : t("COMMON.NOTICE_NO_ADDRESSES")}
								>
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

							<div className="h-6 border-r border-theme-secondary-300 dim:border-theme-dim-700 dark:border-theme-dark-700 sm:h-12" />

							{!!profile.settings().get(Contracts.ProfileSetting.UseTestNetworks) && (
								<>
									<div className="hidden sm:block">
										<SelectNetwork profile={profile} />
									</div>
									<div className="hidden h-6 border-r border-theme-secondary-300 dark:border-theme-dark-700 sm:block sm:h-12" />
								</>
							)}

							<div className="ml-1 flex items-center gap-5 sm:ml-0">
								<HideBalance className="hidden md-lg:flex" profile={profile} />
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

										return navigate(action.mountPath(profile.id()));
									}}
								/>
							</div>
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
