import { u as useBaseQuery, Q as QueryObserver, d as defaultThrowOnError } from "./useBaseQuery-C6J2jp5y.js";
function useSuspenseQuery(options, queryClient) {
  return useBaseQuery(
    {
      ...options,
      enabled: true,
      suspense: true,
      throwOnError: defaultThrowOnError,
      placeholderData: void 0
    },
    QueryObserver
  );
}
export {
  useSuspenseQuery as u
};
