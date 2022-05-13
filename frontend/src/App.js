
import './App.css';
import {
  Navigate,
  useNavigate,
  Route,
  Routes,
} from "react-router-dom";
import MainAdmin from './pages/MainAdmin/MainAdmin';
import RoutesPage from './pages/Routes/Routes';
function App() {
  return (
    <div className="App">
     <Routes>
       <Route path='/admin' element={<MainAdmin/>}/>
       <Route path='/routes' element={<RoutesPage/>}/>
       <Route path="*" element={<Navigate replace to="/admin" />} />
     </Routes>
    </div>
  );
}

export default App;
