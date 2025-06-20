"use client";
import { interviewPrompts } from "@/utils/prompts";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
type SpeechRecognition = typeof window extends {
	webkitSpeechRecognition: infer T;
}
	? T
	: any;

type SpeechRecognitionEvent = typeof window extends {
	webkitSpeechRecognitionEvent: infer T;
}
	? T
	: any;

export default function WebRTCInterview() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [field, setField] = useState<keyof typeof interviewPrompts | null>(
		"frontend"
	);
	const [questions, setQuestions] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fieldParam = searchParams.get(
			"field"
		) as keyof typeof interviewPrompts;

		// Check if fieldParam is a valid key in interviewPrompts
		if (fieldParam && interviewPrompts.hasOwnProperty(fieldParam)) {
			setField(fieldParam);
			setQuestions(interviewPrompts[fieldParam]);
		} else {
			// Default to 'frontend' if the field is not valid or not provided
			setField("frontend");
			setQuestions(interviewPrompts["frontend"]);
		}

		setIsLoading(false);
	}, [searchParams]);

	const [questionIndex, setQuestionIndex] = useState(0);
	const [responses, setResponses] = useState<
		{ question: string; answer: string; score: number }[]
	>([]);
	const [transcript, setTranscript] = useState("");
	const [score, setScore] = useState<number | null>(null);
	const recognitionRef = useRef<SpeechRecognition | null>(null);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const SpeechRecognition =
				(window as any).webkitSpeechRecognition ||
				(window as any).SpeechRecognition;
			if (SpeechRecognition) {
				const recognition = new SpeechRecognition();
				recognition.lang = "en-US";
				recognition.interimResults = false;
				recognition.continuous = false;

				recognition.onresult = (event: SpeechRecognitionEvent) => {
					const result = event.results[0][0].transcript;
					setTranscript(result);
				};

				recognition.onerror = (event: any) => {
					console.error("Speech recognition error:", event.error);
				};

				recognitionRef.current = recognition;
			}
		}
	}, []);

	const startListening = () => {
		setTranscript("");
		recognitionRef.current?.start();
	};

	const callOpenAIScoring = async (question: string, answer: string) => {
		try {
			const response = await fetch("/api/score", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ question, answer }),
			});
			const data = await response.json();
			return data.score || 0;
		} catch (error) {
			console.error("Scoring API error:", error);
			return 0;
		}
	};

	const handleNext = async () => {
		const currentQuestion = questions[questionIndex];
		const calculatedScore = await callOpenAIScoring(
			currentQuestion,
			transcript
		);
		setScore(calculatedScore);

		const updated = [
			...responses,
			{ question: currentQuestion, answer: transcript, score: calculatedScore },
		];
		setResponses(updated);
		setTranscript("");

		if (questionIndex < questions.length - 1) {
			setQuestionIndex(questionIndex + 1);
		} else {
			alert("Interview complete. Redirecting to summary...");
			router.push(
				`/summary?data=${encodeURIComponent(JSON.stringify(updated))}`
			);
		}
	};

	if (isLoading) {
		return <div>Loading interview questions...</div>;
	}

	// if (!field) {
	// 	return <div>No interview field specified. Please select a field.</div>;
	// }

	return (
		<div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
			<h1 className="text-xl font-semibold mb-4">Interview: {field}</h1>

			<div className="bg-gray-100 p-4 rounded shadow w-full max-w-xl mb-4">
				<p className="text-lg font-medium">{questions[questionIndex]}</p>
			</div>

			<button
				onClick={startListening}
				className="bg-green-600 text-white px-4 py-2 rounded mb-3">
				🎙️ Start Recording
			</button>

			{transcript && (
				<div className="w-full max-w-xl mb-4">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Transcript:
					</label>
					<textarea
						className="w-full border rounded p-2"
						value={transcript}
						readOnly
						rows={4}></textarea>
				</div>
			)}

			{score !== null && (
				<div className="mb-4 text-green-700 font-semibold">
					✅ Answer scored: {score}/10
				</div>
			)}

			<button
				onClick={handleNext}
				className="bg-blue-600 text-white px-4 py-2 rounded">
				{questionIndex < questions.length - 1
					? "Next Question"
					: "Finish Interview"}
			</button>
		</div>
	);
}
