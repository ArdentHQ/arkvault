import React from "react";
import { DashboardSetupAddressSlider } from "./Dashboard.Empty.Slider";
import { AddressActionsMenuMobile, DashboardSetupAddressCards, HeaderMobile } from "./Dashboard.Empty.blocks";

export const DashboardEmpty = () => (
	<>
		<div className="hidden items-center justify-center sm:flex">
			<div className="mt-6 flex h-page max-w-[45.25rem] px-4 sm:mt-14 md:mt-0 md:items-center md:px-0">
				<DashboardSetupAddressCards />
			</div>
		</div>

		<div className="block sm:hidden">
			<div className="xs:mx-auto xs:max-w-88">
				<div className="my-6 space-y-1 px-8 text-center">
					<HeaderMobile />
				</div>

				<DashboardSetupAddressSlider />

				<AddressActionsMenuMobile />
			</div>
		</div>
	</>
);
