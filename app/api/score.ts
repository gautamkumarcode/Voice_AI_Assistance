// pages/api/score.ts
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method !== "POST") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	const { question, answer } = req.body;

	try {
		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
			},
			body: JSON.stringify({
				model: "gpt-3.5-turbo",
				messages: [
					{
						role: "system",
						content:
							"You are an interview evaluator that gives a score between 0 and 10 based on answer quality.",
					},
					{
						role: "user",
						content: `Question: ${question}\nAnswer: ${answer}\nScore this answer out of 10 and return only the number.`,
					},
				],
			}),
		});

		const data = await response.json();
		const gptReply = data.choices?.[0]?.message?.content || "0";
		const score = parseInt(gptReply.match(/\d+/)?.[0] || "0", 10);
		res.status(200).json({ score });
	} catch (error) {
		console.error("OpenAI error:", error);
		res.status(500).json({ score: 0 });
	}
};

export default handler;

// pages/summary.tsx
