// components/VoiceInterview.tsx
"use client";

import useVapi from "@/hooks/useVapi";
import { memo } from "react";
import ChatAvatars from "../chatavatar/ChatAvatar";

export default function VoiceInterview() {
	const { start, stop, isActive, isLoading, currentSpeaker, latestMessage } =
		useVapi();

	// Memoize ChatAvatars component to prevent unnecessary rerenders
	const MemoizedChatAvatars = memo(ChatAvatars);

	// Use in your component

	return (
		<div className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 transition-colors">
			<h1 className="flex text-white text-2xl mb-4">
				AI Assistant for AuraHire
			</h1>

			<div className="w-full max-w-2xl p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg backdrop-blur-sm">
				<div className="mb-8">
					<MemoizedChatAvatars
						currentSpeaker={currentSpeaker}
						latestMessage={latestMessage}
					/>
				</div>

				<div className="flex justify-center">
					<button
						onClick={isActive ? stop : start}
						disabled={isLoading}
						className={`
							relative px-8 py-4 rounded-full font-semibold text-lg
							transform transition-all duration-300 ease-in-out cursor-pointer
							${
								isLoading
									? "bg-gray-400 cursor-wait opacity-75"
									: isActive
									? "bg-red-600 hover:bg-red-700"
									: "bg-blue-600 hover:bg-blue-700"
							} text-white shadow-lg
						`}>
						{isLoading && (
							<span className="absolute inset-0 flex items-center justify-center">
								<svg
									className="animate-spin h-5 w-5 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24">
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
							</span>
						)}
						<span className={isLoading ? "opacity-0" : ""}>
							{isLoading
								? "Starting..."
								: isActive
								? "End Conversation"
								: "Start Conversation"}
						</span>
					</button>
				</div>
			</div>
		</div>
	);
}
