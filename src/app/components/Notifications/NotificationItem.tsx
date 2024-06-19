import React from "react";
import VisibilitySensor from "react-visibility-sensor";

import { useActionNameMap } from "./hooks/use-action-name-map";
import { NotificationItemProperties } from "./Notifications.contracts";

export const NotificationItem = ({
	id,
	name,
	body,
	action: actionName,
	onAction,
	onVisibilityChange,
	containmentRef,
}: NotificationItemProperties) => {
	const { mapActionName } = useActionNameMap();
	const action = mapActionName(actionName as string);

	const renderVisibilitySensor = () => (
		<VisibilitySensor
			onChange={(isVisible) => onVisibilityChange?.(isVisible)}
			scrollCheck
			delayedCall
			containment={containmentRef?.current}
		>
			<div>
				<span className="text-md font-bold text-theme-secondary-600">{name}</span>
				<span className="text-md text-theme-secondary-600"> {body}</span>
			</div>
		</VisibilitySensor>
	);

	return (
		<tr data-testid="NotificationItem">
			<td className="h-8 w-8">
				<div className="bg-logo my-2 mr-4 flex h-8 w-8 items-center justify-center rounded-lg align-middle text-white" />
			</td>
			<td>{renderVisibilitySensor()}</td>
			<td>
				{action && action.label && (
					<div
						data-testid="NotificationItem__action"
						className="text-md cursor-pointer text-right font-bold text-theme-primary-500"
						onClick={() => onAction?.(id)}
					>
						{action.label}
					</div>
				)}
			</td>
		</tr>
	);
};
