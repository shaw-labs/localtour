import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Home from './pages/Home'
import CityPage from './pages/CityPage'

function App() {
  return (
    <Routes>
      {/* product front door — the consolidated "City Decision Engine" landing */}
      <Route path="/" element={<Landing />} />
      {/* dev dashboard for the work build — runtime-computed counts, city links */}
      <Route path="/dev" element={<Home />} />
      {/* both spellings: dev links use /cities/chicago, legacy pages use /cities/chicago/ */}
      <Route path="/cities/:slug" element={<CityPage />} />
      <Route path="/cities/:slug/" element={<CityPage />} />
    </Routes>
  )
}

export default App
