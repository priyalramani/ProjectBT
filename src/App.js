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
          <Route path="/test" element={<Test />} />
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

      {/* {window.location.pathname.split('/').at(-2) === 'processing' && <div id="console">
        <h3>CONSOLE <button onClick={e => window.location.reload()}>Reload</button></h3>
      </div>} */}

    </div>
  );
}

const Test = () => {

  // let audioElement = new Audio(`${axios.defaults.baseURL}/stream/this_is_a_test_data_for_audio_custom_api_and_client_audio_behavior`);
  // audioElement.preload = 'none'

  // let last;
  // audioElement.onloadeddata = () => {
  //   console.log('FULLY LOADED')
  //   console.log(audioElement.duration)
  // }

  // const id = setInterval(() => {
  //   if (`${audioElement.duration}` !== last) {
  //     last = `${audioElement.duration}`
  //     // audioElement.currentTime = Math.random()
  //     const p = document.createElement('p')
  //     p.innerText = `audio duration at ${Date.now()} : ${audioElement.duration} `
  //     document.querySelector('#test-div').append(p)
  //     // if (+audioElement.duration && audioElement.duration !== Infinity)
  //     // clearInterval(id)
  //   }
  // }, 10)

  // audioElement.addEventListener('loadedmetadata', () => {
  //   if (audioElement.duration === Infinity) {
  //     audioElement.currentTime = 1e101
  //     audioElement.addEventListener('timeupdate', getDuration)
  //   }
  // })

  var _player = new Audio(`${axios.defaults.baseURL}/stream/this_is_a_test_data_for_audio_custom_api_and_client_audio_behavior`);
  _player.addEventListener("durationchange", function (e) {
    if (this.duration != Infinity) {
      _player.remove();
      console.log(_player.duration);
    };
  }, false);
  _player.load();
  _player.currentTime = 24 * 60 * 60; //fake big time
  _player.volume = 0;
  // _player.play();
  //waiting...

  return (
    <>
      <h1>Test Page</h1>
      <div id="test-div"></div>
    </>
  )
}

export default App;