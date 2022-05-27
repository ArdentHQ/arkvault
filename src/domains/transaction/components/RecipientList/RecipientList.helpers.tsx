import { Column } from "react-table";

import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";

type UseColumnsHook = (input: { showAmount: boolean; isEditable: boolean }) => Column<RecipientItem>[];

export const useColumns: UseColumnsHook = ({ showAmount, isEditable }) =>
	[
		{ Header: "Avatar", className: "hidden" },
		{ Header: "Address", className: "hidden" },
		showAmount && { Header: "Amount", className: "hidden" },
		isEditable && { Header: "Action", className: "hidden" },
	].filter(Boolean) as Column<RecipientItem>[];
