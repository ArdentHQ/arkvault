import { AccentColorType } from "@/app/hooks";
import { ValidationState } from "@/app/hooks/use-password-validation";
import { Theme } from "@/types";

interface ProfileFormState {
	avatarImage: string;
	confirmPassword?: string;
	disclaimer: boolean;
	name: string;
	password?: string;
	viewingMode: Theme;
	accentColor?: AccentColorType;
	currency: string;
	validation?: ValidationState;
}

export type { ProfileFormState };
