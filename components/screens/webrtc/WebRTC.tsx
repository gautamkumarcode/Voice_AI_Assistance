"use client";
import WebRTCInterview from "@/components/custom/webRTC/WebRTC";
import { useSearchParams } from "next/navigation";

export default function WebRTC() {
	const searchParams = useSearchParams();
	const field = searchParams.get("field");

	if (!field) {
		return <div>Please select an interview field first</div>;
	}

	return (
		<div className="w-full">
			<WebRTCInterview />
		</div>
	);
}
