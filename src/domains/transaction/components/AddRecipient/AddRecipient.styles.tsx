import React from "react";
import { twMerge } from "tailwind-merge";

export const AddRecipientWrapper = ({...properties}: React.HTMLProps<HTMLDivElement>) => {
	return <div {...properties} className={twMerge("add-recipient-wrapper", properties.className)} />;
}
