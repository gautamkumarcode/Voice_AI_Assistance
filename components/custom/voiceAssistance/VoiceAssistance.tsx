// components/VoiceInterview.tsx
"use client";

import useVapi from "@/hooks/useVapi";
import { memo, useState } from "react";
import ChatAvatars from "../chatavatar/ChatAvatar";

const INTEREST_FIELDS = [
	"Frontend Development",
	"Backend Development",
	"Full Stack Development",
	"UI/UX Design",
	"Data Science",
	"DevOps",
];

export default function VoiceInterview() {
	const { start, stop, isActive, isLoading, currentSpeaker, latestMessage } =
		useVapi();
	const [studentInfo, setStudentInfo] = useState({
		name: "",
		field: "",
	});
	const [showInterview, setShowInterview] = useState(false);
	const MemoizedChatAvatars = memo(ChatAvatars);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setStudentInfo((prev) => ({ ...prev, [name]: value }));
	};

	const handleStartInterview = () => {
		if (studentInfo.name && studentInfo.field) {
			setShowInterview(true);
			start();
		}
	};

	if (!showInterview) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 transition-colors">
				<div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
					<h1 className="text-2xl font-bold mb-6 text-center dark:text-white">
						Enter Your Information
					</h1>

					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium mb-1 dark:text-gray-300">
								Your Name
							</label>
							<input
								type="text"
								name="name"
								value={studentInfo.name}
								onChange={handleInputChange}
								className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1 dark:text-gray-300">
								Field of Interest
							</label>
							<select
								name="field"
								value={studentInfo.field}
								onChange={handleInputChange}
								className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
								required>
								<option value="">Select a field</option>
								{INTEREST_FIELDS.map((field) => (
									<option key={field} value={field}>
										{field}
									</option>
								))}
							</select>
						</div>

						<button
							onClick={handleStartInterview}
							disabled={!studentInfo.name || !studentInfo.field}
							className="w-full mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
							Start Interview
						</button>
					</div>
				</div>
			</div>
		);
	}

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
