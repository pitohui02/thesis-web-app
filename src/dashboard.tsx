import { Doughnut, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { useState, useEffect } from 'react'


ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface transferData {
  BarData: {
    SequentialText: string,
  } | null

  sentiment: string | null;
  
}



export default function Dashboard({BarData, sentiment}: transferData) {
  
  const [sentimentData, setSentimentData] = useState<number[]>(() => {
    const savedData = localStorage.getItem('sentimentCounts');
    return savedData ? JSON.parse(savedData) : [0, 0, 0];
  });

  // Save to localStorage whenever sentimentData changes
  useEffect(() => {
    localStorage.setItem('sentimentCounts', JSON.stringify(sentimentData));
  }, [sentimentData]);

  // Track processed sentiments to avoid duplicate counting
  const [processedSentiments] = useState(new Set<string>());

  const sentimentCounter = (sentiment: string) => {
    // Create a unique identifier for this sentiment (could use timestamp or combine with text)
    const sentimentId = BarData ? `${sentiment}-${BarData.SequentialText}` : sentiment;
    
    // Only count if we haven't processed this exact sentiment before
    if (!processedSentiments.has(sentimentId)) {
      processedSentiments.add(sentimentId);
      
      setSentimentData((prevData: number[]) => {
        const lowercase_sentiment = sentiment.toLowerCase();
        const newData: number[] = [...prevData];

        if (lowercase_sentiment === "positive") {
          newData[0] += 1;
        }
        else if (lowercase_sentiment === "neutral") {
          newData[1] += 1;
        }
        else if (lowercase_sentiment === "negative") {
          newData[2] += 1;
        }
        
        return newData;
      });
    }
  };

  useEffect(() => {
    if (sentiment) {
      sentimentCounter(sentiment);
    }
  }, [sentiment, BarData]);
  
  const DoughnutChart = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [{
      label: 'Sentiments',
      data: sentimentData,
      backgroundColor: [
        '#80EF80',
        '#808080 ',
        '#FF6961',
      ],

      borderColor: [
        '#80EF80',
        '#808080 ',
        '#FF6961',
      ],

      borderWidth: 1,
    }]
  }

    return(
        
        <>
            <div className='flex flex-row space-x-5 items-center justify-evenly'>

                <div className='flex flex-col items-center justify-center space-y-5'>
                  <Doughnut options={{
                            plugins: {
                              title: {
                                display: true,
                                text: 'Sentiment Score',
                                font: {
                                  size: 20,
                                  weight: 'bold'
                                }
                              }
                            },
                            responsive: true}} data={DoughnutChart} className='w-full max-w-lg h-80'/>
                </div>

                <div className='flex flex-col items-center'>
                  <p>{BarData ? JSON.stringify(BarData, null, 2) : "No data available."}
                  </p>
                </div>
            </div>
        </>
    )
}