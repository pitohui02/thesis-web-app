import axios from "axios";
import type { AxiosError } from "axios";
import type { SentimentResponse } from "../types/sentiment";
import type { WordFrequency } from "../types/sentiment";

interface ErrorResponse {
	error: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const getSentimentAnalysis = async (text: string,): Promise<SentimentResponse> => {
	try {
		const response = await axios.post<SentimentResponse>(
			`${API_URL}/api/predict`, { text }); 
			return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const axiosError = error as AxiosError<ErrorResponse>;
			if (axiosError.response?.data?.error) {
				throw new Error(axiosError.response.data.error);
			}
		}
		throw new Error("Failed to analyze sentiment");
	}
};

export const fetchWordFrequency = async (text: string): Promise<WordFrequency[]> => {
	try {
		const response = await axios.post<SentimentResponse>(`${API_URL}/api/word-frequency`, { text })
		return response.data.frequency_data || [];
	} catch (error) {
		if(axios.isAxiosError(error)) {
			const axiosError = error as AxiosError<ErrorResponse>;
			if (axiosError.response?.data?.error){
				throw new Error(axiosError.response.data.error)
			}
		}
		throw new Error("Failed to get Word Frequency");
	}
}


