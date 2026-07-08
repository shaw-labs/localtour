import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CityPage from './pages/CityPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cities/:slug" element={<CityPage />} />
    </Routes>
  )
}

export default App
