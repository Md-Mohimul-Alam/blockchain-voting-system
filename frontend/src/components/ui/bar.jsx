import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register the required components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ total, upcoming, running, previous }) => {
  const data = {
    labels: ['Total Elections', 'Upcoming Elections', 'Running Elections', 'Previous Elections'],
    datasets: [
      {
        label: 'Elections Count',
        data: [total, upcoming, running, previous],
        backgroundColor: ['#4CAF50', '#FFC107', '#FF5722', '#9E9E9E'],
        borderColor: ['#388E3C', '#FF8F00', '#F44336', '#616161'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Election Statistics',
        font: {
          size: 18,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default BarChart;
