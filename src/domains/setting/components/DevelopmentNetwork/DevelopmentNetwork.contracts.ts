interface DevelopmentNetworkProperties {
	isOpen: boolean;
	onClose: () => void;
	onCancel: () => void;
	onContinue: () => void;
}

export type { DevelopmentNetworkProperties };
