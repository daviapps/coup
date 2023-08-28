import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./views/Home";
import Join from "./views/Join";
import Find from "./views/Find";
import New from "./views/New";
import Room from "./views/Room";
import PageNotFound from "./views/404";

export default function Router() {
  return(
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/join" element={<Join />} />
        <Route path="/new" element={<New />} />
        <Route path="/find" element={<Find />} />
        <Route path="/room/:id" element={<Room />} />

        <Route path="/" element={<Home />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
