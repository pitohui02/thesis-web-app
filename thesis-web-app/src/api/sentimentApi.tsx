import axios, { AxiosError } from 'axios';
import { SentimentResponse } from '../types/sentiment';

interface ErrorResponse {
  error: string;
}

const API_URL = 'http://localhost:5000';

export const analyzeSentiment = async (text: string): Promise<SentimentResponse> => {
    try {
      const response = await axios.post<SentimentResponse>(`${API_URL}/api/predict`, { text });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        if (axiosError.response?.data?.error) {
          throw new Error(axiosError.response.data.error);
        }
      }
      throw new Error('Failed to analyze sentiment');
    }
  };