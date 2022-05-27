interface PasswordRemovalProperties {
	onCancel: () => void;
	onConfirm: (currentPassword: string) => void;
}

interface PasswordRemovalFormState {
	currentPassword: string;
}

export type { PasswordRemovalProperties, PasswordRemovalFormState };
