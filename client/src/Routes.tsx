import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Join from "./pages/Join";
import New from "./pages/New";
import Room from "./pages/Room";
import PageNotFound from "./pages/404";

export default function Router() {
  return(
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/join" element={<Join />} />
        <Route path="/new" element={<New />} />
        <Route path="/room/*" element={<Room />} />

        <Route path="/" element={<Home />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
