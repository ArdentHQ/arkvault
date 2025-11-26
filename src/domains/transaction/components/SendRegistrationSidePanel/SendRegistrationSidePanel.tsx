import { Contracts, DTO } from "@/app/lib/profiles";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { useTranslation } from "react-i18next";
import { useUnconfirmedTransactions } from "@/domains/transaction/hooks/use-unconfirmed-transactions";
import { Form } from "@/app/components/Form";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { useEnvironmentContext, useLedgerContext } from "@/app/contexts";
import { useActiveProfile, useLedgerModelStatus, useValidation } from "@/app/hooks";
import { useKeydown } from "@/app/hooks/use-keydown";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import {
	ValidatorRegistrationForm,
	signValidatorRegistration,
} from "@/domains/transaction/components/ValidatorRegistrationForm";
import { ErrorStep } from "@/domains/transaction/components/ErrorStep";
import { TransactionSuccessful } from "@/domains/transaction/components/TransactionSuccessful";
import { assertWallet } from "@/utils/assertions";
import {
	signUsernameRegistration,
	UsernameRegistrationForm,
} from "@/domains/transaction/components/UsernameRegistrationForm";
import { useToggleFeeFields } from "@/domains/transaction/hooks/useToggleFeeFields";
import { useValidatorRegistrationLockedFee } from "@/domains/transaction/components/ValidatorRegistrationForm/hooks/useValidatorRegistrationLockedFee";
import { SidePanel, SidePanelButtons } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";
import { ThemeIcon } from "@/app/components/Icon";
import { useConfirmedTransaction } from "@/domains/transaction/components/TransactionSuccessful/hooks/useConfirmedTransaction";
import cn from "classnames";
import { useSelectsTransactionSender } from "@/domains/transaction/hooks/use-selects-transaction-sender";
import { getAuthenticationStepSubtitle } from "@/domains/transaction/utils";
import { Image } from "@/app/components/Image";
import {
	ContractDeploymentForm, signContractDeployment,
} from "@/domains/transaction/components/ContractDeploymentForm";

export const FORM_STEP = 1;
export const REVIEW_STEP = 2;
export const ERROR_STEP = 10;

