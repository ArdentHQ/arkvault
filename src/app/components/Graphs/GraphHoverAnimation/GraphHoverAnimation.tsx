import React from "react";

import { GraphAnimation } from "./GraphHoverAnimation.contract";

interface GraphHoverAnimationProperties {
	animations: GraphAnimation[];
	targetElementId?: string; // @README: must not contain dashes
}

export const GraphHoverAnimation: React.VFC<GraphHoverAnimationProperties> = ({ animations, targetElementId }) => (
	<>
		{animations.map(({ attribute, from, to }, index) => (
			<React.Fragment key={index}>
				<animate
					attributeName={attribute}
					from={from}
					to={to}
					dur="0.1s"
					begin={[targetElementId, "mouseover"].filter(Boolean).join(".")}
					fill="freeze"
				/>
				<animate
					attributeName={attribute}
					from={to}
					to={from}
					dur="0.15s"
					begin={[targetElementId, "mouseleave"].filter(Boolean).join(".")}
					fill="freeze"
				/>
			</React.Fragment>
		))}
	</>
);
