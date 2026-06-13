import { useState, useMemo, useEffect, useRef, useCallback, memo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, GeoJSON, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// ─── Data ─────────────────────────────────────────────────────────────────────

const PROJECTS = [
  { name: "Sumatra Peatland Restore", region: "SE Asia", type: "ARR", rating: "BB", price: 17.2, vintage: 2021, coBenefit: 3, lat: -0.5, lng: 102.0 },
  { name: "Katingan Mentaya", region: "SE Asia", type: "REDD+", rating: "BBB", price: 24.8, vintage: 2022, coBenefit: 4, lat: -1.8, lng: 113.0 },
  { name: "Madre de Dios Corridor", region: "Latin America", type: "REDD+", rating: "A", price: 31.5, vintage: 2023, coBenefit: 4, lat: -11.0, lng: -70.0 },
  { name: "Kariba REDD+", region: "Africa", type: "REDD+", rating: "BB", price: 16.4, vintage: 2020, coBenefit: 3, lat: -16.5, lng: 28.8 },
  { name: "Alto Mayo", region: "Latin America", type: "ARR", rating: "BBB", price: 25.9, vintage: 2022, coBenefit: 4, lat: -6.0, lng: -77.5 },
  { name: "Appalachian Hardwood", region: "North America", type: "IFM", rating: "AA", price: 41.2, vintage: 2023, coBenefit: 4, lat: 37.5, lng: -82.0 },
  { name: "Rimba Raya", region: "SE Asia", type: "REDD+", rating: "BBB", price: 26.3, vintage: 2021, coBenefit: 5, lat: -2.5, lng: 112.5 },
  { name: "Cerrado Savanna", region: "Latin America", type: "REDD+", rating: "B", price: 11.8, vintage: 2020, coBenefit: 2, lat: -15.0, lng: -47.0 },
  { name: "Congo Basin Protect", region: "Africa", type: "REDD+", rating: "AA", price: 43.1, vintage: 2023, coBenefit: 5, lat: -1.0, lng: 24.0 },
  { name: "Tasman Sea Kelp", region: "SE Asia", type: "Blue Carbon", rating: "A", price: 33.7, vintage: 2023, coBenefit: 5, lat: -40.0, lng: 152.0 },
  { name: "Gujarat Solar Cookstoves", region: "SE Asia", type: "Cookstoves", rating: "CCC", price: 7.4, vintage: 2019, coBenefit: 2, lat: 22.0, lng: 72.0 },
  { name: "Boreal Shield IFM", region: "North America", type: "IFM", rating: "AAA", price: 51.6, vintage: 2024, coBenefit: 5, lat: 52.0, lng: -90.0 },
  { name: "Patagonia Blue Carbon", region: "Latin America", type: "Blue Carbon", rating: "A", price: 32.4, vintage: 2023, coBenefit: 5, lat: -48.0, lng: -74.0 },
  { name: "Mekong Delta Mangrove", region: "SE Asia", type: "Blue Carbon", rating: "BB", price: 17.9, vintage: 2021, coBenefit: 4, lat: 10.0, lng: 106.0 },
  { name: "Sahel Agroforest", region: "Africa", type: "ARR", rating: "B", price: 10.9, vintage: 2020, coBenefit: 3, lat: 13.0, lng: 2.0 },
  { name: "Borneo Orangutan Forest", region: "SE Asia", type: "REDD+", rating: "AA", price: 44.5, vintage: 2024, coBenefit: 5, lat: 1.0, lng: 114.0 },
  { name: "Andes Cloud Forest", region: "Latin America", type: "ARR", rating: "BBB", price: 27.1, vintage: 2022, coBenefit: 4, lat: -2.0, lng: -78.0 },
  { name: "Great Lakes Afforestation", region: "North America", type: "ARR", rating: "BBB", price: 25.4, vintage: 2021, coBenefit: 3, lat: 45.0, lng: -84.0 },
  { name: "Mau Forest Restore", region: "Africa", type: "ARR", rating: "A", price: 30.8, vintage: 2022, coBenefit: 4, lat: -0.5, lng: 35.5 },
  { name: "Sundarbans Blue", region: "SE Asia", type: "Blue Carbon", rating: "AA", price: 42.3, vintage: 2023, coBenefit: 5, lat: 21.9, lng: 89.5 },
  { name: "Yucatan Biosphere", region: "North America", type: "REDD+", rating: "A", price: 31.9, vintage: 2022, coBenefit: 4, lat: 20.0, lng: -89.0 },
  { name: "Siberian Taiga Protect", region: "Europe", type: "IFM", rating: "BB", price: 18.3, vintage: 2021, coBenefit: 2, lat: 62.0, lng: 105.0 },
  { name: "Gulf of Mexico Seagrass", region: "North America", type: "Blue Carbon", rating: "BBB", price: 26.8, vintage: 2022, coBenefit: 4, lat: 24.0, lng: -90.0 },
  { name: "Nile Delta Mangrove", region: "Africa", type: "Blue Carbon", rating: "BB", price: 15.7, vintage: 2020, coBenefit: 3, lat: 31.0, lng: 31.5 },
  { name: "Papua Highland ARR", region: "SE Asia", type: "ARR", rating: "B", price: 12.3, vintage: 2020, coBenefit: 2, lat: -5.0, lng: 144.0 },
  { name: "Scottish Peatland", region: "Europe", type: "IFM", rating: "AA", price: 40.6, vintage: 2023, coBenefit: 4, lat: 57.0, lng: -4.5 },
  { name: "Minas Gerais REDD+", region: "Latin America", type: "REDD+", rating: "B", price: 11.2, vintage: 2019, coBenefit: 2, lat: -18.0, lng: -44.0 },
  { name: "Himalayan Watershed", region: "SE Asia", type: "ARR", rating: "BBB", price: 24.1, vintage: 2021, coBenefit: 3, lat: 28.0, lng: 84.0 },
  { name: "Ethiopian Highlands ARR", region: "Africa", type: "ARR", rating: "BBB", price: 25.6, vintage: 2022, coBenefit: 4, lat: 9.0, lng: 39.0 },
  { name: "Lake Tanganyika Buffer", region: "Africa", type: "REDD+", rating: "A", price: 29.7, vintage: 2022, coBenefit: 4, lat: -6.0, lng: 29.5 },
  { name: "Oaxaca Community Forest", region: "North America", type: "IFM", rating: "AA", price: 41.8, vintage: 2023, coBenefit: 5, lat: 17.0, lng: -96.0 },
  { name: "Valdivian Rainforest", region: "Latin America", type: "REDD+", rating: "AA", price: 43.7, vintage: 2024, coBenefit: 5, lat: -40.0, lng: -72.0 },
  { name: "Borneo Fire Prevent", region: "SE Asia", type: "REDD+", rating: "CCC", price: 7.9, vintage: 2019, coBenefit: 2, lat: 1.5, lng: 110.0 },
  { name: "Rwenzori Mountains ARR", region: "Africa", type: "ARR", rating: "A", price: 31.2, vintage: 2022, coBenefit: 4, lat: 0.4, lng: 30.0 },
  { name: "Ganges Plain Cookstoves", region: "SE Asia", type: "Cookstoves", rating: "CC", price: 4.8, vintage: 2019, coBenefit: 2, lat: 25.0, lng: 83.0 },
  { name: "Caucasus Mountain IFM", region: "Europe", type: "IFM", rating: "BBB", price: 25.1, vintage: 2021, coBenefit: 3, lat: 42.0, lng: 44.0 },
  { name: "Amazon Headwaters", region: "Latin America", type: "REDD+", rating: "AAA", price: 52.4, vintage: 2024, coBenefit: 5, lat: -3.0, lng: -62.0 },
  { name: "Pantanal Wetlands", region: "Latin America", type: "Blue Carbon", rating: "AA", price: 41.0, vintage: 2023, coBenefit: 5, lat: -17.0, lng: -57.0 },
  { name: "West African Cookstoves", region: "Africa", type: "Cookstoves", rating: "D", price: 2.9, vintage: 2019, coBenefit: 1, lat: 7.0, lng: -1.0 },
  { name: "Viet Bac REDD+", region: "SE Asia", type: "REDD+", rating: "BB", price: 16.8, vintage: 2020, coBenefit: 3, lat: 22.0, lng: 105.0 },
  { name: "Iberian Cork Oak IFM", region: "Europe", type: "IFM", rating: "A", price: 30.2, vintage: 2022, coBenefit: 4, lat: 38.5, lng: -8.0 },
  { name: "Caribbean Coral-Carbon", region: "North America", type: "Blue Carbon", rating: "AAA", price: 53.1, vintage: 2024, coBenefit: 5, lat: 17.0, lng: -66.0 },
  { name: "Tigris Riparian Restore", region: "Europe", type: "ARR", rating: "BB", price: 17.5, vintage: 2021, coBenefit: 3, lat: 33.0, lng: 44.0 },
  { name: "Niger Delta Mangrove", region: "Africa", type: "Blue Carbon", rating: "BB", price: 15.2, vintage: 2020, coBenefit: 3, lat: 4.5, lng: 6.0 },
  { name: "Uzbek Steppe ARR", region: "Europe", type: "ARR", rating: "CCC", price: 8.1, vintage: 2019, coBenefit: 2, lat: 41.0, lng: 64.0 },
  { name: "Laos Watershed REDD+", region: "SE Asia", type: "REDD+", rating: "B", price: 12.7, vintage: 2020, coBenefit: 2, lat: 18.0, lng: 103.0 },
  { name: "Parana Atlantic Forest", region: "Latin America", type: "ARR", rating: "BBB", price: 26.5, vintage: 2022, coBenefit: 4, lat: -24.0, lng: -51.0 },
  { name: "Saharan Edge Cookstoves", region: "Africa", type: "Cookstoves", rating: "CC", price: 5.1, vintage: 2019, coBenefit: 1, lat: 15.0, lng: 17.0 },
  { name: "British Columbia IFM", region: "North America", type: "IFM", rating: "AAA", price: 51.9, vintage: 2024, coBenefit: 5, lat: 54.0, lng: -124.0 },
  { name: "Caspian Littoral Blue", region: "Europe", type: "Blue Carbon", rating: "A", price: 29.5, vintage: 2022, coBenefit: 4, lat: 41.5, lng: 51.0 },
]

// ─── Constants ────────────────────────────────────────────────────────────────

const RATING_ORDER = ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'CC', 'D']
const RATING_INDEX = Object.fromEntries(RATING_ORDER.map((r, i) => [r, i]))
const REGIONS = ['All', 'N. America', 'Africa', 'SE Asia', 'Latin America', 'Europe']
const TYPES = ['All', 'ARR', 'REDD+', 'Cookstoves', 'IFM', 'Blue Carbon']
const RATINGS = ['All', 'D', 'CC', 'CCC', 'B', 'BB', 'BBB', 'A', 'AA', 'AAA']
const REGION_MAP = { 'N. America': 'North America' }

