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
import { Divider } from "@/app/components/Divider";

const ContactListItemAddress: FC<ContactListItemAddressProperties> = ({
	index,
	isLast,
	item,
	address,
	hasBalance,
	options,
	onAction,
	onSend,
}) => {
	const { t } = useTranslation();

	const renderName = useCallback(
		() => (
			<span className="text-sm leading-[17px] font-semibold" data-testid="ContactListItem__name">
				<TruncateEnd text={item.name()} maxChars={22} />
			</span>
		),
		[item],
	);

	const borderClasses = () =>
		isLast ? "" : "border-b border-dashed border-theme-secondary-300 dark:border-theme-secondary-800";

	let sendButtonTooltip = "";

	if (!hasBalance) {
		sendButtonTooltip = t("CONTACTS.VALIDATION.NO_BALANCE");
	}

	const sendIsDisabled = useMemo(() => {
		if (!hasBalance) {
			return true;
		}

		return false;
	}, [hasBalance]);

	return (
		<TableRow
			key={`${address.address()}-${index}`}
			border={isLast}
			className="last:border-theme-secondary-200 dark:last:border-theme-secondary-800 relative last:border-b-4! last:border-solid"
			data-testid="ContactListItem"
		>
			<TableCell variant="start" innerClassName="space-x-4 whitespace-nowrap">
				{index === 0 && renderName()}
			</TableCell>

			<TableCell data-testid="ContactListItem__address" className={borderClasses()} innerClassName="space-x-4">
				<div className="w-0 flex-1">
					<Address address={address.address()} truncateOnTable addressClass="text-sm leading-[17px]" />
				</div>
			</TableCell>

			<TableCell className={borderClasses()} innerClassName="space-x-4 justify-center">
				<Clipboard variant="icon" data={address.address()}>
					<div className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 dim-hover:text-theme-dim-50">
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
								className="text-theme-primary-600 dark:hover:text-theme-primary-500 hover:text-theme-primary-700 dim:text-theme-dim-navy-600 dim-hover:text-theme-dim-navy-700 text-sm hover:underline"
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
							className="height-[17px] border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-theme-dim-700 m-0!"
						/>
					)}

					<div className={index === 0 ? "visible" : "invisible"}>
						<Dropdown
							placement="bottom-end"
							toggleContent={
								<Button
									size="icon"
									variant="transparent"
									className="dark:hover:bg-theme-secondary-700 hover:bg-theme-navy-200 dim-hover:bg-theme-dim-800 mr-3 p-1"
								>
									<Icon
										name="EllipsisVerticalFilled"
										size="md"
										className="text-theme-secondary-700 dark:text-theme-secondary-600 dark:group-hover:text-theme-secondary-200 group-hover:text-theme-navy-700 dim:text-theme-dim-200 dim-hover:text-theme-dim-50 transition-colors duration-200"
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
