import { Contracts } from "@ardenthq/sdk-profiles";
import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { uniq } from "@ardenthq/sdk-helpers";

interface Properties extends JSX.IntrinsicAttributes {
	wallets?: Contracts.IReadWriteWallet[];
	selectedTransactionTypes: string[];
	onSelect?: (selectedTypes: string[]) => void;
}

export const useTransactionTypeFilters = ({ wallets, selectedTransactionTypes, onSelect }: Properties) => {
	const { types } = useTransactionTypes({ wallets });
	const allTypes = [...types.core, ...types.magistrate];
	const otherTypes = allTypes.filter(type => !["transfer", "multiPayment", "vote"].includes(type));

	const isAllSelected = [allTypes.every((type) => selectedTransactionTypes.includes(type))].some(Boolean);
	const isOtherSelected = [otherTypes.some((type) => selectedTransactionTypes.includes(type))].some(Boolean);

	const onToggleAll = (isChecked: boolean) => {
		onSelect?.(isChecked ? allTypes : []);
	};

	const onToggleOther = (isChecked: boolean) => {
		const types = isChecked
			? uniq([...selectedTransactionTypes, ...otherTypes])
			: selectedTransactionTypes.filter((type) => !otherTypes.includes(type));
		onSelect?.(types);
	};

	const onToggleType = (value: string, isChecked: boolean) => {
		const types = isChecked
			? [...selectedTransactionTypes, value]
			: selectedTransactionTypes.filter((type) => type !== value);
		onSelect?.(types);
	};

	const isTypeSelected = (type: string) => selectedTransactionTypes.includes(type);

	console.log({
		allTypes,
		isAllSelected,
		isOtherSelected,
		isTypeSelected,
		otherTypes,
		types,
	})

	return {
		allTypes,
		isAllSelected,
		isOtherSelected,
		isTypeSelected,
		onToggleAll,
		onToggleOther,
		onToggleType,
		otherTypes,
		types,
	};
};
