export type SelectCategoryProperties = {
	children: React.ReactNode;
	type?: "radio" | "checkbox";
	name?: string | number;
	value?: string | number;
	checked?: boolean;
	defaultChecked?: boolean;
	disabled?: boolean;
} & React.HTMLProps<any>;
