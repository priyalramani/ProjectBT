import "./App.css";
import { Navigate, useNavigate, Route, Routes, BrowserRouter as Router } from "react-router-dom";
import MainAdmin from "./pages/MainAdmin/MainAdmin";
import RoutesPage from "./pages/Master/Routes";
import ItemCategories from "./pages/Master/ItemCategories";
import CounterGroup from "./pages/Master/CounterGroup";
import ItemGroup from "./pages/Master/ItemGroup";
import Counter from "./pages/Master/Counter";
import Users from "./pages/Master/Users";

import ItemsPage from "./pages/Master/Items";
import axios from "axios";
import AutoIncreaseQuantity from "./pages/others/AutoIncreaseQuantity";
import AutoIncreaseItem from "./pages/others/AutoIncreaseItem";
import Main from "./users/Main";
import LoginPage from "./users/LoginPage";
import Orders from "./users/Orders";
import SelectedCounterOrder from "./users/SelectedCounterOrder";
function App() {
  axios.defaults.baseURL = "http://15.207.39.69:9000";
  return (
    <div className="App">
      <Router >
        <Routes>
          {/* admin Routes */}

          <Route path="/admin" element={<MainAdmin />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/itemCategories" element={<ItemCategories />} />
          <Route path="/counterGroup" element={<CounterGroup />} />
          <Route path="/itemGroup" element={<ItemGroup />} />
          <Route path="/counter" element={<Counter />} />
          <Route path="/adminUsers" element={<Users />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/autoIncreaseQty" element={<AutoIncreaseQuantity />} />
          <Route path="/autoIncreaseItem" element={<AutoIncreaseItem />} />
          <Route path="*" element={<Navigate replace to="/admin" />} />

          {/* users routes */}
          <Route path="/users" element={<Main />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/users/orders" element={<Orders />} />
          <Route
            path="/users/orders/:counter_uuid"
            element={<SelectedCounterOrder />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
