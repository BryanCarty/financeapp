"use client";

import LoadingSquiggle from "./LoadingSquiggle";
import fetchConscensusDataDb from "../actions/conscensus";
import { useState, useEffect } from "react";
import courierPrime from "./CourierPrime";
import Histogram from "./Histogram";
import styles from "@/app/_styles/ConscensusCharts.module.css";

function generateDynamicHistogramData(prices, numBins) {
  if (prices.length === 0) {
    return {
      labels: [],
      datasets: [
        {
          label: "Count",
          data: [],
          backgroundColor: "#353535",
        },
      ],
    };
  }

  // Calculate min and max prices
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // If all prices are the same
  if (minPrice === maxPrice) {
    const labels = [`=${minPrice.toFixed(2)}`];
    const frequencies = [prices.length]; // Total count for the single bin

    return {
      labels: labels,
      datasets: [
        {
          label: "Count",
          data: frequencies,
          backgroundColor: "#353535",
        },
      ],
    };
  }

  // Determine the bin width
  const binWidth = (maxPrice - minPrice) / numBins;

  // Generate dynamic bin labels and boundaries
  const labels = [];
  const frequencies = new Array(numBins).fill(0);

  for (let i = 0; i < numBins; i++) {
    const binStart = minPrice + i * binWidth;
    const binEnd = binStart + binWidth;

    if (i === 0) {
      labels.push(`≤${binEnd.toFixed(2)}`);
    } else if (i === numBins - 1) {
      labels.push(`≥${binStart.toFixed(2)}`);
    } else {
      labels.push(`${binStart.toFixed(2)}-${binEnd.toFixed(2)}`);
    }
  }

  // Calculate frequencies for each bin
  prices.forEach((price) => {
    const binIndex = Math.min(
      Math.floor((price - minPrice) / binWidth),
      numBins - 1
    );
    frequencies[binIndex]++;
  });

  // Construct the histogram data object
  const histogramData = {
    labels: labels,
    datasets: [
      {
        label: "Count",
        data: frequencies, // Whole numbers only
        backgroundColor: "#353535",
      },
    ],
  };

  return histogramData;
}

export default function ConscensusCharts({ searchQuery }) {
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState("");
  const [lessThanHistogramData, setLessThanHistogramData] = useState();
  const [greaterThanHistogramData, setGreaterThanHistogramData] = useState();

  useEffect(() => {
    const fetchConscensusData = async () => {
      setLoading(true);
      const conscensusData = {
        less_thans: [
          220, 220, 222, 222, 222, 224, 223, 225, 225, 227, 226, 227, 230, 229,
          229, 230, 230, 226, 226, 226, 230, 229, 229, 231, 230,
        ],
        greater_thans: [
          240, 240, 240, 244, 244, 244, 244, 245, 245, 246, 247, 248, 248, 248,
          248, 250, 250, 250, 250, 254, 254, 242, 243, 242, 246, 246, 246, 246,
          251, 251, 251, 251, 251, 251, 251, 251, 251, 250, 250, 250, 253, 253,
          253, 253, 253, 253, 253, 253, 253, 253, 253, 253,
        ],
      }; /*await fetchConscensusDataDb(
        searchQuery.ticker,
        searchQuery.date
      );*/

      if (!conscensusData) {
        setLoadingError("Hmm.. There appears to be no data for this date 😞");
        setLoading(false);
        return;
      }

      const lessThanChartData = generateDynamicHistogramData(
        conscensusData.less_thans,
        8
      );
      const greaterThanChartData = generateDynamicHistogramData(
        conscensusData.greater_thans,
        8
      );
      setLoading(false);
      setLoadingError("");
      setLessThanHistogramData(lessThanChartData);
      setGreaterThanHistogramData(greaterThanChartData);
    };
    if (searchQuery.ticker && searchQuery.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const searchDate = new Date(searchQuery.date);
      searchDate.setHours(0, 0, 0, 0);

      if (searchDate.getTime() < today.getTime()) {
        setLoadingError("Past dates are not supported 🔮");
      } else {
        fetchConscensusData();
      }
    }
    setLoading(false);
  }, [searchQuery]);

  if (loading) {
    return (
      <div>
        <LoadingSquiggle />
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className={`${courierPrime.className} ${styles.loadingError}`}>
        {loadingError}
      </div>
    );
  }

  return (
    <div className={styles.histogramContainer}>
      {lessThanHistogramData && (
        <Histogram
          histogramData={lessThanHistogramData}
          title={"Less Than Precictions 📉"}
        />
      )}
      {greaterThanHistogramData && (
        <Histogram
          histogramData={greaterThanHistogramData}
          title={"Greater Than Precictions 📈"}
        />
      )}
    </div>
  );
}
