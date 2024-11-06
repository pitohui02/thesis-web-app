export interface SentimentResponse {
	text: string;
	sentiment: "Positive" | "Neutral" | "Negative";
	confidence: number[];
}
