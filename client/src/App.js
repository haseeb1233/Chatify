import Login from './components/Registration/Login';
import Signup from './components/Registration/Signup';
import { Routes, Route } from "react-router-dom";
import HomePage from './components/HomePage/HomePage';
import Status from './components/Status/Status';
import StoryViewer from './components/Status/StatusViewer';

function App() {
  return (
    <div className="">

      <Routes>
      <Route path="/" element={<HomePage/>}></Route>
        <Route path="/signup" element={<Signup/>}></Route>
        <Route path="/login" element={<Login/>}></Route>
        <Route path="/status" element={<Status/>}></Route>
        <Route path="/status/:id" element={<StoryViewer/>}></Route>
      </Routes>
      
    </div>
  );
}

export default App;
