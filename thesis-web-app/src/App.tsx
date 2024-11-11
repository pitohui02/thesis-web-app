"use client";

import "./App.css";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { SentimentResponse, WordFrequency } from './types/sentiment';
import { getSentimentAnalysis } from "./api/sentimentApi";
import { fetchWordFrequency } from "./api/sentimentApi";
// import { cn } from "./lib/utils"

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
  SequentialText: z.string().min(1, "Feedback is Required.").max(200),
});

type InputText = z.infer<typeof FormSchema>;

export default function App() {
  const [getData, setgetData] = useState<InputText | null>(null);
  const [SentimentPredict, setSentimentPredict] = useState<string>("");
  const [isPredicting, setIsPredicting] = useState(false); 
  const [Frequency_data, setFrequency_data] = useState<WordFrequency[] | null>(null);


  const getFormBorderStyle = () => {
    switch (SentimentPredict.toLowerCase()) {
      case 'positive':
        return { borderColor: '#80EF80' }; 
      case 'negative':
        return { borderColor: '#FF6961' }; 
      case 'neutral':
        return { borderColor: '#808080' }; 
      default:
        return { borderColor: '#E5E7EB' }; 
    }
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      SequentialText: "",
    },
  });

  const handleFormSubmit = async (data: InputText) => {
    console.log("Input Text: ", data);
    setgetData(data);
    setIsPredicting(true); 

    try {
      const sentiment = await getSentimentAnalysis(data.SequentialText);
      const frequency_data = await fetchWordFrequency(data.SequentialText)
      console.log(sentiment);
      setSentimentPredict(sentiment.sentiment);
      setFrequency_data(frequency_data)
    } finally {
      setIsPredicting(false);
    }

    form.reset({
      SequentialText: "",
    });
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="flex flex-col space-y-4 py-8 px-4 rounded-lg shadow-sm max-w-[40rem] bg-[#F5F5F5] border-4"
          style={isPredicting ? { borderColor: '#8EABC9' } : getFormBorderStyle()}
          autoComplete="off"
        >
          <h5 className="font-bold text-xl">
            Give some Feedback to Mr. Juan Dela Cruz
          </h5>

          <div className="flex flex-col space-y-5 items-center">
            <FormField
              control={form.control}
              name="SequentialText"
              render={({ field }) => (
                <FormItem>
                  <FormMessage className="text-xs" />
                  <FormControl>
                    <Input
                      placeholder="Feedback..."
                      className="rounded-lg w-[30rem]"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              variant="outline"
              className="bg-[#8EABC9] hover:bg-[#C2D3E4] w-[30rem]"
            >
              Submit
            </Button>

			<h3 className="font-bold text-l self-start">
              Feedback: {getData?.SequentialText || "No Feedback Yet.." }
            </h3>

            <h3 className="font-bold text-l self-start">
              Sentiment: {isPredicting ? "Predicting..." : SentimentPredict}
            </h3>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="bg-[#8EABC9] hover:bg-[#C2D3E4] w-[30rem]"
                >
                  Check Graph
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[100rem] min-h-[40rem] bg-[#f5f5f5] " aria-describedby="sentiment score">
                <Dashboard BarData={getData} sentiment={SentimentPredict} frequencyData={Frequency_data}/>
              </DialogContent>
            </Dialog>
          </div>
        </form>
      </Form>
    </>
  );
}