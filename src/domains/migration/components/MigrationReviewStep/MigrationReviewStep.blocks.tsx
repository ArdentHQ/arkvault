import React from "react";
import { Icon } from "@/app/components/Icon";
import { Image } from "@/app/components/Image";

export const MigrationPolygonIcon = () => (
	<>
		<div className="justify-center-white absolute top-0 right-8 bottom-0 flex w-8 items-center">
			<Image name="Hexagon" width={44} height={44} useAccentColor={false} />
		</div>

		<div className="absolute top-0 right-8 bottom-0 flex w-8 items-center justify-center text-theme-hint-600">
			<Icon name="Received" size="md" />
		</div>
	</>
);
