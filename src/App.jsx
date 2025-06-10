import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './index.css';

import Login from "./components/Login";
import Home from './pages/Home';
import SignUp from './components/SignUp';
import MyShelfPage from './pages/MyShelfPage';
import GenreManagement from './components/GenreManagement ';
import MyGenre from './pages/MyGenre';
import Mybooks from './pages/Mybooks';
import UserProfileManage from './pages/UserProfileManage';
// import SingleBookView from './components/SingleBookView';
// import SingleBookReader from './components/SingleBookReader';
import PrivateRoute from './components/PrivateRoute';
import OpenBook from './pages/OpenBook';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        
        <Route path="/shelf" element={
          <PrivateRoute><MyShelfPage /></PrivateRoute>
        } />
        <Route path="/genres" element={
          <PrivateRoute><MyGenre /></PrivateRoute>
        } />
        <Route path='/contribute' element={
          <PrivateRoute><Mybooks /></PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute><UserProfileManage /></PrivateRoute>
        } />
        
        <Route path="/single-book/:book_id/" element={<OpenBook/>}/>
      </Routes>
    </Router>
  );
}
