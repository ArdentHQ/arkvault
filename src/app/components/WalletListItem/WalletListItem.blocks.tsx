import cn from "classnames";
import React, { useCallback } from "react";
import { Contracts } from "@payvo/sdk-profiles";
import { useTranslation } from "react-i18next";
import { MobileLayoutProperties, MobileRecipientProperties } from ".";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { Avatar } from "@/app/components/Avatar";
import { Button } from "@/app/components/Button";
import { Dropdown } from "@/app/components/Dropdown";
import { Icon } from "@/app/components/Icon";
import { TableCell } from "@/app/components/Table";
import { Tooltip } from "@/app/components/Tooltip";
import { WalletIcons } from "@/app/components/WalletIcons";
import {
	BalanceProperties,
	ButtonsCellProperties,
	CurrencyProperties,
	WalletCellProperties,
	StarredProperties,
	InfoProperties,
} from "@/app/components/WalletListItem/WalletListItem.contracts";
import { useConfiguration } from "@/app/contexts";
import { useActiveProfile, useWalletAlias } from "@/app/hooks";
import { useWalletOptions } from "@/domains/wallet/pages/WalletDetails/hooks/use-wallet-options";
import { Skeleton } from "@/app/components/Skeleton";
import { useWalletActions } from "@/domains/wallet/hooks";

const starIconDimensions: [number, number] = [18, 18];
const excludedIcons = ["isStarred"];

export const Starred: React.VFC<StarredProperties> = ({
	wallet,
	handleToggleStar,
	isCompact,
	isLargeScreen = true,
}) => {
	const { t } = useTranslation();

	if (!isLargeScreen) {
		return (
			<div
				data-testid="WalletIcon__Starred"
				onClick={handleToggleStar}
				className="flex shrink-0 items-center justify-center"
			>
				<Icon
					className="text-theme-warning-400"
					name={wallet.isStarred() ? "StarFilled" : "Star"}
					dimensions={starIconDimensions}
				/>
			</div>
		);
	}

	return (
		<TableCell
			variant="start"
			size="sm"
			innerClassName={isCompact ? "space-x-3" : "space-x-4"}
			isCompact={isCompact}
			data-testid="TableCell_Starred"
		>
			<div
				className={cn(
					"flex items-center border-r border-theme-secondary-300 pr-3 dark:border-theme-secondary-800",
					isCompact ? "h-5" : "h-11",
				)}
			>
				<Tooltip
					content={
						wallet.isStarred()
							? t("WALLETS.PAGE_WALLET_DETAILS.UNSTAR_WALLET")
							: t("WALLETS.PAGE_WALLET_DETAILS.STAR_WALLET")
					}
				>
					<div
						data-testid="WalletIcon__Starred"
						onClick={handleToggleStar}
						className="flex shrink-0 items-center justify-center"
					>
						<Icon
							className="text-theme-warning-400"
							name={wallet.isStarred() ? "StarFilled" : "Star"}
							dimensions={starIconDimensions}
						/>
					</div>
				</Tooltip>
			</div>
		</TableCell>
	);
};

export const WalletCell: React.VFC<WalletCellProperties> = ({ wallet, isCompact }) => {
	const profile = useActiveProfile();
	const { getWalletAlias } = useWalletAlias();

	const { alias } = getWalletAlias({
		address: wallet.address(),
		network: wallet.network(),
		profile: profile,
	});

	return (
		<TableCell
			size="sm"
			innerClassName={cn("-ml-3", isCompact ? "space-x-3" : "space-x-4")}
			isCompact={isCompact}
			data-testid="TableCell_Wallet"
		>
			<div className="flex shrink-0 items-center">
				<Avatar
					size={isCompact ? "xs" : "lg"}
					address={wallet.address()}
					shadowClassName="ring-theme-background group-hover:ring-theme-secondary-100 group-hover:bg-theme-secondary-100 dark:group-hover:ring-black dark:group-hover:bg-black"
				/>
			</div>

			<div className="w-20 flex-1 overflow-hidden">
				<Address
					address={wallet.address()}
					addressClass="text-xs text-theme-secondary-500 dark:text-theme-secondary-700"
					walletName={alias}
					walletNameClass="text-sm text-theme-text group-hover:text-theme-primary-700"
					orientation="vertical"
					maxNameChars={0}
				/>
			</div>
		</TableCell>
	);
};

export const Info: React.VFC<InfoProperties> = ({ isCompact, wallet, isLargeScreen = true, className }) => {
	const renderIcons = () => (
		<div className={cn("inline-flex items-center space-x-1", className)}>
			<WalletIcons exclude={excludedIcons} wallet={wallet} iconSize={isLargeScreen ? "lg" : "md"} />
		</div>
	);

	if (!isLargeScreen) {
		return renderIcons();
	}

	return (
		<TableCell innerClassName="justify-center text-sm font-bold text-center align-middle" isCompact={isCompact}>
			{renderIcons()}
		</TableCell>
	);
};