const REGION_CENTERS = {
  'N. America':    { center: [48, -100], zoom: 3 },
  'Africa':        { center: [5,   20],  zoom: 3 },
  'SE Asia':       { center: [5,  110],  zoom: 3 },
  'Latin America': { center: [-15, -60], zoom: 3 },
  'Europe':        { center: [52,  15],  zoom: 3 },
}

const GEOJSON_URL = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson'

const COUNTRY_STYLE_DEFAULT = {
  fillColor: '#000000',
  fillOpacity: 0,
  color: '#1E3328',
  weight: 0.5,
  opacity: 0.4,
}
const COUNTRY_STYLE_HOVER = {
  fillColor: '#1D9E75',
  fillOpacity: 0.18,
  color: '#5DCAA5',
  weight: 1,
  opacity: 1,
}

// ─── Rating helpers ───────────────────────────────────────────────────────────

function ratingBand(r) {
  if (['AAA', 'AA', 'A'].includes(r)) return 'high'
  if (['BBB', 'BB'].includes(r)) return 'mid'
  if (['B', 'CCC'].includes(r)) return 'low'
  return 'junk'
}

const BAND_COLORS = { high: '#1D9E75', mid: '#5DCAA5', low: '#C8C46A', junk: '#E09090' }
const BADGE_BG    = { high: '#085041', mid: '#0F3D2E', low: '#2A2A1A', junk: '#2A1A1A' }
const BADGE_FG    = { high: '#9FE1CB', mid: '#5DCAA5', low: '#C8C46A', junk: '#E09090' }

