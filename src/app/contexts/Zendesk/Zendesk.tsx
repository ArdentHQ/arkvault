import { useAccentColor } from "@/app/hooks";
import React from "react";
import Zendesk, { ZendeskAPI } from "react-zendesk";
import { delay } from "@/utils/delay";

const ZENDESK_KEY = "0e4c4d37-9d38-4be4-925d-e659dd4d12bd";
import ZendeskStyles from "@/styles/zendesk-widget.css";
import { Contracts } from "@ardenthq/sdk-profiles";

interface Properties {
	children: React.ReactNode;
}

const ZendeskContext = React.createContext<any>(undefined);

export const ZendeskProvider = ({ children }: Properties) => {
	return (
		<ZendeskContext.Provider value={null}>
			{children}

			<Zendesk zendeskKey={ZENDESK_KEY} />
		</ZendeskContext.Provider>
	);
};

const isSupportChatOpen = () => {
	return !!window.document.getElementById("webWidget");
};

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
					theme: accentColors[getCurrentAccentColor()],
					button: accentColors[getCurrentAccentColor()],
				},
			},
		});

		// @ts-ignore
		window.$zopim?.livechat?.window?.show?.();

		delay(() => {
			// @ts-ignore
			const widget = window.document.getElementById("webWidget").contentWindow.document;

			widget.body.classList.add("widget");
			widget.body.classList.add(`widget-${profile.appearance().get("theme")}`);
			widget.body.insertAdjacentHTML("afterend", `<style>${ZendeskStyles}</style>`);
		}, 300);
	};

	const hideSupportChat = () => {
		if (!isSupportChatOpen()) {
			return;
		}

		// @ts-ignore
		const widget = window.document.getElementById("webWidget").contentWindow.document;
		widget.body.classList.remove("widget-light", "widget-dark");

		// @ts-ignore
		window.$zopim?.livechat?.window?.hide?.();
	};

	return { showSupportChat, hideSupportChat, isSupportChatOpen };
};