export const Balance: React.VFC<BalanceProperties> = ({
	wallet,
	isCompact,
	isSynced,
	isLargeScreen = true,
	className,
}) => {
	const renderAmount = () => {
		if (isSynced) {
			return <Amount value={wallet.balance()} ticker={wallet.network().ticker()} className={className} />;
		}

		return <Skeleton height={16} width={100} />;
	};

	if (!isLargeScreen) {
		return renderAmount();
	}

	return (
		<TableCell innerClassName="font-semibold justify-end" isCompact={isCompact}>
			{renderAmount()}
		</TableCell>
	);
};

export const Currency: React.VFC<CurrencyProperties> = ({ wallet, isSynced, isCompact, isLargeScreen = true }) => {
	const { profileIsSyncingExchangeRates } = useConfiguration();
	const { t } = useTranslation();

	const renderCurrency = () => {
		if (wallet.network().isTest()) {
			return (
				<span className="text-xs font-semibold text-theme-secondary-900 md:text-base md:text-theme-secondary-500 dark:md:text-theme-secondary-700">
					{t("COMMON.NOT_AVAILABLE")}
				</span>
			);
		}

		if (profileIsSyncingExchangeRates || !isSynced) {
			return <Skeleton height={16} width={100} />;
		}

		return (
			<Amount
				className="text-xs text-theme-secondary-900 md:text-base md:text-theme-secondary-text"
				ticker={wallet.exchangeCurrency()}
				value={wallet.convertedBalance()}
			/>
		);
	};

	if (!isLargeScreen) {
		return renderCurrency();
	}

	return (
		<TableCell
			data-testid="CurrencyCell"
			innerClassName="justify-end"
			className="hidden lg:block"
			isCompact={isCompact}
		>
			{renderCurrency()}
		</TableCell>
	);
};

export const WalletItemAvatar = ({ wallet }: { wallet: Contracts.IReadWriteWallet }) => (
	<Avatar size={"lg"} address={wallet.address()} shadowClassName="ring-theme-primary-100 dark:ring-transparent" />
);

export const WalletItemDetails = ({ wallet }: { wallet: Contracts.IReadWriteWallet }) => {
	const { getWalletAlias } = useWalletAlias();

	const profile = useActiveProfile();

	const { alias } = getWalletAlias({
		address: wallet.address(),
		network: wallet.network(),
		profile: profile,
	});

	return (
		<Address
			address={wallet.address()}
			addressClass="text-xs text-theme-secondary-500 dark:text-theme-secondary-700"
			walletName={alias}
			walletNameClass="text-sm text-theme-text"
			wrapperClass="space-y-1"
			maxNameChars={0}
			orientation="vertical"
		/>
	);
};

export const WalletItemExtraDetails = ({
	wallet,
	isCompact,
}: {
	wallet: Contracts.IReadWriteWallet;
	isCompact: boolean;
}) => {
	const { handleToggleStar } = useWalletActions(wallet);

	return (
		<>
			<Info
				className="border-r border-theme-secondary-300 pr-1 empty:border-r-0 dark:border-theme-secondary-800"
				isCompact={isCompact}
				wallet={wallet}
				isLargeScreen={false}
			/>

			<Starred handleToggleStar={handleToggleStar} isCompact={isCompact} wallet={wallet} isLargeScreen={false} />
		</>
	);
};

export const WalletItemBalance = ({
	wallet,
	isCompact,
	isSynced,
}: {
	wallet: Contracts.IReadWriteWallet;
	isCompact: boolean;
	isSynced: boolean;
}) => (
	<>
		<Balance
			className="text-sm text-white"
			wallet={wallet}
			isCompact={isCompact}
			isSynced={isSynced}
			isLargeScreen={false}
		/>

		<Currency wallet={wallet} isCompact={isCompact} isSynced={isSynced} isLargeScreen={false} />
	</>
);

