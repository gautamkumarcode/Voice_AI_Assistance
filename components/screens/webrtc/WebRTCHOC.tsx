import dynamic from "next/dynamic";

const WebRTC = dynamic(() => import("./WebRTC"), { ssr: false });

export const WebRTCHOC = () => {
	<WebRTC />;
};