const markerColor = r => BAND_COLORS[ratingBand(r)]
const isIG = r => ['AAA', 'AA', 'A', 'BBB'].includes(r)
const markerRadius = p => 5 + ((p - 2.9) / (53.1 - 2.9)) * 11

// ─── Multi-select pill group ──────────────────────────────────────────────────

function PillGroup({ options, value, onChange }) {
  // value: string[] — empty means "All" active
  const toggle = (opt) => {
    if (opt === 'All') { onChange([]); return }
    const next = value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]
    onChange(next)
  }
  const isActive = (opt) => opt === 'All' ? value.length === 0 : value.includes(opt)

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {options.map(opt => {
        const active = isActive(opt)
        return (
          <button key={opt} onClick={() => toggle(opt)} style={{
            background: active ? '#1D9E75' : '#1A2E25',
            color: active ? '#0A1A14' : '#8FA89F',
            border: `1px solid ${active ? '#1D9E75' : '#1E3328'}`,
            borderRadius: '20px',
            padding: '3px 11px',
            fontSize: '12px',
            fontWeight: active ? '600' : '400',
            cursor: 'pointer',
            transition: 'background 0.12s, color 0.12s, border-color 0.12s',
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: '0.01em',
          }}>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }) {
  return (
    <div style={{
      background: '#0D1A13', border: '1px solid #1E3328',
      borderRadius: '6px', padding: '10px 12px',
    }}>
      <div style={{ fontSize: '12px', color: '#8FA89F', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>
        {label}
      </div>
      <div style={{ fontSize: '22px', fontWeight: '300', color: '#F0F4F2', letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '11px', color: '#3A5048', marginTop: '4px' }}>{sub}</div>}
    </div>
  )
}

// ─── Co-benefit dots ──────────────────────────────────────────────────────────

function CoBenefitDots({ score }) {
  return (
    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} style={{
          width: '9px', height: '9px', borderRadius: '50%',
          background: i < score ? '#1D9E75' : '#1E3328',
        }} />
      ))}
      <span style={{ fontSize: '12px', color: '#8FA89F', marginLeft: '4px' }}>{score}/5</span>
    </div>
  )
}

