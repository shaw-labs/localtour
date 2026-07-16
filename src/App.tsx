import { Routes, Route, Link } from 'react-router-dom'
import Landing from './pages/Landing'
import Home from './pages/Home'
import CityPage from './pages/CityPage'
import CityWall from './pages/CityWall'
import PartnersStats from './pages/PartnersStats'

// In-voice 404 — unknown paths used to render a blank shell (soft-404).
function NotFound() {
  return (
    <main style={{ minHeight: '100vh', background: '#faf8f4', color: '#0c1b2a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, textAlign: 'center', fontFamily: "'DM Sans',sans-serif" }}>
      <span style={{ width: 44, height: 44, borderRadius: 11, background: '#dc2626', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontFamily: "'Playfair Display',Georgia,serif" }}>LT</span>
      <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(26px,6vw,40px)', fontWeight: 700, margin: 0 }}>This street isn&rsquo;t on our map.</h1>
      <p style={{ color: '#718096', fontSize: 15, maxWidth: 420, lineHeight: 1.6, margin: 0 }}>The page you&rsquo;re after doesn&rsquo;t exist — but fifteen cities do.</p>
      <Link to="/" style={{ marginTop: 8, background: '#dc2626', color: '#fff', padding: '13px 28px', borderRadius: 999, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>Back to the cities</Link>
    </main>
  )
}

function App() {
  return (
    <Routes>
      {/* product front door — the consolidated "City Decision Engine" landing */}
      <Route path="/" element={<Landing />} />
      {/* dev dashboard for the work build — runtime-computed counts, city links */}
      <Route path="/dev" element={<Home />} />
      {/* WS3 merchant stats dashboard — reads ?k=<token>, fetches /api/stats */}
      <Route path="/partners/stats" element={<PartnersStats />} />
      {/* native per-city travel-photo wall (all 15 cities; replaces legacy wall.html) */}
      <Route path="/cities/:slug/wall" element={<CityWall />} />
      {/* both spellings: dev links use /cities/chicago, legacy pages use /cities/chicago/ */}
      <Route path="/cities/:slug" element={<CityPage />} />
      <Route path="/cities/:slug/" element={<CityPage />} />
      {/* anything else: a real 404 page, not a blank shell */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
