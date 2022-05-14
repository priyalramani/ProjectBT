
import './App.css';
import {
  Navigate,
  useNavigate,
  Route,
  Routes,
} from "react-router-dom";
import MainAdmin from './pages/MainAdmin/MainAdmin';
import RoutesPage from './pages/Routes/Routes';
import ItemCategories from './pages/ItemCategories/ItemCategories';
import CounterGroup from './pages/CounterGroup/CounterGroup';
import ItemGroup from './pages/ItemGroup/ItemGroup';
import Counter from './pages/Counters/Counter';
import Users from './pages/Users/Users';
function App() {
  return (
    <div className="App">
     <Routes>
       <Route path='/admin' element={<MainAdmin/>}/>
       <Route path='/routes' element={<RoutesPage/>}/>
       <Route path='/itemCategories' element={<ItemCategories/>}/>
       <Route path='/counterGroup' element={<CounterGroup/>}/>
       <Route path='/itemGroup' element={<ItemGroup/>}/>
       <Route path='/counter' element={<Counter/>}/>
       <Route path='/users' element={<Users/>}/>
       <Route path="*" element={<Navigate replace to="/admin" />} />
     </Routes>
    </div>
  );
}

export default App;