export const MobileRecipient: React.VFC<MobileRecipientProperties> = ({ clickHandler, recipient, selected }) => {
	const { t } = useTranslation();

	return (
		<div
			data-testid="ListItemSmall"
			className={cn("flex w-full overflow-hidden rounded-xl", {
				"border-2 border-theme-primary-600 bg-theme-primary-600": selected,
				"dark:border-2 dark:border-theme-secondary-800 dark:bg-theme-secondary-800": !selected,
			})}
			onClick={clickHandler}
		>
			<div className="flex flex-grow items-center space-x-4 bg-theme-primary-100 px-6 py-4 dark:bg-theme-secondary-900">
				<div className="flex shrink-0 items-center">
					<Avatar
						shadowClassName="ring-transparent dark:ring-transparent"
						size="lg"
						address={recipient.address}
					/>
				</div>

				<div className="flex w-20 flex-1 flex-col font-semibold">
					<div className="flex flex-col space-y-2 overflow-auto text-sm">
						<div className="flex flex-row space-x-1 overflow-auto">
							<div className="overflow-auto">
								<div className="truncate">{recipient.alias}</div>
							</div>
							<div
								data-testid="RecipientListItem__type"
								className="whitespace-nowrap font-normal text-theme-secondary-500"
							>
								({recipient.type === "wallet" ? t("COMMON.MY_WALLET") : t("COMMON.CONTACT")})
							</div>
						</div>
						<div className="font-normal">
							<Address addressClass="text-theme-secondary-500 text-xs" address={recipient.address} />
						</div>
					</div>
				</div>
			</div>

			{selected && (
				<div data-testid="ListItemSmall--selected" className="flex items-center justify-center px-3">
					<Icon name="StatusOk" className="text-white" size="lg" />
				</div>
			)}
		</div>
	);
};

export const MobileLayout: React.VFC<MobileLayoutProperties> = ({
	clickHandler,
	buttonClickHandler,
	buttonLabel,
	isButtonDisabled,
	avatar,
	details,
	balance,
	extraDetails,
}) => {
	const handleStopPropagation = useCallback((event: React.MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
	}, []);

	return (
		<div
			data-testid="ListItemSmall"
			className="w-full rounded-xl bg-theme-primary-100 p-2 dark:border-2 dark:border-theme-secondary-800 dark:bg-transparent"
			onClick={clickHandler}
		>
			<div className="flex items-center space-x-4 p-4 pt-2 pr-2">
				<div className="flex shrink-0 items-center">{avatar}</div>

				<div className="flex w-20 flex-1 flex-col font-semibold">{details}</div>

				{extraDetails && <div className="flex items-center space-x-2 self-start">{extraDetails}</div>}
			</div>

			<div className="flex overflow-hidden rounded-xl">
				{balance !== undefined && (
					<div className="flex flex-1 flex-col justify-between space-y-1 bg-theme-primary-500 py-3 px-4 font-semibold">
						{balance}
					</div>
				)}

				<div
					className={cn("flex", {
						"flex-grow": balance === undefined,
					})}
					onClick={handleStopPropagation}
				>
					<button
						data-testid="ListItemSmall--button"
						className={cn({
							"cursor-not-allowed opacity-50": isButtonDisabled,
							"flex flex-grow items-center justify-center bg-theme-primary-600 py-3 px-3 font-semibold text-white":
								true,
						})}
						type="button"
						disabled={isButtonDisabled}
						onClick={(event) => buttonClickHandler?.(event)}
					>
						{buttonLabel || <Icon name="DoubleArrowRight" size="lg" />}
					</button>
				</div>
			</div>
		</div>
	);
};

export const ButtonsCell: React.VFC<ButtonsCellProperties> = ({
	wallet,
	isCompact,
	handleSend,
	handleSelectOption,
}) => {
	const { t } = useTranslation();
	const { primaryOptions, secondaryOptions } = useWalletOptions(wallet);

	const isRestoring = !wallet.hasBeenFullyRestored();
	const isButtonDisabled = wallet.balance() === 0 || isRestoring || !wallet.hasSyncedWithNetwork();

	const handleStopPropagation = useCallback((event: React.MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
	}, []);

	return (
		<TableCell variant="end" size="sm" innerClassName="justify-end text-theme-secondary-text" isCompact={isCompact}>
			<div onClick={handleStopPropagation}>
				<Button
					data-testid="WalletListItem__send-button"
					size={isCompact ? "icon" : undefined}
					disabled={isButtonDisabled}
					variant={isCompact ? "transparent" : "secondary"}
					className={cn({
						"my-auto": !isCompact,
						"text-theme-primary-600 hover:text-theme-primary-700": isCompact,
					})}
					onClick={handleSend}
				>
					{t("COMMON.SEND")}
				</Button>
			</div>
			<div data-testid="WalletListItem__more-button" className={cn({ "ml-3": !isCompact })}>
				<Dropdown
					toggleContent={
						<Button
							variant={isCompact ? "transparent" : "secondary"}
							size={isCompact ? "icon" : undefined}
							disabled={isRestoring}
							className={cn({
								"-mr-1.5 text-theme-primary-300 hover:text-theme-primary-600": isCompact,
								"flex-1 bg-theme-primary-600 text-white hover:bg-theme-primary-700": !isCompact,
							})}
						>
							<Icon name="EllipsisVertical" size="lg" />
						</Button>
					}
					onSelect={handleSelectOption}
					options={[primaryOptions, secondaryOptions]}
				/>
			</div>
		</TableCell>
	);
};
