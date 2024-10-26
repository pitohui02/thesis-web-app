import { Doughnut, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Button } from "@/components/ui/button"


ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface transferData {
  BarData: {
    SequentialText: string, 
  } | null
}



export default function Dashboard({BarData}: transferData) {
  
  const SentimentData = [50, 30, 20];

  const DoughnutChart = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [{
      label: 'Sentiments',
      data: SentimentData,
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