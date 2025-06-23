import React, { JSX } from "react";
export interface AccordionHeaderProperties extends JSX.IntrinsicAttributes {
	isExpanded: boolean;
	children: React.ReactNode;
	onClick?: (event: React.MouseEvent) => void;
	className?: string;
}
export interface AccordionHeaderSkeletonWrapperProperties extends JSX.IntrinsicAttributes {
	children: React.ReactNode;
}
export interface AccordionContentProperties extends JSX.IntrinsicAttributes {
	children: React.ReactNode;
	className?: string;
}
