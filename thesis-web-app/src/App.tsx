"use client";

import "./App.css";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { WordFrequency } from "./types/sentiment";
import { getSentimentAnalysis, fetchWordFrequency } from "./api/sentimentApi";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "./components/ui/form";
import { Dialog, DialogContent, DialogTrigger } from "./components/ui/dialog";
import Dashboard from "./dashboard";

const FormSchema = z.object({
	feedbackText: z.string().min(1, "Feedback is required").max(200),
});

type FeedbackFormValues = z.infer<typeof FormSchema>;

export default function App() {
	const [sentiment, setSentiment] = useState<string | null>(null);
	const [wordFrequency, setWordFrequency] = useState<WordFrequency[] | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(false);
	const [submittedFeedback, setSubmittedFeedback] = useState<string | null>(
		null,
	);

	const form = useForm<FeedbackFormValues>({
		resolver: zodResolver(FormSchema),
		defaultValues: { feedbackText: "" },
	});

	const formBorderStyle = useMemo(() => {
		switch (sentiment?.toLowerCase()) {
			case "positive":
				return "border-green-500";
			case "negative":
				return "border-red-500";
			case "neutral":
				return "border-gray-500";
			default:
				return "border-gray-300";
		}
	}, [sentiment]);

	const handleFormSubmit = async (data: FeedbackFormValues) => {
		setIsLoading(true);
		try {
			setSubmittedFeedback(data.feedbackText);
			const [sentimentResult, frequencyResult] = await Promise.all([
				getSentimentAnalysis(data.feedbackText),
				fetchWordFrequency(data.feedbackText),
			]);
			setSentiment(sentimentResult.sentiment);
			setWordFrequency(frequencyResult);
		} catch (error) {
			console.error(
				"Error fetching sentiment analysis or word frequency",
				error,
			);
		} finally {
			setIsLoading(false);
			form.reset();
		}
	};

	return (
		<div className="flex flex-col items-center p-6">
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(handleFormSubmit)}
					className={`flex flex-col space-y-6 p-6 rounded-lg shadow-md bg-gray-50 border-4 ${formBorderStyle}`}
				>
					<h5 className="text-xl font-semibold">
						Give feedback to Mr. Juan Dela Cruz
					</h5>

					<FormField
						control={form.control}
						name="feedbackText"
						render={({ field }) => (
							<FormItem>
								<FormMessage />
								<FormControl>
									<Input
										placeholder="Enter your feedback..."
										className="w-full"
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					<Button
						type="submit"
						className="bg-blue-500 hover:bg-blue-600 w-full"
						disabled={isLoading}
					>
						{isLoading ? "Submitting..." : "Submit Feedback"}
					</Button>

					{submittedFeedback && (
						<div>
							<h3 className="font-medium">
								Feedback: {submittedFeedback || "No feedback provided yet."}
							</h3>
							<h3 className="font-medium">
								Sentiment: {isLoading ? "Analyzing..." : sentiment || "N/A"}
							</h3>
						</div>
					)}

					<Dialog>
						<DialogTrigger asChild>
							<Button className="bg-blue-500 hover:bg-blue-600 w-full">
								View Graph
							</Button>
						</DialogTrigger>
						<DialogContent
							className="max-w-6xl min-h-[40rem] bg-gray-100"
							aria-describedby="sentiment score"
						>
							<Dashboard
								BarData={submittedFeedback}
								sentiment={sentiment}
								frequencyData={wordFrequency}
							/>
						</DialogContent>
					</Dialog>
				</form>
			</Form>
		</div>
	);
}
