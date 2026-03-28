import {
  LocalStateProvider,
  SessionStateProvider,
} from "@daviapps/react-utils";
import { PropsWithChildren } from "react";
import { ReactQueryProvider } from "./react-query-provider";
import { ToastContainer } from "react-toastify";
import { GlobalStylesheet } from "@/styles/global";

export function AppProvider({ children }: PropsWithChildren) {
  return (
    <SessionStateProvider>
      {/* @ts-ignore */}
      <LocalStateProvider>
        {/* @ts-ignore */}
        <ReactQueryProvider>
          <GlobalStylesheet />
          {children} <ToastContainer />
        </ReactQueryProvider>
      </LocalStateProvider>
    </SessionStateProvider>
  );
}
