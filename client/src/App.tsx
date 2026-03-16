import { Suspense } from 'react';
import Routes from './Routes';
const queryClient = new QueryClient();

import './App.css';
import { QueryClient, QueryClientProvider } from 'react-query';

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <QueryClientProvider client={queryClient}>
        <Routes />
      </QueryClientProvider>
    </Suspense>
  )
}

const Loading = () => (
  <div
    className="d-flex align-items-center justify-content-center"
    style={{ height: '100%' }}
  >
    ...
  </div>
)

export default App
