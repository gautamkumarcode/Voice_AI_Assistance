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

import io from "socket.io-client";

export default function WebRTCInterview() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [field, setField] = useState<keyof typeof interviewPrompts | null>(
		"frontend"
	);
	const [questions, setQuestions] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [localStream, setLocalStream] = useState<MediaStream | null>(null);
	const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
	const [isConnecting, setIsConnecting] = useState(false);
	const [isConnected, setIsConnected] = useState(false);
	const [roomId, setRoomId] = useState<string>("");
	const localVideoRef = useRef<HTMLVideoElement>(null);
	const remoteVideoRef = useRef<HTMLVideoElement>(null);
	const peerConnection = useRef<RTCPeerConnection | null>(null);
	const socketRef = useRef<any>(null);

	const createPeerConnection = async () => {
		try {
			setIsConnecting(true);
			const pc = new RTCPeerConnection({
				iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
			});

			// Handle ICE candidate events
			pc.onicecandidate = (event) => {
				if (event.candidate) {
					// Send the ICE candidate to the remote peer via signaling server
					socketRef.current.emit("ice-candidate", {
						candidate: event.candidate,
						roomId,
					});
				}
			};

			// Handle connection state changes
			pc.onconnectionstatechange = () => {
				if (pc.connectionState === "connected") {
					setIsConnected(true);
					setIsConnecting(false);
				}
			};

			// Create and send offer
			const offer = await pc.createOffer();
			await pc.setLocalDescription(offer);

			// Send the offer to the remote peer via signaling server
			socketRef.current.emit("offer", { offer, roomId });

			peerConnection.current = pc;
		} catch (err) {
			console.error("Error creating peer connection:", err);
			setIsConnecting(false);
		}
	};

	const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
		try {
			if (!peerConnection.current) return;
			await peerConnection.current.setRemoteDescription(
				new RTCSessionDescription(answer)
			);
		} catch (err) {
			console.error("Error handling answer:", err);
		}
	};

	const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
		try {
			if (!peerConnection.current) return;
			await peerConnection.current.addIceCandidate(
				new RTCIceCandidate(candidate)
			);
		} catch (err) {
			console.error("Error handling ICE candidate:", err);
		}
	};

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
			// Initialize socket connection
			socketRef.current = io("http://localhost:3001");

			// Handle socket events
			socketRef.current.on("connect", () => {
				console.log("Connected to signaling server");
				const newRoomId = Math.random().toString(36).substring(7);
				setRoomId(newRoomId);
				socketRef.current.emit("join-room", newRoomId);
			});

			socketRef.current.on(
				"offer",
				async (offer: RTCSessionDescriptionInit) => {
					if (!peerConnection.current) return;
					await peerConnection.current.setRemoteDescription(
						new RTCSessionDescription(offer)
					);
					const answer = await peerConnection.current.createAnswer();
					await peerConnection.current.setLocalDescription(answer);
					socketRef.current.emit("answer", { answer, roomId });
				}
			);

			socketRef.current.on(
				"answer",
				async (answer: RTCSessionDescriptionInit) => {
					await handleAnswer(answer);
				}
			);

			socketRef.current.on(
				"ice-candidate",
				async (candidate: RTCIceCandidateInit) => {
					await handleIceCandidate(candidate);
				}
			);

			// Initialize WebRTC
			peerConnection.current = new RTCPeerConnection({
				iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
			});

			// Get user media
			navigator.mediaDevices
				.getUserMedia({ video: true, audio: true })
				.then((stream) => {
					setLocalStream(stream);
					if (localVideoRef.current) {
						localVideoRef.current.srcObject = stream;
					}

					// Add tracks to peer connection
					stream.getTracks().forEach((track) => {
						peerConnection.current?.addTrack(track, stream);
					});
				})
				.catch((err) => console.error("Error accessing media devices:", err));

			// Handle incoming tracks
			peerConnection.current.ontrack = (event) => {
				setRemoteStream(event.streams[0]);
				if (remoteVideoRef.current) {
					remoteVideoRef.current.srcObject = event.streams[0];
				}
			};

			// Initialize speech recognition
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

		return () => {
			// Cleanup
			localStream?.getTracks().forEach((track) => track.stop());
			remoteStream?.getTracks().forEach((track) => track.stop());
			peerConnection.current?.close();
		};
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

			<div className="flex flex-col items-center mb-6">
				<button
					onClick={createPeerConnection}
					className={`px-4 py-2 rounded mb-4 ${
						isConnected
							? "bg-green-600"
							: isConnecting
							? "bg-yellow-600"
							: "bg-blue-600"
					} text-white`}
					disabled={isConnecting || isConnected}>
					{isConnected
						? "✓ Connected"
						: isConnecting
						? "Connecting..."
						: "Start Video Call"}
				</button>

				<div className="flex gap-4">
					<div className="relative">
						<video
							ref={localVideoRef}
							autoPlay
							playsInline
							muted
							className="w-64 h-48 bg-gray-200 rounded-lg object-cover"
						/>
						<span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
							You
						</span>
					</div>

					<div className="relative">
						<video
							ref={remoteVideoRef}
							autoPlay
							playsInline
							className="w-64 h-48 bg-gray-200 rounded-lg object-cover"
						/>
						<span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
							Interviewer
						</span>
					</div>
				</div>

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
		</div>
	);
}
