import './App.css';

import { Button } from 'react-bootstrap';
import { Routes, Route } from 'react-router-dom';
// pages
import TodoPage from './pages/todo';


function App() {

  return (
    //<div className="App">
      <Routes>
        <Route path="/" element={<TodoPage />} />
      </Routes>      
    //</div>
  );
}

export default App;
