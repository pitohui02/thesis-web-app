export interface WordFrequency {
	word: string;
	count: number;
  }

export interface SentimentResponse {
	text: string;
	sentiment: "Positive" | "Neutral" | "Negative";
	confidence: number[];
	frequency_data: WordFrequency[]
}
