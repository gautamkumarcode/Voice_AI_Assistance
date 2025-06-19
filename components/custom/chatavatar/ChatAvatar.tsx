// components/ChatAvatars.tsx
type Props = {
	currentSpeaker: "user" | "assistant" | null;
	latestMessage?: { role: "user" | "assistant"; text: string };
};

export default function ChatAvatars({ currentSpeaker, latestMessage }: Props) {
	return (
		<div className="flex items-center justify-center gap-32 p-8">
			{/* AI */}
			<div className="flex flex-col items-center relative w-[280px]">
				<div className="flex flex-col items-center">
					<div
						className={`absolute -top-2 -right-2 ${
							currentSpeaker === "assistant" ? "block" : "hidden"
						}`}>
						<span className="flex h-4 w-4">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
							<span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
						</span>
					</div>
					<div
						className={`relative ${
							currentSpeaker === "assistant" ? "animate-pulse" : ""
						}`}>
						<img
							loading="lazy"
							width="96"
							height="96"
							src={`https://ui-avatars.com/api/?name=AI+Interviewer&background=3b82f6&color=fff`}
							alt="AI"
							className={`w-24 h-24 rounded-full border-4 transition-all duration-300 shadow-lg ${
								currentSpeaker === "assistant"
									? "border-green-500 scale-110 shadow-green-200"
									: "border-gray-300 opacity-80 grayscale"
							}`}
						/>
					</div>
					<p className="mt-3 font-semibold text-base dark:text-white">
						AI Assistant
					</p>
				</div>
				<div className="h-[100px] mt-4 flex items-start">
					{latestMessage?.role === "assistant" && (
						<div className="relative w-full">
							<div className="absolute -left-2 top-3 w-4 h-4 bg-green-100 rotate-45"></div>
							<div className="bg-green-100 dark:bg-green-900 dark:text-green-100 text-gray-800 p-4 rounded-xl shadow-md">
								<p className="text-sm leading-relaxed">{latestMessage.text}</p>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Student */}
			<div className="flex flex-col items-center relative w-[280px]">
				<div className="flex flex-col items-center">
					<div
						className={`absolute -top-2 -right-2 ${
							currentSpeaker === "user" ? "block" : "hidden"
						}`}>
						<span className="flex h-4 w-4">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
							<span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
						</span>
					</div>
					<div
						className={`relative ${
							currentSpeaker === "user" ? "animate-pulse" : ""
						}`}>
						<img
							src={`https://ui-avatars.com/api/?name=student&background=6366f1&color=fff`}
							alt="Student"
							className={`w-24 h-24 rounded-full border-4 transition-all duration-300 shadow-lg ${
								currentSpeaker === "user"
									? "border-blue-500 scale-110 shadow-blue-200"
									: "border-gray-300 opacity-80 grayscale"
							}`}
						/>
					</div>
					<p className="mt-3 font-semibold text-base dark:text-white">
						Student
					</p>
				</div>
				<div className="h-[100px] mt-4 flex items-start">
					{latestMessage?.role === "user" && (
						<div className="relative w-full">
							<div className="absolute -left-2 top-3 w-4 h-4 bg-blue-100 rotate-45"></div>
							<div className="bg-blue-100 dark:bg-blue-900 dark:text-blue-100 text-gray-800 p-4 rounded-xl shadow-md">
								<p className="text-sm leading-relaxed">{latestMessage.text}</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
