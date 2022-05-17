
import './App.css';
import {
  Navigate,
  useNavigate,
  Route,
  Routes,
} from "react-router-dom";
import MainAdmin from './pages/MainAdmin/MainAdmin';
import RoutesPage from './pages/Master/Routes';
import ItemCategories from './pages/Master/ItemCategories';
import CounterGroup from './pages/Master/CounterGroup';
import ItemGroup from './pages/Master/ItemGroup';
import Counter from './pages/Master/Counter';
import Users from './pages/Master/Users';


import ItemsPage from './pages/Master/Items';
import axios from 'axios';
import AutoIncreaseQuantity from './pages/others/AutoIncreaseQuantity';
import AutoIncreaseItem from './pages/others/AutoIncreaseItem';
function App() {
  axios.defaults.baseURL= "http://localhost:5000"
  return (
    <div className="App">
     <Routes>
       <Route path='/' element={<MainAdmin/>}/>
       <Route path='/routes' element={<RoutesPage/>}/>
       <Route path='/itemCategories' element={<ItemCategories/>}/>
       <Route path='/counterGroup' element={<CounterGroup/>}/>
       <Route path='/itemGroup' element={<ItemGroup/>}/>
       <Route path='/counter' element={<Counter/>}/>
       <Route path='/users' element={<Users/>}/>
       <Route path='/items' element={<ItemsPage/>}/>
       <Route path='/autoIncreaseQty' element={<AutoIncreaseQuantity/>}/>
       <Route path='/autoIncreaseItem' element={<AutoIncreaseItem/>}/>
       <Route path="*" element={<Navigate replace to="/" />} />
     </Routes>
    </div>
  );
}

export default App;
