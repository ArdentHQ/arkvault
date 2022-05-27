export interface HeaderSearchInputProperties {
	placeholder?: string;
	onSearch?: (query: string) => void;
	onReset?: () => void;
	maxLength?: number;
	debounceTimeout?: number;
	defaultQuery?: string;
	resetFields?: boolean;
}
