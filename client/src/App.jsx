
import './App.css';

import { Route, Routes } from 'react-router-dom';

import HomePage from './Pages/HomePage'

// import Footer from './Components/footer';

function App() {

  return (
    <>
   
      <Routes>
          <Route path='/' element={<HomePage/>}></Route>
      </Routes>
    </>
  )
}

export default App
