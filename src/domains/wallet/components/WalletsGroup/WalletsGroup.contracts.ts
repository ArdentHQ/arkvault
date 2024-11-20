import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";

export interface MaxWidthReferences {
	balance: React.MutableRefObject<number>;
	currency: React.MutableRefObject<number>;
}

export interface WalletsGroupProperties {
	network: Networks.Network;
	wallets: Contracts.IReadWriteWallet[];
	maxWidthReferences: MaxWidthReferences;
	profileId: string;
}

export interface WalletsGroupHeaderProperties {
	network: Networks.Network;
	wallets: Contracts.IReadWriteWallet[];
	isExpanded: boolean;
	maxWidthReferences?: MaxWidthReferences;
	onClick?: (event: React.MouseEvent) => void;
	className?: string;
}

export interface WalletsGroupHeaderSkeletonProperties {
	isPlaceholder?: boolean;
	isSinglePageMode?: boolean;
}

export interface LabelledTextProperties {
	label: string;
	className?: string;
	children: ((textClassName: string) => JSX.Element) | JSX.Element;
	maxWidthReference?: React.MutableRefObject<number>;
}

export interface WalletsGroupNetworkIconProperties {
	network: Networks.Network;
	isGroupExpanded: boolean;
}

export interface WalletsGroupNetworkNameProperties {
	network: Networks.Network;
}

export interface WalletsGroupNetworkTotalProperties {
	network: Networks.Network;
	wallets: Contracts.IReadWriteWallet[];
	maxWidthReferences?: MaxWidthReferences;
	noBorder?: boolean;
}

export interface WalletsGroupSkeletonProperties {
	width: number;
	className?: string;
	innerClassName?: string;
}
