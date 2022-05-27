import { Signatories } from "@payvo/sdk";
import { Contracts, DTO, Environment } from "@payvo/sdk-profiles";
import { TFunction } from "i18next";
import { useForm } from "react-hook-form";

export type ExtendedSignedTransactionData = DTO.ExtendedSignedTransactionData & {
	generatedAddress?: string;
};

export interface SendRegistrationDetailsOptions {
	transaction: ExtendedSignedTransactionData;
	translations: TFunction;
	wallet: Contracts.IReadWriteWallet;
}

export interface SendRegistrationComponent {
	activeTab: number;
	wallet: Contracts.IReadWriteWallet;
	profile: Contracts.IProfile;
}

export interface SendRegistrationSignOptions {
	env: Environment;
	form: ReturnType<typeof useForm>;
	profile: Contracts.IProfile;
	signatory: Signatories.Signatory;
}

export interface FormStepProperties {
	wallet: Contracts.IReadWriteWallet;
	profile: Contracts.IProfile;
}

export interface SendRegistrationForm {
	transactionDetails: ({ transaction, translations, wallet }: SendRegistrationDetailsOptions) => JSX.Element;

	tabSteps: number;

	formFields: string[];

	component: (properties: SendRegistrationComponent) => JSX.Element;
}
