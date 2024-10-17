import { Networks } from "@ardenthq/sdk";
import React, { FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
	ContactListItemAddressProperties,
	ContactListItemOption,
	ContactListItemProperties,
} from "./ContactListItem.contracts";
import { Address } from "@/app/components/Address";
import { Button } from "@/app/components/Button";
import { Clipboard } from "@/app/components/Clipboard";
import { Dropdown } from "@/app/components/Dropdown";
import { Icon } from "@/app/components/Icon";
import { TableCell, TableRow } from "@/app/components/Table";
import { Tooltip } from "@/app/components/Tooltip";
import { TruncateEnd } from "@/app/components/TruncateEnd";
import { useNetworks } from "@/app/hooks";
import { networkDisplayName } from "@/utils/network-utils";
import { Divider } from "@/app/components/Divider";

const ContactListItemAddress: FC<ContactListItemAddressProperties> = ({
	profile,
	index,
	isLast,
	item,
	address,
	availableNetworks,
	options,
	onAction,
	onSend,
}) => {
	const profileAvailableNetworks = useNetworks({ profile });

	const { t } = useTranslation();

	const renderName = useCallback(
		() => (
			<span className="text-sm font-semibold leading-[17px]" data-testid="ContactListItem__name">
				<TruncateEnd text={item.name()} maxChars={22} />
			</span>
		),
		[item],
	);

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
		<TableRow
			key={`${address.address()}-${index}`}
			border={isLast}
			className="relative last:!border-b-4 last:border-solid last:border-theme-secondary-200 last:dark:border-theme-secondary-800"
		>
			<TableCell variant="start" innerClassName="space-x-4 whitespace-nowrap">
				{index === 0 && renderName()}
			</TableCell>

			<TableCell className={borderClasses()}>
				<span className="whitespace-nowrap text-sm font-semibold leading-[17px] text-theme-text">
					{networkDisplayName(network)}
				</span>
			</TableCell>

			<TableCell data-testid="ContactListItem__address" className={borderClasses()} innerClassName="space-x-4">
				<div className="w-0 flex-1">
					<Address address={address.address()} truncateOnTable addressClass="text-sm leading-[17px]" />
				</div>
			</TableCell>

			<TableCell className={borderClasses()} innerClassName="space-x-4 justify-center">
				<Clipboard variant="icon" data={address.address()}>
					<div className="text-theme-primary-400 dark:text-theme-secondary-600">
						<Icon name="Copy" />
					</div>
				</Clipboard>
			</TableCell>

			<TableCell variant="end" className={borderClasses()} innerClassName="justify-end">
				<div className="-mr-3 flex items-center">
					<Tooltip content={sendButtonTooltip}>
						<div data-testid="ContactListItem__send-button-wrapper">
							<Button
								size="icon"
								variant="transparent"
								className="text-sm leading-[17px] text-theme-primary-600 hover:text-theme-primary-700"
								data-testid="ContactListItem__send-button"
								onClick={() => onSend(address)}
								disabled={sendIsDisabled}
							>
								{t("COMMON.SEND")}
							</Button>
						</div>
					</Tooltip>

					{index === 0 && (
						<Divider
							type="vertical"
							className="height-[17px] !m-0 border-theme-secondary-300 dark:border-theme-secondary-800"
						/>
					)}

					<div className={index === 0 ? "visible" : "invisible"}>
						<Dropdown
							position="bottom-end"
							dropdownClass="mx-4 sm:mx-0"
							toggleContent={
								<Button
									size="icon"
									variant="transparent"
									className="text-theme-primary-300 hover:text-theme-primary-600"
								>
									<Icon
										name="EllipsisVerticalFilled"
										size="lg"
										className="text-theme-secondary-700"
									/>
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