// ─── Premium dial (semicircular gauge) ───────────────────────────────────────

function PremiumDial({ project, regionalStats }) {
  if (!regionalStats || regionalStats.max === regionalStats.min) return null

  const { min, max, avg } = regionalStats
  const position = Math.max(0, Math.min(1, (project.price - min) / (max - min)))
  const angleDeg = 180 - position * 180
  const angleRad = (angleDeg * Math.PI) / 180

  // Scaled up: 220×120 viewBox, cx=110 cy=105
  const cx = 110, cy = 105, r = 88, needleR = 78
  const tipX = cx + needleR * Math.cos(angleRad)
  const tipY = cy - needleR * Math.sin(angleRad)

  const pct = Math.round(((project.price - avg) / avg) * 100)
  const pos = pct >= 0
  const calloutColor = pos ? '#5DCAA5' : '#C8C46A'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg viewBox="0 0 220 120" width="220" height="120" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="dialGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#E09090" />
            <stop offset="33%"  stopColor="#C8C46A" />
            <stop offset="66%"  stopColor="#5DCAA5" />
            <stop offset="100%" stopColor="#0F6E56" />
          </linearGradient>
        </defs>

        {/* Track arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="#1E3328" strokeWidth="10" strokeLinecap="round"
        />

        {/* Coloured gradient arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="url(#dialGrad)" strokeWidth="8" strokeLinecap="round"
        />

        {/* Needle */}
        <line
          x1={cx} y1={cy} x2={tipX} y2={tipY}
          stroke="#F0F4F2" strokeWidth="3" strokeLinecap="round"
        />

        {/* Pivot circle */}
        <circle cx={cx} cy={cy} r="6" fill="#1D9E75" />
        <circle cx={cx} cy={cy} r="3" fill="#F0F4F2" />

        {/* End labels */}
        <text x={cx - r + 4} y={cy + 16} fill="#4A6058" fontSize="10" textAnchor="middle">low</text>
        <text x={cx + r - 4} y={cy + 16} fill="#4A6058" fontSize="10" textAnchor="middle">high</text>
      </svg>

      <div style={{
        fontSize: '15px',
        fontWeight: '600',
        color: calloutColor,
        marginTop: '4px',
        letterSpacing: '-0.02em',
      }}>
        {pos ? '↑' : '↓'} {Math.abs(pct)}% {pos ? 'above' : 'below'} regional avg
      </div>
    </div>
  )
}

