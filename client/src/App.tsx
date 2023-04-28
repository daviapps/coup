import { Suspense } from 'react';
import Routes from './Routes';

import './App.css';

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes />
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
