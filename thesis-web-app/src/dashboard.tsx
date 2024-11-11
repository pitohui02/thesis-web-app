import { Doughnut, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  Title,
  CategoryScale,
  LinearScale,
  BarElement,
  ChartOptions
} from 'chart.js';

import { useState, useEffect } from 'react';
import { WordFrequency } from './types/sentiment';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  Title,
  CategoryScale,
  LinearScale,
  BarElement
);

interface transferData {
  BarData: {
    SequentialText: string,
  } | null;
  sentiment: string | null;
  frequencyData: WordFrequency[] | null;
}

const doughnutOptions: ChartOptions<'doughnut'> = {
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
  responsive: true
};

const barChartOptions: ChartOptions<'bar'> = {
  plugins: {
    title: {
      display: true,
      text: 'Word Frequency',
      font: {
        size: 20,
        weight: 'bold'
      }
    }
  },
  responsive: true,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  }
};

export default function Dashboard({ 
  BarData, 
  sentiment,
  frequencyData
}: transferData) {
  const [sentimentData, setSentimentData] = useState<number[]>(() => {
    const savedData = localStorage.getItem('sentimentCounts');
    return savedData ? JSON.parse(savedData) : [0, 0, 0];
  });

  const [localFrequencyData, setLocalFrequencyData] = useState<WordFrequency[]>(() => {
    const savedFrequency = localStorage.getItem('frequencyData');
    return savedFrequency ? JSON.parse(savedFrequency) : [];
  });

  // Track processed text to avoid duplicate counting
  const [processedTexts] = useState(new Set<string>());

  useEffect(() => {
    localStorage.setItem('sentimentCounts', JSON.stringify(sentimentData));
  }, [sentimentData]);

  useEffect(() => {
    if (frequencyData && BarData?.SequentialText) {
      // Check if this text has already been processed
      if (!processedTexts.has(BarData.SequentialText)) {
        processedTexts.add(BarData.SequentialText);
        
        // Update frequency data
        setLocalFrequencyData(prevData => {
          const newData = [...prevData];
          
          frequencyData.forEach(newItem => {
            const existingIndex = newData.findIndex(item => item.word === newItem.word);
            if (existingIndex === -1) {
              // Add new word
              newData.push({ word: newItem.word, count: 1 });
            } else {
              // Update existing word count
              newData[existingIndex] = {
                ...newData[existingIndex],
                count: newData[existingIndex].count + 1
              };
            }
          });
          
          return newData;
        });
      }
    }
  }, [frequencyData, BarData]);

  useEffect(() => {
    localStorage.setItem('frequencyData', JSON.stringify(localFrequencyData));
  }, [localFrequencyData]);

  const sentimentCounter = (sentiment: string) => {
    const sentimentId = BarData ? `${sentiment}-${BarData.SequentialText}` : sentiment;
    
    if (!processedTexts.has(sentimentId)) {
      processedTexts.add(sentimentId);
      
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
        '#808080',
        '#FF6961',
      ],
      borderColor: [
        '#80EF80',
        '#808080',
        '#FF6961',
      ],
      borderWidth: 1,
    }]
  };

  const barChartData = {
    labels: localFrequencyData.map(item => item.word),
    datasets: [{
      label: 'Word Frequency',
      data: localFrequencyData.map(item => item.count),
      backgroundColor: '#80EF80',
      borderColor: '#80EF80',
      borderWidth: 1,
    }]
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8 items-center justify-evenly w-full p-6">
        <div className="w-full lg:w-1/3 h-96">
          <Doughnut 
            options={doughnutOptions} 
            data={DoughnutChart}
            className="w-full h-full"
          />
        </div>

        <div className="w-full lg:w-2/3 h-96">
          {localFrequencyData && localFrequencyData.length > 0 ? (
            <Bar 
              options={barChartOptions} 
              data={barChartData}
              className="w-full h-full"
            />
          ) : (
            <p>No frequency data available.</p>
          )}
        </div>
      </div>
    </>
  );
}