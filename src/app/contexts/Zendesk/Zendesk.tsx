import React from "react";
import Zendesk, { ZendeskAPI } from "react-zendesk";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useAccentColor } from "@/app/hooks";
import { delay } from "@/utils/delay";
import ZendeskStyles from "@/styles/zendesk-widget.css";

const ZendeskContext = React.createContext<any>(undefined);

export const ZendeskProvider = ({ children }: { children: React.ReactNode }) => {
	const zendeskKey = process.env.ZENDESK_WIDGET_KEY;

	return (
		<ZendeskContext.Provider value={null}>
			{children}

			{zendeskKey && <Zendesk zendeskKey={zendeskKey} />}
		</ZendeskContext.Provider>
	);
};

const isSupportChatOpen = () => !!window.document.querySelector("#webWidget");

export const useZendesk = () => {
	const { getCurrentAccentColor } = useAccentColor();

	const accentColors = {
		green: "#289548",
		navy: "#235b95",
	};

	const showSupportChat = (profile: Contracts.IProfile) => {
		ZendeskAPI("webWidget", "updateSettings", {
			webWidget: {
				color: {
					button: accentColors[getCurrentAccentColor()],
					theme: accentColors[getCurrentAccentColor()],
				},
			},
		});

		// @ts-ignore
		window.$zopim?.livechat?.window?.show?.();

		delay(() => {
			// @ts-ignore
			const widget = window.document.querySelector("#webWidget")?.contentWindow?.document;

			widget?.body.classList.add("widget");
			widget?.body.classList.add(`widget-${profile.appearance().get("theme")}`);
			widget?.body.insertAdjacentHTML("afterend", `<style>${ZendeskStyles}</style>`);
		}, 300);
	};

	const hideSupportChat = () => {
		if (!isSupportChatOpen()) {
			return;
		}

		// @ts-ignore
		const widget = window.document.querySelector("#webWidget")?.contentWindow?.document;
		widget?.body?.classList.remove("widget-light", "widget-dark");

		// @ts-ignore
		window.$zopim?.livechat?.window?.hide?.();
	};

	return { hideSupportChat, isSupportChatOpen, showSupportChat };
};
