"use client";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Title,
} from "chart.js";
import courierPrime from "./CourierPrime";
import styles from "@/app/_styles/ConscensusCharts.module.css";

// Register Chart.js components

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Title);

const Histogram = ({ histogramData, title }) => {
  // Histogram options
  const histogramOptions = {
    responsive: true,
    scales: {
      x: {
        title: { display: true, text: "Price Predictions" },
      },
      y: {
        title: { display: true, text: "Count" },
      },
    },
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  };

  return (
    <div>
      {/* Histogram */}
      <div className={styles.barContainer}>
        <h2 className={`${courierPrime.className} ${styles.font}`}>{title}</h2>
        <Bar data={histogramData} options={histogramOptions} />
      </div>
    </div>
  );
};

export default Histogram;
