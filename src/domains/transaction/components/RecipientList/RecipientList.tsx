import { Contracts } from "@payvo/sdk-profiles";
import React, { useCallback } from "react";
import tw, { styled } from "twin.macro";

import { RecipientListItem } from "./RecipientList.blocks";
import { RecipientItem, RecipientListProperties } from "./RecipientList.contracts";
import { useColumns } from "./RecipientList.helpers";
import { defaultStyle } from "./RecipientList.styles";
import { assertString } from "@/utils/assertions";
import { useActiveProfile } from "@/app/hooks";
import { Table } from "@/app/components/Table";

const RecipientListWrapper = styled.div`
	${defaultStyle}
	${tw`w-full`}
`;

export const RecipientList: React.VFC<RecipientListProperties> = ({
	disableButton,
	isEditable,
	label,
	onRemove,
	recipients,
	showAmount,
	showExchangeAmount,
	ticker,
	tooltipDisabled,
	variant,
}) => {
	const columns = useColumns({ isEditable, showAmount });

	const profile = useActiveProfile();

	const exchangeTicker = profile.settings().get(Contracts.ProfileSetting.ExchangeCurrency);
	assertString(exchangeTicker);

	const renderTableRow = useCallback(
		(recipient: RecipientItem, index: number) => (
			<RecipientListItem
				disableButton={disableButton}
				exchangeTicker={exchangeTicker}
				isEditable={isEditable}
				label={label}
				listIndex={index}
				onRemove={onRemove}
				recipient={recipient}
				showAmount={showAmount}
				showExchangeAmount={showExchangeAmount}
				ticker={ticker}
				tooltipDisabled={tooltipDisabled}
				variant={variant}
			/>
		),
		[
			disableButton,
			exchangeTicker,
			isEditable,
			label,
			onRemove,
			showAmount,
			showExchangeAmount,
			ticker,
			tooltipDisabled,
			variant,
		],
	);

	return (
		<RecipientListWrapper>
			<Table columns={columns} data={recipients}>
				{renderTableRow}
			</Table>
		</RecipientListWrapper>
	);
};
