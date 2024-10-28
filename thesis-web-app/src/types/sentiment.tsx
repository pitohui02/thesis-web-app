export interface SentimentResponse {
    text: string;
    sentiment: 'positive' | 'negative';
    confidence: number;
  }