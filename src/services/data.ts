import { useQuery } from "@tanstack/react-query";
import { fetchLocalBodies, fetchTrendResults, fetchWards, fetchPollingStations } from "./dataService";

const FIVE_MINUTES = 5 * 60 * 1000;

export const useLocalBody = () => useQuery({
  queryKey: ['localbody'],
  queryFn: fetchLocalBodies,
  staleTime: Infinity, // Static CSV
});

export const useWards = () => useQuery({
  queryKey: ['wards'],
  queryFn: fetchWards,
  staleTime: Infinity, // Static CSV
});

export const usePollingStations = () => useQuery({
  queryKey: ['pollingstations'],
  queryFn: fetchPollingStations,
  staleTime: Infinity, // Static CSV
});

export const useTrendResults = () => useQuery({
  queryKey: ['trendresults'],
  queryFn: fetchTrendResults,
  staleTime: FIVE_MINUTES, // Refresh every 5 mins
});
