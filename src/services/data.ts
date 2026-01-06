import { useQuery, queryOptions } from "@tanstack/react-query";
import { fetchLocalBodies, fetchTrendResults, fetchWards, fetchPollingStations } from "./dataService";

const FIVE_MINUTES = 5 * 60 * 1000;

export const localBodyQueryOptions = queryOptions({
  queryKey: ['localbody'],
  queryFn: fetchLocalBodies,
  staleTime: Infinity,
});

export const useLocalBody = () => useQuery(localBodyQueryOptions);

export const wardsQueryOptions = queryOptions({
  queryKey: ['wards'],
  queryFn: fetchWards,
  staleTime: Infinity,
});


export const pollingStationsQueryOptions = queryOptions({
  queryKey: ['pollingstations'],
  queryFn: fetchPollingStations,
  staleTime: Infinity,
});


export const trendResultsQueryOptions = queryOptions({
  queryKey: ['trendresults'],
  queryFn: fetchTrendResults,
  staleTime: FIVE_MINUTES,
});

