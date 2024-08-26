import { Networks } from "@ardenthq/sdk";
import React, { FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import cn from "classnames";
import {
	ContactListItemOption,
	ContactListItemProperties,
	ContactListItemAddressProperties,
} from "./ContactListItem.contracts";
import { Address } from "@/app/components/Address";
import { Avatar } from "@/app/components/Avatar";
import { Button } from "@/app/components/Button";
import { Clipboard } from "@/app/components/Clipboard";
import { Dropdown } from "@/app/components/Dropdown";
import { Icon } from "@/app/components/Icon";
import { TableCell, TableRow } from "@/app/components/Table";
import { Tooltip } from "@/app/components/Tooltip";
import { TruncateEnd } from "@/app/components/TruncateEnd";
import { useNetworks } from "@/app/hooks";
import {networkDisplayName} from "@/utils/network-utils";
import {Divider} from "@/app/components/Divider";

const ContactListItemAddress: FC<ContactListItemAddressProperties> = ({
	profile,
	index,
	isLast,
	isCompact,
	item,
	address,
	availableNetworks,
	options,
	onAction,
	onSend,
}) => {
	const profileAvailableNetworks = useNetworks({ profile });

	const { t } = useTranslation();

	const renderName = useCallback(() => {
		const name = (
			<span className="font-semibold text-sm leading-[17px]" data-testid="ContactListItem__name">
				<TruncateEnd text={item.name()} maxChars={22} />
			</span>
		);

		if (isCompact) {
			return name;
		}

		return (
			<>
				<Avatar data-testid="ContactListItem__user--avatar" size="lg" noShadow>
					<img src={`data:image/svg+xml;utf8,${item.avatar()}`} title={item.name()} alt={item.name()} />
					<span className="absolute text-sm font-semibold text-theme-background">
						{item.name().slice(0, 2).toUpperCase()}
					</span>
				</Avatar>

				{name}
			</>
		);
	}, [isCompact, item]);

	const borderClasses = () =>
		isLast ? "" : "border-b border-dashed border-theme-secondary-300 dark:border-theme-secondary-800";

	const network = profile
		.availableNetworks()
		.find((network: Networks.Network) => network.coin() === address.coin() && network.id() === address.network());

	let sendButtonTooltip = "";

	const availableNetwork = availableNetworks.find((network) => network.id === address.network());
	const hasBalance = availableNetwork?.hasBalance ?? false;

	if (!availableNetwork) {
		sendButtonTooltip = t("CONTACTS.VALIDATION.NO_WALLETS");
	} else if (!hasBalance) {
		sendButtonTooltip = t("CONTACTS.VALIDATION.NO_BALANCE");
	}

	const sendIsDisabled = useMemo(() => {
		if (!hasBalance) {
			return true;
		}

		return !profileAvailableNetworks.some((network) => network.id() === address.network());
	}, [hasBalance, profileAvailableNetworks]);

	return (
		<TableRow key={`${address.address()}-${index}`} border={isLast} className="relative last:!border-b-4 last:border-solid last:border-theme-secondary-200 last:dark:border-theme-secondary-800">
			<TableCell variant="start" innerClassName="space-x-4 whitespace-nowrap" isCompact={isCompact}>
				{index === 0 && renderName()}
			</TableCell>

			<TableCell className={borderClasses()} isCompact={isCompact}>
				<span className="text-theme-text whitespace-nowrap font-semibold text-sm leading-[17px]">
					{networkDisplayName(network)}
				</span>
			</TableCell>

			<TableCell
				data-testid="ContactListItem__address"
				className={borderClasses()}
				innerClassName="space-x-4"
				isCompact={isCompact}
			>
				<div className="w-0 flex-1">
					<Address address={address.address()} truncateOnTable addressClass="text-sm leading-[17px]" />
				</div>
			</TableCell>

			<TableCell className={borderClasses()} innerClassName="space-x-4 justify-center" isCompact={isCompact}>
				<Clipboard variant="icon" data={address.address()}>
					<div className="text-theme-primary-400 dark:text-theme-secondary-700">
						<Icon name="Copy" />
					</div>
				</Clipboard>
			</TableCell>

			<TableCell variant="end" className={borderClasses()} innerClassName="justify-end" isCompact={isCompact}>
				<div className={cn("flex items-center", { "space-x-2": !isCompact }, { "-mr-3": isCompact })}>
					<Tooltip content={sendButtonTooltip}>
						<div data-testid="ContactListItem__send-button-wrapper">
							<Button
								size={isCompact ? "icon" : undefined}
								variant={isCompact ? "transparent" : "secondary"}
								className={cn({
									"text-theme-primary-600 hover:text-theme-primary-700 text-sm leading-[17px]": isCompact,
								})}
								data-testid="ContactListItem__send-button"
								onClick={() => onSend(address)}
								disabled={sendIsDisabled}
							>
								{t("COMMON.SEND")}
							</Button>
						</div>
					</Tooltip>

					{index === 0 && <Divider type="vertical" className="!m-0 height-[17px] border-theme-secondary-300 dark:border-theme-secondary-800"/>}

					<div className={index === 0 ? "visible" : "invisible"}>
						<Dropdown
							dropdownClass="mx-4 sm:mx-0"
							toggleContent={
								<Button
									size="icon"
									variant={isCompact ? "transparent" : "secondary"}
									className={cn({
										"flex-1": !isCompact,
										"text-theme-primary-300 hover:text-theme-primary-600": isCompact,
									})}
								>
									<Icon name="EllipsisVerticalFilled" size="lg" />
								</Button>
							}
							options={options}
							onSelect={(action: ContactListItemOption) => onAction(action)}
						/>
					</div>
				</div>
			</TableCell>
		</TableRow>
	);
};

export const ContactListItem: FC<ContactListItemProperties> = (properties) => {
	const addresses = properties.item.addresses().values();

	return (
		<>
			{addresses.map((address, index) => (
				<ContactListItemAddress
					key={address.address()}
					{...properties}
					address={address}
					index={index}
					isLast={index === addresses.length - 1}
				/>
			))}
		</>
	);
};