export const SendRegistrationSidePanel = ({
	open,
	onOpenChange,
	registrationType,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	registrationType?: "validatorRegistration" | "usernameRegistration" | "contractDeployment";
}) => {
	const { t } = useTranslation();

	const [activeTab, setActiveTab] = useState(FORM_STEP);
	const [transaction, setTransaction] = useState(undefined as unknown as DTO.ExtendedSignedTransactionData);
	const registrationForm = {
		contractDeployment: ContractDeploymentForm,
		usernameRegistration: UsernameRegistrationForm,
		validatorRegistration: ValidatorRegistrationForm,
	}[registrationType as string];

	const [errorMessage, setErrorMessage] = useState<string | undefined>();

	const { env } = useEnvironmentContext();
	const activeProfile = useActiveProfile();
	const { common, validatorRegistration } = useValidation();
	const { addUnconfirmedTransactionFromSigned } = useUnconfirmedTransactions();

	const { hasDeviceAvailable, isConnected, connect, ledgerDevice } = useLedgerContext();

	const { isLedgerModelSupported } = useLedgerModelStatus({
		connectedModel: ledgerDevice?.id,
		supportedModels: [Contracts.WalletLedgerModel.NanoX, Contracts.WalletLedgerModel.NanoSP],
	});

	const form = useForm({ mode: "onChange" });

	const { formState, register, setValue, watch, getValues, trigger, unregister } = form;
	const { isDirty, isSubmitting, isValid, dirtyFields } = formState;

	const { fees, isLoading, senderAddress } = watch();

	const stepCount = registrationForm ? registrationForm.tabSteps + 2 : 1;
	const authenticationStep = stepCount - 1;
	const summaryStep = stepCount;
	const isAuthenticationStep = activeTab === authenticationStep;

	const [mounted, setMounted] = useState(false);
	const { activeWallet } = useSelectsTransactionSender({
		active: mounted,
		onWalletChange: (wallet) => {
			setValue("senderAddress", wallet?.address(), { shouldDirty: true, shouldValidate: true });

			setValue("network", wallet?.network(), { shouldDirty: true, shouldValidate: true });
		},
	});

	const { validatorRegistrationFee } = useValidatorRegistrationLockedFee({
		profile: activeProfile,
		wallet: activeWallet,
	});

	useEffect(() => {
		register("fees");

		register("inputFeeSettings");

		register("network", { required: true });
		register("senderAddress", { required: true });

		register("suppressWarning");
		register("isLoading");

		if (registrationType === "validatorRegistration") {
			register("lockedFee", validatorRegistration.lockedFee(activeWallet, getValues));
		}
	}, [register, activeWallet, common, fees, validatorRegistrationFee, validatorRegistration, registrationType]);

	useEffect(() => {
		trigger("lockedFee");
	}, [senderAddress]);

	useToggleFeeFields({
		activeTab,
		form,
		wallet: activeWallet,
	});

	useEffect(() => {
		if (!registrationType) {
			return;
		}

		setValue("lockedFee", validatorRegistrationFee, { shouldDirty: true, shouldValidate: true });
	}, [validatorRegistrationFee, registrationType]);

	// Reset ledger authentication steps after reconnecting supported ledger
	useEffect(() => {
		if (isAuthenticationStep && activeWallet?.isLedger() && isLedgerModelSupported) {
			handleSubmit();
		}
	}, [ledgerDevice]);

	useKeydown("Enter", () => {
		const isButton = (document.activeElement as any)?.type === "button";

		if (isButton || isNextDisabled || activeTab >= authenticationStep) {
			return;
		}

		return handleNext();
	});

	const handleSubmit = async () => {
		assertWallet(activeWallet);

		try {
			const { mnemonic, secondMnemonic, encryptionPassword, secret, secondSecret } = getValues();

			if (activeWallet.isLedger()) {
				await connect(activeProfile);
			}

			const signatory = await activeWallet.signatoryFactory().make({
				encryptionPassword,
				mnemonic,
				secondMnemonic,
				secondSecret,
				secret,
			});

			const method = {
				contractDeployment: signContractDeployment,
				usernameRegistration: signUsernameRegistration,
				validatorRegistration: signValidatorRegistration,
			}[registrationType as string];

			const transaction = await method({
				env,
				form,
				profile: activeProfile,
				signatory,
			});

			addUnconfirmedTransactionFromSigned(transaction);
			setTransaction(transaction);
			handleNext();

			// 0x608060405234801561001057600080fd5b506040518060400160405280600681526020017f4441524b323000000000000000000000000000000000000000000000000000008152506040518060400160405280600681526020017f4441524b32300000000000000000000000000000000000000000000000000000815250816003908161008c91906105bc565b50806004908161009c91906105bc565b5050506100ba336a52b7d2dcc80cd2e40000006100bf60201b60201c565b6107ae565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036101315760006040517fec442f0500000000000000000000000000000000000000000000000000000000815260040161012891906106cf565b60405180910390fd5b6101436000838361014760201b60201c565b5050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff160361019957806002600082825461018d9190610719565b9250508190555061026c565b60008060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905081811015610225578381836040517fe450d38c00000000000000000000000000000000000000000000000000000000815260040161021c9392919061075c565b60405180910390fd5b8181036000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550505b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036102b55780600260008282540392505081905550610302565b806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055505b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8360405161035f9190610793565b60405180910390a3505050565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806103ed57607f821691505b602082108103610400576103ff6103a6565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b6000600883026104687fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8261042b565b610472868361042b565b95508019841693508086168417925050509392505050565b6000819050919050565b6000819050919050565b60006104b96104b46104af8461048a565b610494565b61048a565b9050919050565b6000819050919050565b6104d38361049e565b6104e76104df826104c0565b848454610438565b825550505050565b600090565b6104fc6104ef565b6105078184846104ca565b505050565b5b8181101561052b576105206000826104f4565b60018101905061050d565b5050565b601f8211156105705761054181610406565b61054a8461041b565b81016020851015610559578190505b61056d6105658561041b565b83018261050c565b50505b505050565b600082821c905092915050565b600061059360001984600802610575565b1980831691505092915050565b60006105ac8383610582565b9150826002028217905092915050565b6105c58261036c565b67ffffffffffffffff8111156105de576105dd610377565b5b6105e882546103d5565b6105f382828561052f565b600060209050601f8311600181146106265760008415610614578287015190505b61061e85826105a0565b865550610686565b601f19841661063486610406565b60005b8281101561065c57848901518255600182019150602085019450602081019050610637565b868310156106795784890151610675601f891682610582565b8355505b6001600288020188555050505b505050505050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006106b98261068e565b9050919050565b6106c9816106ae565b82525050565b60006020820190506106e460008301846106c0565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006107248261048a565b915061072f8361048a565b9250828201905080821115610747576107466106ea565b5b92915050565b6107568161048a565b82525050565b600060608201905061077160008301866106c0565b61077e602083018561074d565b61078b604083018461074d565b949350505050565b60006020820190506107a8600083018461074d565b92915050565b611156806107bd6000396000f3fe608060405234801561001057600080fd5b506004361061009e5760003560e01c806370a082311161006657806370a082311461015d57806388d695b21461018d57806395d89b41146101bd578063a9059cbb146101db578063dd62ed3e1461020b5761009e565b806306fdde03146100a3578063095ea7b3146100c157806318160ddd146100f157806323b872dd1461010f578063313ce5671461013f575b600080fd5b6100ab61023b565b6040516100b89190610ba8565b60405180910390f35b6100db60048036038101906100d69190610c68565b6102cd565b6040516100e89190610cc3565b60405180910390f35b6100f96102f0565b6040516101069190610ced565b60405180910390f35b61012960048036038101906101249190610d08565b6102fa565b6040516101369190610cc3565b60405180910390f35b610147610329565b6040516101549190610d77565b60405180910390f35b61017760048036038101906101729190610d92565b610332565b6040516101849190610ced565b60405180910390f35b6101a760048036038101906101a29190610e7a565b61037a565b6040516101b49190610cc3565b60405180910390f35b6101c561043e565b6040516101d29190610ba8565b60405180910390f35b6101f560048036038101906101f09190610c68565b6104d0565b6040516102029190610cc3565b60405180910390f35b61022560048036038101906102209190610efb565b6104f3565b6040516102329190610ced565b60405180910390f35b60606003805461024a90610f6a565b80601f016020809104026020016040519081016040528092919081815260200182805461027690610f6a565b80156102c35780601f10610298576101008083540402835291602001916102c3565b820191906000526020600020905b8154815290600101906020018083116102a657829003601f168201915b5050505050905090565b6000806102d861057a565b90506102e5818585610582565b600191505092915050565b6000600254905090565b60008061030561057a565b9050610312858285610594565b61031d858585610628565b60019150509392505050565b60006012905090565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b60008282905085859050146103c4576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103bb9061100d565b60405180910390fd5b60005b85859050811015610431576104246103dd61057a565b8787848181106103f0576103ef61102d565b5b90506020020160208101906104059190610d92565b8686858181106104185761041761102d565b5b90506020020135610628565b80806001019150506103c7565b5060019050949350505050565b60606004805461044d90610f6a565b80601f016020809104026020016040519081016040528092919081815260200182805461047990610f6a565b80156104c65780601f1061049b576101008083540402835291602001916104c6565b820191906000526020600020905b8154815290600101906020018083116104a957829003601f168201915b5050505050905090565b6000806104db61057a565b90506104e8818585610628565b600191505092915050565b6000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b600033905090565b61058f838383600161071c565b505050565b60006105a084846104f3565b90507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff81146106225781811015610612578281836040517ffb8f41b20000000000000000000000000000000000000000000000000000000081526004016106099392919061106b565b60405180910390fd5b6106218484848403600061071c565b5b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff160361069a5760006040517f96c6fd1e00000000000000000000000000000000000000000000000000000000815260040161069191906110a2565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff160361070c5760006040517fec442f0500000000000000000000000000000000000000000000000000000000815260040161070391906110a2565b60405180910390fd5b6107178383836108f3565b505050565b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff160361078e5760006040517fe602df0500000000000000000000000000000000000000000000000000000000815260040161078591906110a2565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16036108005760006040517f94280d620000000000000000000000000000000000000000000000000000000081526004016107f791906110a2565b60405180910390fd5b81600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555080156108ed578273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040516108e49190610ced565b60405180910390a35b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff160361094557806002600082825461093991906110ec565b92505081905550610a18565b60008060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050818110156109d1578381836040517fe450d38c0000000000000000000000000000000000000000000000000000000081526004016109c89392919061106b565b60405180910390fd5b8181036000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550505b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610a615780600260008282540392505081905550610aae565b806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055505b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051610b0b9190610ced565b60405180910390a3505050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610b52578082015181840152602081019050610b37565b60008484015250505050565b6000601f19601f8301169050919050565b6000610b7a82610b18565b610b848185610b23565b9350610b94818560208601610b34565b610b9d81610b5e565b840191505092915050565b60006020820190508181036000830152610bc28184610b6f565b905092915050565b600080fd5b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610bff82610bd4565b9050919050565b610c0f81610bf4565b8114610c1a57600080fd5b50565b600081359050610c2c81610c06565b92915050565b6000819050919050565b610c4581610c32565b8114610c5057600080fd5b50565b600081359050610c6281610c3c565b92915050565b60008060408385031215610c7f57610c7e610bca565b5b6000610c8d85828601610c1d565b9250506020610c9e85828601610c53565b9150509250929050565b60008115159050919050565b610cbd81610ca8565b82525050565b6000602082019050610cd86000830184610cb4565b92915050565b610ce781610c32565b82525050565b6000602082019050610d026000830184610cde565b92915050565b600080600060608486031215610d2157610d20610bca565b5b6000610d2f86828701610c1d565b9350506020610d4086828701610c1d565b9250506040610d5186828701610c53565b9150509250925092565b600060ff82169050919050565b610d7181610d5b565b82525050565b6000602082019050610d8c6000830184610d68565b92915050565b600060208284031215610da857610da7610bca565b5b6000610db684828501610c1d565b91505092915050565b600080fd5b600080fd5b600080fd5b60008083601f840112610de457610de3610dbf565b5b8235905067ffffffffffffffff811115610e0157610e00610dc4565b5b602083019150836020820283011115610e1d57610e1c610dc9565b5b9250929050565b60008083601f840112610e3a57610e39610dbf565b5b8235905067ffffffffffffffff811115610e5757610e56610dc4565b5b602083019150836020820283011115610e7357610e72610dc9565b5b9250929050565b60008060008060408587031215610e9457610e93610bca565b5b600085013567ffffffffffffffff811115610eb257610eb1610bcf565b5b610ebe87828801610dce565b9450945050602085013567ffffffffffffffff811115610ee157610ee0610bcf565b5b610eed87828801610e24565b925092505092959194509250565b60008060408385031215610f1257610f11610bca565b5b6000610f2085828601610c1d565b9250506020610f3185828601610c1d565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680610f8257607f821691505b602082108103610f9557610f94610f3b565b5b50919050565b7f726563697069656e747320616e6420616d6f756e7473206c656e677468206d6960008201527f736d617463680000000000000000000000000000000000000000000000000000602082015250565b6000610ff7602683610b23565b915061100282610f9b565b604082019050919050565b6000602082019050818103600083015261102681610fea565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b61106581610bf4565b82525050565b6000606082019050611080600083018661105c565b61108d6020830185610cde565b61109a6040830184610cde565b949350505050565b60006020820190506110b7600083018461105c565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006110f782610c32565b915061110283610c32565b925082820190508082111561111a576111196110bd565b5b9291505056fea2646970667358221220fdbfd2ff5d7f60018cd1ba9f99f9038e758419b539d4a76b8c9148f3b4c10b6b64736f6c634300081a0033
		} catch (error) {
			setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));
			setActiveTab(ERROR_STEP);
		}
	};

	const handleBack = () => {
		if (activeTab === FORM_STEP) {
			onOpenChange(false);
			return;
		}

		setActiveTab(activeTab - 1);
	};

	const handleNext = () => {
		const nextStep = activeTab + 1;
		const isNextStepAuthentication = nextStep === authenticationStep;

		// Skip authentication step
		if (isNextStepAuthentication && activeWallet?.isLedger() && isLedgerModelSupported) {
			handleSubmit();
		}

		setActiveTab(nextStep);
	};

	const { isConfirmed } = useConfirmedTransaction({
		transactionId: transaction?.hash(),
		wallet: activeWallet,
	});

	const isNextDisabled = isDirty ? !isValid || !!isLoading : true;

	const handleOpenChange = useCallback(
		(open: boolean) => {
			onOpenChange(open);
		},
		[onOpenChange],
	);

	const onMountChange = useCallback((mounted: boolean) => {
		setMounted(mounted);

		if (!mounted) {
			setActiveTab(FORM_STEP);
			setErrorMessage(undefined);

			const fieldKeyMap = {
				contractDeployment: "bytecode",
				usernameRegistration: "username",
				validatorRegistration: "validatorPublicKey",
			};

			unregister(fieldKeyMap[registrationType as string]);
		}
	}, []);

	const hasSynced = activeWallet && activeWallet.hasSyncedWithNetwork();

	const getTitle = () => {
		if (!registrationType) {
			return "";
		}

		if (activeTab === ERROR_STEP) {
			return t("TRANSACTION.ERROR.TITLE");
		}

		if (activeTab === summaryStep) {
			return isConfirmed ? t("TRANSACTION.SUCCESS.CREATED") : t("TRANSACTION.PENDING.TITLE");
		}

		if (activeTab === authenticationStep) {
			return t("TRANSACTION.AUTHENTICATION_STEP.TITLE");
		}

		if (activeTab === REVIEW_STEP) {
			return t("TRANSACTION.REVIEW_STEP.TITLE");
		}

		const titleMap = {
			contractDeployment: () => t("TRANSACTION.CONTRACT_DEPLOYMENT.FORM_STEP.TITLE"),
			usernameRegistration: () => t("TRANSACTION.PAGE_USERNAME_REGISTRATION.FORM_STEP.TITLE"),
			validatorRegistration: () =>
				hasSynced && activeWallet.isValidator()
					? t("TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.TITLE_UPDATE")
					: t("TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.TITLE"),
		};

		return titleMap[registrationType as string]();
	};

	const getSubtitle = () => {
		if (activeTab === ERROR_STEP) {
			return t("TRANSACTION.ERROR.DESCRIPTION");
		}

		if (activeTab === summaryStep) {
			return;
		}

		if (activeTab === authenticationStep) {
			return getAuthenticationStepSubtitle({ t, wallet: activeWallet });
		}

		if (activeTab === REVIEW_STEP) {
			return t("TRANSACTION.REVIEW_STEP.DESCRIPTION");
		}

		const subtitleMap = {
			contractDeployment: () => t("TRANSACTION.CONTRACT_DEPLOYMENT.FORM_STEP.DESCRIPTION"),
			usernameRegistration: () => t("TRANSACTION.PAGE_USERNAME_REGISTRATION.FORM_STEP.DESCRIPTION"),
			validatorRegistration: () => {
				if (hasSynced && activeWallet.isLegacyValidator()) {
					return t("TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.DESCRIPTION_LEGACY");
				}
				if (hasSynced && activeWallet.isValidator()) {
					return t("TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.DESCRIPTION_UPDATE");
				}
				return t("TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.DESCRIPTION");
			},
		};

		return subtitleMap[registrationType as string]();
	};

	const getTitleIcon = () => {
		if (activeTab === ERROR_STEP) {
			return <Image name="ErrorHeaderIcon" domain="transaction" className="block h-[20px] w-[20px]" />;
		}

		if (activeTab === summaryStep) {
			return (
				<ThemeIcon
					lightIcon={isConfirmed ? "CheckmarkDoubleCircle" : "PendingTransaction"}
					darkIcon={isConfirmed ? "CheckmarkDoubleCircle" : "PendingTransaction"}
					dimIcon={isConfirmed ? "CheckmarkDoubleCircle" : "PendingTransaction"}
					dimensions={[24, 24]}
					className={cn({
						"text-theme-primary-600": !isConfirmed,
						"text-theme-success-600": isConfirmed,
					})}
				/>
			);
		}

		if (activeTab === REVIEW_STEP) {
			return (
				<ThemeIcon
					lightIcon="DocumentView"
					darkIcon="DocumentView"
					dimIcon="DocumentView"
					dimensions={[24, 24]}
				/>
			);
		}

		if (activeTab === authenticationStep) {
			if (activeWallet?.isLedger()) {
				return (
					<ThemeIcon
						lightIcon="LedgerLight"
						darkIcon="LedgerDark"
						dimIcon="LedgerDim"
						dimensions={[24, 24]}
					/>
				);
			}

			return <ThemeIcon lightIcon="Mnemonic" darkIcon="Mnemonic" dimIcon="Mnemonic" dimensions={[24, 24]} />;
		}

		if (registrationType === "contractDeployment") {
			return (
				<ThemeIcon
					dimensions={[24, 24]}
					lightIcon="SendContractDeploymentLight"
					darkIcon="SendContractDeploymentDark"
					dimIcon="SendContractDeploymentDim"
				/>
			);
		}

		return (
			<ThemeIcon
				dimensions={[24, 24]}
				lightIcon="SendTransactionLight"
				darkIcon="SendTransactionDark"
				dimIcon="SendTransactionDim"
			/>
		);
	};

	const preventAccidentalClosing = useMemo(
		() => dirtyFields.username || dirtyFields.validatorPublicKey || activeTab !== FORM_STEP,
		[dirtyFields.username, dirtyFields.validatorPublicKey, activeTab],
	);

	const isLastStep = activeTab === summaryStep;

	return (
		<SidePanel
			minimizeable={!isLastStep}
			open={open}
			onOpenChange={onOpenChange}
			title={getTitle()}
			subtitle={getSubtitle()}
			titleIcon={getTitleIcon()}
			dataTestId="SendRegistrationSidePanel"
			hasSteps
			totalSteps={stepCount}
			activeStep={activeTab}
			onBack={handleBack}
			isLastStep={isLastStep}
			disableOutsidePress={preventAccidentalClosing}
			disableEscapeKey={isSubmitting || preventAccidentalClosing}
			shakeWhenClosing={preventAccidentalClosing}
			onMountChange={onMountChange}
			footer={
				<SidePanelButtons>
					{activeTab < stepCount && (
						<Button
							data-testid="SendRegistration__back-button"
							variant="secondary"
							onClick={handleBack}
							disabled={isSubmitting}
						>
							{t("COMMON.BACK")}
						</Button>
					)}

					{activeTab < stepCount - 1 && (
						<Button
							data-testid="SendRegistration__continue-button"
							onClick={handleNext}
							disabled={isNextDisabled || isSubmitting}
						>
							{t("COMMON.CONTINUE")}
						</Button>
					)}

					{activeTab === stepCount - 1 && (
						<Button
							data-testid="SendRegistration__send-button"
							onClick={() => void handleSubmit()}
							disabled={isNextDisabled || isSubmitting || !isValid}
							isLoading={isSubmitting}
						>
							{t("COMMON.SEND")}
						</Button>
					)}

					{activeTab === stepCount && (
						<Button data-testid="SendRegistration__close-button" onClick={() => handleOpenChange(false)}>
							{t("COMMON.CLOSE")}
						</Button>
					)}
				</SidePanelButtons>
			}
		>
			{open && (
				<Form data-testid="Registration__form" context={form} onSubmit={handleSubmit}>
					<Tabs activeId={activeTab}>
						<TabPanel tabId={ERROR_STEP}>
							<ErrorStep
								onClose={() => {
									onOpenChange(false);
								}}
								isBackDisabled={isSubmitting}
								onBack={() => {
									setActiveTab(FORM_STEP);
								}}
								errorMessage={errorMessage}
								hideHeader
							/>
						</TabPanel>

						{registrationForm && (
							<>
								{open && (
									<registrationForm.component
										activeTab={activeTab}
										wallet={activeWallet}
										profile={activeProfile}
										hideHeader
									/>
								)}

								<TabPanel tabId={authenticationStep}>
									<AuthenticationStep
										wallet={activeWallet!}
										ledgerIsAwaitingDevice={!hasDeviceAvailable}
										ledgerIsAwaitingApp={!isConnected}
										ledgerSupportedModels={[
											Contracts.WalletLedgerModel.NanoX,
											Contracts.WalletLedgerModel.NanoSP,
										]}
										ledgerConnectedModel={ledgerDevice?.id}
										noHeading
									/>
								</TabPanel>

								<TabPanel tabId={summaryStep}>
									<TransactionSuccessful
										transaction={transaction}
										senderWallet={activeWallet!}
										noHeading
									/>
								</TabPanel>
							</>
						)}
					</Tabs>
				</Form>
			)}
		</SidePanel>
	);
};
