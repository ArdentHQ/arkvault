import React from "react";
import cn from "classnames";
import { Avatar, EthereumAvatar } from "@/app/components/Avatar";
import { Address } from "@/app/components/Address";

export const MigrationAddress = ({
	address,
	label,
	className,
	isEthereum,
}: {
	isEthereum?: boolean;
	label?: string;
	address: string;
	className?: string;
}) => (
	<MigrationDetail label={label} className={className}>
		<div className="flex items-center space-x-2">
			{isEthereum ? <EthereumAvatar size="xs" address={address} /> : <Avatar address={address} size="xs" />}
			<Address address={address} />
		</div>
	</MigrationDetail>
);

export const MigrationDetail = ({
	label,
	className = "py-6 px-5",
	children,
}: {
	label?: string;
	className?: string;
	children: React.ReactNode;
}) => (
	<div className={cn("flex flex-col space-y-1", className)}>
		<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">{label}</span>

		{children}
	</div>
);
