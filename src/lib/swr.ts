import useSWR, { SWRConfiguration } from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "API request failed");
  }

  return res.json();
};

export const useSWRWithAuth = <T = any>(
  key: string | null,
  options?: SWRConfiguration
) => {
  return useSWR<T>(key, fetcher, options);
};

export { fetcher };
