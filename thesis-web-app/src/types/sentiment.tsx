export interface SentimentResponse {
	text: string;
	sentiment: "positive" | "neutral" | "negative";
	confidence: number[];
}
