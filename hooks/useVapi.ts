// hooks/useVapi.ts
import Vapi from "@vapi-ai/web";
import { useEffect, useRef, useState } from "react";

type Message = {
	role: "user" | "assistant";
	text: string;
};

export default function useVapi() {
	const vapiRef = useRef<any>(null);
	const [isActive, setIsActive] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [conversation, setConversation] = useState<Message[]>([]);
	const [currentSpeaker, setCurrentSpeaker] = useState<
		"user" | "assistant" | null
	>(null);

	useEffect(() => {
		const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);
		vapiRef.current = vapi;

		vapi.on("call-start", () => {
			setIsActive(true);
			setIsLoading(false);
		});

		vapi.on("call-end", () => {
			setIsActive(false);
			setConversation([]);
			setCurrentSpeaker(null);
		});

		vapi.on("message", (msg) => {
			// Handle both partial and final transcripts
			if (msg.type === "transcript") {
				if (msg.transcriptType === "partial") {
					setConversation((prev) => {
						const newConv = [...prev];
						if (
							newConv.length > 0 &&
							newConv[newConv.length - 1].role === msg.role
						) {
							newConv[newConv.length - 1].text = msg.transcript;
						} else {
							newConv.push({ role: msg.role, text: msg.transcript });
						}
						return newConv;
					});
					setCurrentSpeaker(msg.role);
				} else if (msg.transcriptType === "final") {
					setConversation((prev) => {
						const newConv = [...prev];
						if (
							newConv.length > 0 &&
							newConv[newConv.length - 1].role === msg.role
						) {
							newConv[newConv.length - 1].text = msg.transcript;
						} else {
							newConv.push({ role: msg.role, text: msg.transcript });
						}
						return newConv;
					});
				}
			}
		});

		vapi.on("error", (error) => {
			console.error(error);
			setIsLoading(false);
		});

		return () => {
			vapi.removeAllListeners();
		};
	}, []);

	const start = async () => {
		if (isLoading || isActive) return;
		try {
			setIsLoading(true);
			await vapiRef.current?.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!);
		} catch (error) {
			console.error("Failed to start interview:", error);
			setIsLoading(false);
			setIsActive(false);
		}
	};

	const stop = () => {
		if (!isActive) return;
		vapiRef.current?.stop();
		setIsLoading(false);
	};

	const latestMessage = conversation[conversation.length - 1];

	return { start, stop, isActive, isLoading, currentSpeaker, latestMessage };
}