// ─── Spot price info popover ──────────────────────────────────────────────────

function SpotPriceInfo() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: open ? '#1D9E75' : '#4A6058',
          fontSize: '13px', lineHeight: 1, padding: '0 2px',
          transition: 'color 0.12s',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
        aria-label="Spot price info"
      >
        ⓘ
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '260px',
          background: '#0D1A13',
          border: '1px solid #1E3328',
          borderRadius: '8px',
          padding: '12px 14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          zIndex: 9999,
        }}>
          <div style={{
            fontSize: '12px', color: '#8FA89F', lineHeight: 1.6,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}>
            Spot price is the current market rate for one tonne of CO₂e from this project.
            Higher Sylvera ratings consistently command price premiums — BBB+ rated credits
            average $26/t vs $14/t for BB− rated credits, a ~86% premium.{' '}
            <span style={{ color: '#4A6058' }}>Source: Sylvera State of Carbon Credits 2025.</span>
          </div>
          {/* Arrow */}
          <div style={{
            position: 'absolute', bottom: '-5px', left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: '8px', height: '8px',
            background: '#0D1A13', border: '1px solid #1E3328',
            borderTop: 'none', borderLeft: 'none',
          }} />
        </div>
      )}
    </span>
  )
}

// ─── Map controller (fly-to, choropleth, region nav) ─────────────────────────

function MapFlyTo({ project }) {
  const map = useMap()
  useEffect(() => {
    if (project) map.flyTo([project.lat, project.lng], Math.max(map.getZoom(), 4), { duration: 0.9 })
  }, [project])
  return null
}

// ─── Custom pane — markers always above GeoJSON choropleth ───────────────────

function CreateMarkersPane() {
  const map = useMap()
  useEffect(() => {
    if (!map.getPane('markersPane')) {
      map.createPane('markersPane')
      map.getPane('markersPane').style.zIndex = 650
    }
  }, [map])
  return null
}

// ─── Marker layer (memoised — hover state kept internal) ─────────────────────

