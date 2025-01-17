import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clipboard } from "@/app/components/Clipboard";
import { Icon } from "@/app/components/Icon";
import cn from "classnames";

export const Copy = ({ address, className }: { address: string; className?: string }) => {
	const { t } = useTranslation();
	const [isClicked, setIsClicked] = useState<boolean>(false);

	useEffect(() => {
		if (isClicked) {
			const timer = setTimeout(() => {
				setIsClicked(false);
			}, 1000);

			return () => clearTimeout(timer);
		}
	}, [isClicked, 1000]);

	return (
		<Clipboard variant="icon" data={address} tooltip={t("COMMON.COPY_ADDRESS")} tooltipDarkTheme>
			{isClicked ? (
				<Icon
					name="CopySuccess"
					className={cn("text-theme-primary-600", className)}
					data-testid="Copy__icon_success"
				/>
			) : (
				<Icon
					name="Copy"
					onClick={() => setIsClicked(true)}
					className={cn("hover:text-theme-secondary-500", className)}
					data-testid="Copy__icon"
				/>
			)}
		</Clipboard>
	);
};
