import { Doughnut, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Button } from "@/components/ui/button"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
    const data = {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [
            {
              label: 'Sentiment Analysis',
              data: [65, 20, 15], // Change this data based on your sentiment analysis
              backgroundColor: [
                'rgba(75, 192, 192, 0.6)', // Color for Positive
                'rgba(255, 206, 86, 0.6)', // Color for Neutral
                'rgba(255, 99, 132, 0.6)', // Color for Negative
              ],
              borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(255, 99, 132, 1)',
              ],
              borderWidth: 1,
            },
          ],
        };

        
    }



    return(
        
        <>
            <div className='flex flex-row space-x-5'>

            </div>
        </>
    )
}