const MarkerLayer = memo(function MarkerLayer({ filtered, selected, onSelect }) {
  const [hoveredMarker, setHoveredMarker] = useState(null)

  return (
    <>
      {filtered.map(p => {
        const isSel = selected?.name === p.name
        const isHov = hoveredMarker === p.name
        const color = markerColor(p.rating)
        const baseR = markerRadius(p.price)
        const r     = isSel ? baseR + 3 : isHov ? baseR * 1.4 : baseR
        return (
          <CircleMarker
            key={p.name}
            center={[p.lat, p.lng]}
            radius={r}
            pane="markersPane"
            pathOptions={{
              fillColor: color,
              fillOpacity: isSel ? 1 : 0.82,
              color: isSel ? '#F0F4F2' : isHov ? '#F0F4F2' : color,
              weight: isSel ? 2.5 : isHov ? 1.5 : 1,
              bubblingMouseEvents: false,
            }}
            eventHandlers={{
              click:     (e) => { e.originalEvent.stopPropagation(); onSelect(p) },
              mouseover: () => setHoveredMarker(p.name),
              mouseout:  () => setHoveredMarker(null),
            }}
          >
            <Tooltip direction="top" offset={[0, -(r + 3)]} opacity={1} permanent={false}>
              <strong style={{ color: '#F0F4F2', fontSize: '12px' }}>{p.name}</strong>
              <br />
              <span style={{ color }}>{p.rating}</span>
              <span style={{ color: '#8FA89F' }}>{' · '}${p.price}/tCO₂e</span>
            </Tooltip>
          </CircleMarker>
        )
      })}
    </>
  )
})

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [selected, setSelected]         = useState(null)
  const [regionFilter, setRegionFilter] = useState([])
  const [typeFilter, setTypeFilter]     = useState([])
  const [ratingFilter, setRatingFilter] = useState([])
  const [worldGeo, setWorldGeo] = useState(null)

  const onSelect = useCallback((p) => setSelected(p), [])

  // Load world GeoJSON once
  useEffect(() => {
    fetch(GEOJSON_URL).then(r => r.json()).then(setWorldGeo).catch(() => {})
  }, [])

  // Country hover handlers (stable refs — defined once)
  const onEachCountry = useCallback((feature, layer) => {
    const name = feature.properties?.name || feature.properties?.NAME || ''
    layer.on({
      mouseover(e) {
        e.target.setStyle(COUNTRY_STYLE_HOVER)
        if (name) layer.bindTooltip(name, { sticky: true, direction: 'auto' }).openTooltip()
      },
      mouseout(e) {
        e.target.setStyle(COUNTRY_STYLE_DEFAULT)
        layer.closeTooltip()
      },
    })
  }, [])

  const allPrices  = PROJECTS.map(p => p.price)
  const globalMin  = Math.min(...allPrices)
  const globalMax  = Math.max(...allPrices)

  const filtered = useMemo(() => PROJECTS.filter(p => {
    if (regionFilter.length > 0) {
      const mapped = regionFilter.map(r => REGION_MAP[r] || r)
      if (!mapped.includes(p.region)) return false
    }
    if (typeFilter.length > 0 && !typeFilter.includes(p.type)) return false
    if (ratingFilter.length > 0 && !ratingFilter.includes(p.rating)) return false
    return true
  }), [regionFilter, typeFilter, ratingFilter])

  const avgPrice = filtered.length
    ? (filtered.reduce((s, p) => s + p.price, 0) / filtered.length).toFixed(1) : '—'

  const igAvg  = (() => { const ig  = filtered.filter(p => isIG(p.rating));  return ig.length  ? ig.reduce((s,p)  => s + p.price, 0) / ig.length  : null })()
  const subAvg = (() => { const sub = filtered.filter(p => !isIG(p.rating)); return sub.length ? sub.reduce((s,p) => s + p.price, 0) / sub.length : null })()
  const igPremium = igAvg && subAvg ? Math.round(((igAvg - subAvg) / subAvg) * 100) : null

  const topProject = filtered.length
    ? filtered.reduce((b, p) => RATING_INDEX[p.rating] < RATING_INDEX[b.rating] ? p : b, filtered[0])
    : null

  // Regional stats for selected project (all projects in same region)
  const regionalStats = useMemo(() => {
    if (!selected) return null
    const peers = PROJECTS.filter(p => p.region === selected.region)
    const prices = peers.map(p => p.price)
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((s, x) => s + x, 0) / prices.length,
    }
  }, [selected])

  const handleMapClick = () => setSelected(null)

  return (
    <div style={{ display: 'flex', width: '100%', height: '100dvh', background: '#0A1A14', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Map ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
        <MapContainer
          center={[15, 15]} zoom={2} minZoom={2}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
          worldCopyJump={false}
          maxBoundsViscosity={1.0}
          maxBounds={[[-90, -180], [90, 180]]}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            subdomains="abcd"
            maxZoom={19}
          />

          {/* Create markersPane above GeoJSON */}
          <CreateMarkersPane />

          {/* Fly to selected project */}
          {selected && <MapFlyTo project={selected} />}

          {/* Choropleth base layer — overlayPane keeps it below markersPane */}
          {worldGeo && (
            <GeoJSON
              key="world-countries"
              data={worldGeo}
              style={() => COUNTRY_STYLE_DEFAULT}
              onEachFeature={onEachCountry}
              pathOptions={{ interactive: true, bubblingMouseEvents: false }}
              pane="overlayPane"
            />
          )}

          {/* Project markers — memoised to prevent remount on parent re-render */}
          <MarkerLayer filtered={filtered} selected={selected} onSelect={onSelect} />
        </MapContainer>

        {/* Title overlay */}
        <div style={{
          position: 'absolute', top: 16, left: 16, zIndex: 1000, pointerEvents: 'none',
          background: 'rgba(10,26,20,0.9)', border: '1px solid #1E3328',
          borderRadius: '8px', padding: '11px 15px', backdropFilter: 'blur(10px)',
        }}>
          <div style={{ fontSize: '14px', fontWeight: '800', color: '#F0F4F2', letterSpacing: '-0.02em' }}>
            Carbon Project Explorer
          </div>
          <div style={{ fontSize: '11px', color: '#8FA89F', marginTop: '2px', letterSpacing: '0.01em' }}>
            Quality ratings × spot price premiums · {PROJECTS.length} projects
          </div>
        </div>

        {/* Legend */}
        <div style={{
          position: 'absolute', bottom: 28, left: 16, zIndex: 1000, pointerEvents: 'none',
          background: 'rgba(10,26,20,0.9)', border: '1px solid #1E3328',
          borderRadius: '8px', padding: '11px 14px', backdropFilter: 'blur(10px)',
        }}>
          <div style={{ fontSize: '10px', color: '#3A5048', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: '600' }}>
            Sylvera Rating
          </div>
          {[
            { label: 'AAA / AA / A', color: '#1D9E75' },
            { label: 'BBB / BB',     color: '#5DCAA5' },
            { label: 'B / CCC',      color: '#C8C46A' },
            { label: 'CC / D',       color: '#E09090' },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ fontSize: '11px', color: '#8FA89F' }}>{label}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #1E3328', marginTop: '7px', paddingTop: '7px', fontSize: '11px', color: '#3A5048' }}>
            Circle size = spot price
          </div>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────────── */}
      <div style={{
        width: '340px', flexShrink: 0, height: '100dvh',
        background: '#111F19', borderLeft: '1px solid #1E3328',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div className="panel-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 0' }}>

          {/* ── Filters ── */}
          <div style={{ marginBottom: '14px' }}>
            <SectionLabel>Filters</SectionLabel>

            <div style={{ marginBottom: '8px' }}>
              <FilterLabel>Region</FilterLabel>
              <PillGroup options={REGIONS} value={regionFilter} onChange={setRegionFilter} />
            </div>

            <div style={{ marginBottom: '8px' }}>
              <FilterLabel>Project type</FilterLabel>
              <PillGroup options={TYPES} value={typeFilter} onChange={setTypeFilter} />
            </div>

            <div>
              <FilterLabel>Rating</FilterLabel>
              <PillGroup options={RATINGS} value={ratingFilter} onChange={setRatingFilter} />
            </div>
          </div>

          <Divider />

          {/* ── Portfolio overview — collapses when project selected ── */}
          <div style={{
            maxHeight: selected ? '0px' : '320px',
            overflow: 'hidden',
            transition: 'max-height 300ms ease',
          }}>
            <div style={{ marginBottom: '14px' }}>
              <SectionLabel>Portfolio overview</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
                <StatCard label="Projects"    value={filtered.length}                           sub={`of ${PROJECTS.length} total`} />
                <StatCard label="Avg price"   value={avgPrice !== '—' ? `$${avgPrice}` : '—'}  sub="per tCO₂e" />
                <StatCard label="IG premium"  value={igPremium != null ? `+${igPremium}%` : '—'} sub="vs sub-investment grade" />
                <StatCard label="Highest rated" value={topProject ? topProject.rating : '—'}   sub={topProject ? topProject.name.split(' ').slice(0, 2).join(' ') + '…' : ''} />
              </div>
            </div>
            <Divider />
          </div>

          {/* ── Project detail or empty state ── */}
          {selected ? (
            <ProjectDetail
              project={selected}
              globalMin={globalMin}
              globalMax={globalMax}
              regionalStats={regionalStats}
              onClose={() => setSelected(null)}
            />
          ) : (
            <EmptyState />
          )}

          <div style={{ height: '16px' }} />
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 16px', borderTop: '1px solid #1E3328',
          fontSize: '10px', color: '#2E4A3E', lineHeight: 1.55, flexShrink: 0,
        }}>
          Prices and ratings are illustrative, calibrated to Sylvera public research
          (State of Carbon Credits 2025). Not live market data.
        </div>
      </div>
    </div>
  )
}

