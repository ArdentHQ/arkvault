import React from "react";
import { DashboardSetupAddressSlider } from "./Dashboard.Empty.Slider";
import { AddressActionsMenuMobile, DashboardSetupAddressCards, HeaderMobile } from "./Dashboard.Empty.blocks";

export const DashboardEmpty = ({
	onCreateAddress,
	onImportAddress,
}: {
	onCreateAddress?: (open: boolean) => void;
	onImportAddress?: (open: boolean) => void;
}) => (
	<>
		<div className="hidden justify-center items-center sm:flex">
			<div className="flex px-4 mt-6 md:items-center md:px-0 md:mt-0 h-page max-w-[45.25rem]">
				<DashboardSetupAddressCards onCreateAddress={onCreateAddress} onImportAddress={onImportAddress} />
			</div>
		</div>

		<div className="block sm:hidden">
			<div className="xs:mx-auto xs:max-w-88">
				<div className="px-8 my-6 space-y-1 text-center">
					<HeaderMobile />
				</div>

				<DashboardSetupAddressSlider />

				<AddressActionsMenuMobile onImportAddress={onImportAddress} onCreateAddress={onCreateAddress} />
			</div>
		</div>
	</>
);
