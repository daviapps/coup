import { Suspense } from "react";
import Routes from "./Routes";

import { AppProvider } from "./providers";

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <AppProvider>
        <Routes />
      </AppProvider>
    </Suspense>
  );
}

const Loading = () => (
  <div
    className="d-flex align-items-center justify-content-center"
    style={{ height: "100%" }}
  >
    ...
  </div>
);

export default App;
