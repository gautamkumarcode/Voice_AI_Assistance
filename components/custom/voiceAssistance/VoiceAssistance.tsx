// components/VoiceInterview.tsx
"use client";

import useVapi from "@/hooks/useVapi";
import ChatAvatars from "../chatavatar/ChatAvatar";

export default function VoiceInterview() {
	const { start, stop, isActive, isLoading, currentSpeaker, latestMessage } =
		useVapi();

	return (
		<div className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 transition-colors">
			<h1 className="flex text-white text-2xl mb-4">
				AI Assistant for AuraHire
			</h1>

			<div className="w-full max-w-2xl p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg backdrop-blur-sm">
				<div className="mb-8">
					<ChatAvatars
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
							transform transition-all duration-200 ease-in-out
							${
								isLoading
									? "bg-gray-400 cursor-not-allowed"
									: isActive
									? "bg-red-600 hover:bg-red-700 hover:scale-105"
									: "bg-blue-600 hover:bg-blue-700 hover:scale-105"
							} text-white shadow-lg hover:shadow-xl
							before:content-[''] before:absolute before:inset-0
							before:rounded-full before:bg-white before:opacity-0
							before:transition-opacity hover:before:opacity-20
						`}>
						{isLoading
							? "Starting..."
							: isActive
							? "End Interview"
							: "Start Interview"}
					</button>
				</div>
			</div>
		</div>
	);
}
