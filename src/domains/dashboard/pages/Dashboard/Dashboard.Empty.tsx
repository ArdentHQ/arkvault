import React from "react";
import { DashboardSetupAddressSlider } from "./Dashboard.Empty.Slider";
import { AddressActionsMenuMobile, DashboardSetupAddressCards, HeaderMobile } from "./Dashboard.Empty.blocks";

export const DashboardEmpty = () => (
	<>
		<div className="items-center justify-center hidden sm:flex">
			<div className="flex h-page max-w-[45.25rem] md:items-center mt-6 sm:mt-14 md:mt-0 px-4 md:px-0">
				<DashboardSetupAddressCards />
			</div>
		</div>

		<div className="block sm:hidden">
			<div className="xs:max-w-88 xs:mx-auto">
				<div className="my-6 space-y-1 px-8 text-center">
					<HeaderMobile />
				</div>

				<DashboardSetupAddressSlider />

				<AddressActionsMenuMobile />
			</div>
		</div>
	</>
);
