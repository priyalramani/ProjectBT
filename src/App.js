import "./App.css";
import {
  Navigate,
  useNavigate,
  Route,
  Routes,
  BrowserRouter as Router,
} from "react-router-dom";
import MainAdmin from "./pages/MainAdmin/MainAdmin";
import RoutesPage from "./pages/Master/Routes";
import ItemCategories from "./pages/Master/ItemCategories";
import CounterGroup from "./pages/Master/CounterGroup";
import ItemGroup from "./pages/Master/ItemGroup";
import Counter from "./pages/Master/Counter";
import Users from "./pages/Master/Users";
import Orders from "./users/Orders";
import SelectedCounterOrder from "./users/SelectedCounterOrder";
import ItemsPage from "./pages/Master/Items";
import axios from "axios";
import AutoIncreaseQuantity from "./pages/others/AutoIncreaseQuantity";
import AutoIncreaseItem from "./pages/others/AutoIncreaseItem";
import Main from "./users/Main";
import LoginPage from "./users/LoginPage";
import { useEffect } from "react";
const id = "240522";
function App() {
  axios.defaults.baseURL = "http://15.207.39.69:9000";
  console.log(localStorage.getItem("user_uuid"));
  useEffect(() => {
    if (
      localStorage.getItem("user_uuid") &&
      !window.location.pathname.includes("users")
    ) {
      window.location.assign("/users");
    } else if (
      localStorage.getItem("AdminId") &&
      !window.location.pathname.includes("admin")&&!window.location.pathname.includes("users")
    ) {
      window.location.assign("/admin");
    }
  });
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* admin Routes */}
         
            <>
              {/* users routes */}
              {localStorage.getItem("user_uuid") ? (
                <>
                  <Route path="/users" element={<Main />} />
                  <Route path="/users/orders" element={<Orders />} />
                  <Route
                    path="/users/orders/:counter_uuid"
                    element={<SelectedCounterOrder />}
                  />
                </>
              ) : (
                ""
              )}
              <Route
                path="*"
                element={
                  <Navigate
                    replace
                    to={localStorage.getItem("user_uuid") ? "/users" : "/login"}
                  />
                }
              />
              <Route path="/login" element={<LoginPage />} />
            </>
            {window.location.pathname.includes("admin") ? (
            <>
              {localStorage.getItem("AdminId") === id ? (
                <>
                  <Route path="/admin" element={<MainAdmin />} />
                  <Route path="/admin/routes" element={<RoutesPage />} />
                  <Route
                    path="/admin/itemCategories"
                    element={<ItemCategories />}
                  />
                  <Route
                    path="/admin/counterGroup"
                    element={<CounterGroup />}
                  />
                  <Route path="/admin/itemGroup" element={<ItemGroup />} />
                  <Route path="/admin/counter" element={<Counter />} />
                  <Route path="/admin/adminUsers" element={<Users />} />
                  <Route path="/admin/items" element={<ItemsPage />} />
                  <Route
                    path="/admin/autoIncreaseQty"
                    element={<AutoIncreaseQuantity />}
                  />
                  <Route
                    path="/admin/autoIncreaseItem"
                    element={<AutoIncreaseItem />}
                  />
                  
                </>
              ) : (
                ""
              )}
              <Route
                path="*"
                element={
                  <Navigate
                    replace
                    to={
                      localStorage.getItem("AdminId") === id
                        ? "/admin"
                        : "/adminLogin"
                    }
                  />
                }
              />
              <Route path="/adminLogin" element={<LoginPage />} />
            </>
          ) : ("")}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
