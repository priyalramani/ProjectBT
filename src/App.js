import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
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
import Processing from "./users/Processing";
import ProcessingOrders from "./users/ProcessingOrders";
const id = "240522";
function App() {

  axios.defaults.baseURL = "https://api.btgondia.com";
  // axios.defaults.baseURL = "http://15.207.39.69:9000";
  // axios.defaults.baseURL = "http://localhost:9000";

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate replace to={"/users"} />} />
          <Route path="/login" element={<LoginPage />} />
          {localStorage.getItem("user_uuid") ? (
            <>
              {localStorage.getItem("user_uuid") === id ? (
                <>
                  {/* admin Routes */}
                  <Route path="/admin" element={<MainAdmin />} />
                  <Route path="/trip" element={<MainAdmin />} />
                  <Route path="/admin/routes" element={<RoutesPage />} />
                  <Route path="/admin/itemCategories" element={<ItemCategories />} />
                  <Route path="/admin/counterGroup" element={<CounterGroup />} />
                  <Route path="/admin/itemGroup" element={<ItemGroup />} />
                  <Route path="/admin/counter" element={<Counter />} />
                  <Route path="/admin/adminUsers" element={<Users />} />
                  <Route path="/admin/items" element={<ItemsPage />} />
                  <Route path="/admin/autoIncreaseQty" element={<AutoIncreaseQuantity />} />
                  <Route path="/admin/autoIncreaseItem" element={<AutoIncreaseItem />} />
                  <Route path="*" element={<Navigate replace to={"/admin"} />} />
                </>
              ) : (
                <>
                  {/* users routes */}
                  <Route path="/users" element={<Main />} />
                  <Route path="/users/orders" element={<Orders />} />
                  <Route path="/users/processing" element={<Processing />} />
                  <Route path="/users/processing/:trip_uuid" element={<ProcessingOrders />} />
                  <Route path="/users/orders/:counter_uuid" element={<SelectedCounterOrder />} />
                  <Route path="*" element={<Navigate replace to={"/users"} />} />
                </>
              )}
            </>
          ) : !window.location.pathname.includes('/login') ? (
            <Route path="*" element={<Navigate replace to={"/login"} />} />
          ) : ''}
        </Routes>
      </Router>
    </div>
  );
}

export default App;