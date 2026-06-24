import { u as useBaseQuery, Q as QueryObserver, d as defaultThrowOnError } from "./useBaseQuery-BBkell2z.js";
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
