import { JSX } from "react";

export type FilterOption = "all" | "current";

export interface FilterProperties extends JSX.IntrinsicAttributes {
	onChange?: (selected: FilterOption) => void;
	selectedOption?: FilterOption;
	totalCurrentVotes: number;
}
