import { PropsWithChildren, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

export function ReactQueryProvider({ children }: PropsWithChildren) {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
