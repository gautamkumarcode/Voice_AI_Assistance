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

		vapi.on("call-start", () => setIsActive(true));
		vapi.on("call-end", () => {
			setIsActive(false);
			setConversation([]);
			setCurrentSpeaker(null);
		});

		vapi.on("message", (msg) => {
			if (msg.type === "transcript" && msg.transcriptType === "final") {
				setConversation((prev) => [
					...prev,
					{ role: msg.role, text: msg.transcript },
				]);
				setCurrentSpeaker(msg.role);
			}
		});

		vapi.on("error", console.error);
	}, []);

	const start = async () => {
		try {
			setIsLoading(true);
			await vapiRef.current?.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!);
		} catch (error) {
			console.error("Failed to start interview:", error);
		} finally {
			setIsLoading(false);
		}
	};
	const stop = () => vapiRef.current?.stop();

	const latestMessage = conversation[conversation.length - 1];

	return { start, stop, isActive, isLoading, currentSpeaker, latestMessage };
}
