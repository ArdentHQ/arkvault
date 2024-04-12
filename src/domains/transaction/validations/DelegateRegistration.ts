import { Networks } from "@ardenthq/sdk";
import { selectDelegateValidatorTranslation } from "@/domains/wallet/utils/selectDelegateValidatorTranslation";
import { validatePattern } from "@/utils/validations";

export const delegateRegistration = (t: any, currentNetwork?: Networks.Network) => ({
	username: (usernames: string[]) => {
		if (currentNetwork === undefined) {
			throw new Error("You need to provide a network to the `useValidation` hook to use the delegateRegistration.username validation.");
		}
	
		return {
			maxLength: {
				message: t("COMMON.VALIDATION.MAX_LENGTH", {
					field: selectDelegateValidatorTranslation({
						delegateStr: t("COMMON.VALIDATOR_NAME"),
						network: currentNetwork,
						validatorStr: t("COMMON.DELEGATE_NAME"),
					}),
					maxLength: 20,
				}),
				value: 20,
			},
			required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
				field: selectDelegateValidatorTranslation({
					delegateStr: t("COMMON.VALIDATOR_NAME"),
					network: currentNetwork,
					validatorStr: t("COMMON.DELEGATE_NAME"),
				}),
			}),
			validate: {
				pattern: (value: string) => validatePattern(t, value, /[\d!$&.@_a-z]+/),
				unique: (value: string) =>
					!usernames.includes(value) || t("COMMON.VALIDATION.EXISTS", { field: t("COMMON.DELEGATE_NAME") }),
			},
		}
	},
});