// ─── Project detail card ──────────────────────────────────────────────────────

function ProjectDetail({ project, regionalStats, onClose }) {
  const band = ratingBand(project.rating)
  const bg   = BADGE_BG[band]
  const fg   = BADGE_FG[band]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <SectionLabel>Selected project</SectionLabel>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: '#4A6058',
          cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '0 0 6px',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>×</button>
      </div>

      {/* Project name + tags */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#F0F4F2', lineHeight: 1.3, marginBottom: '7px', letterSpacing: '-0.02em' }}>
          {project.name}
        </div>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          <Tag>{project.region}</Tag>
          <Tag>{project.type}</Tag>
        </div>
      </div>

      {/* ① Premium dial — hero position */}
      <div style={{
        background: '#0D1A13', border: '1px solid #1E3328',
        borderRadius: '8px', padding: '14px 12px 10px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        marginBottom: '8px',
      }}>
        <div style={{ fontSize: '12px', color: '#8FA89F', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600', marginBottom: '4px', alignSelf: 'flex-start' }}>
          Regional position
        </div>
        <PremiumDial project={project} regionalStats={regionalStats} />
      </div>

      {/* ② Rating badge — supporting, smaller */}
      <div style={{
        background: bg, borderRadius: '8px',
        padding: '10px 16px', textAlign: 'center',
        marginBottom: '8px',
      }}>
        <div style={{
          fontSize: '28px', fontWeight: '800', color: fg,
          letterSpacing: '-0.03em', lineHeight: 1,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          {project.rating}
        </div>
        <div style={{ fontSize: '10px', color: fg, opacity: 0.6, marginTop: '3px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Sylvera Rating
        </div>
      </div>

      {/* Spot price */}
      <div style={{
        background: '#0D1A13', border: '1px solid #1E3328',
        borderRadius: '8px', padding: '12px', marginBottom: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', color: '#8FA89F', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>
            Spot price
          </span>
          <SpotPriceInfo />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
          <span style={{ fontSize: '36px', fontWeight: '300', color: '#F0F4F2', letterSpacing: '-0.04em', lineHeight: 1 }}>
            ${project.price}
          </span>
          <span style={{ fontSize: '14px', color: '#8FA89F' }}>/tCO₂e</span>
        </div>
      </div>

      {/* Vintage + co-benefits */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
        <div style={{ background: '#0D1A13', border: '1px solid #1E3328', borderRadius: '8px', padding: '10px 12px' }}>
          <div style={{ fontSize: '12px', color: '#8FA89F', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>Vintage</div>
          <div style={{ fontSize: '22px', fontWeight: '300', color: '#F0F4F2', letterSpacing: '-0.02em' }}>{project.vintage}</div>
        </div>
        <div style={{ background: '#0D1A13', border: '1px solid #1E3328', borderRadius: '8px', padding: '10px 12px' }}>
          <div style={{ fontSize: '12px', color: '#8FA89F', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>Co-benefits</div>
          <CoBenefitDots score={project.coBenefit} />
        </div>
      </div>
    </div>
  )
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: '10px', color: '#3A5048', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', marginBottom: '9px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {children}
    </div>
  )
}

function FilterLabel({ children }) {
  return (
    <div style={{ fontSize: '12px', color: '#8FA89F', marginBottom: '5px', fontWeight: '600', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {children}
    </div>
  )
}

function Tag({ children }) {
  return (
    <span style={{ background: '#1A2E25', color: '#8FA89F', padding: '2px 9px', borderRadius: '4px', fontSize: '12px', border: '1px solid #1E3328', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {children}
    </span>
  )
}

function Divider() {
  return <div style={{ borderTop: '1px solid #1E3328', marginBottom: '14px' }} />
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '28px 12px' }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '50%', border: '1px solid #1E3328',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 12px', color: '#3A5048', fontSize: '20px',
      }}>◎</div>
      <div style={{ fontSize: '14px', color: '#8FA89F', marginBottom: '6px', fontWeight: '600' }}>
        Click a project marker
      </div>
      <div style={{ fontSize: '12px', color: '#3A5048', lineHeight: 1.6 }}>
        Select any project on the map to view its Sylvera rating, spot price, vintage, co-benefit score, and regional position.
      </div>
    </div>
  )
}
