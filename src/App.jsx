import { useState, useMemo, useEffect, useRef, useCallback, memo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, GeoJSON, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const FONT_SANS = "'DM Sans', system-ui, sans-serif"
const FONT_MONO = "'JetBrains Mono', monospace"

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
const REGIONS  = ['All', 'N. America', 'Africa', 'SE Asia', 'Latin America', 'Europe']
const TYPES    = ['All', 'ARR', 'REDD+', 'Cookstoves', 'IFM', 'Blue Carbon']
const RATINGS  = ['All', 'D', 'CC', 'CCC', 'B', 'BB', 'BBB', 'A', 'AA', 'AAA']
const REGION_MAP = { 'N. America': 'North America' }

const GEOJSON_URL = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson'

const COUNTRY_STYLE_DEFAULT = {
  fillColor: '#000000', fillOpacity: 0,
  color: '#1E3328', weight: 0.5, opacity: 0.4,
}
const COUNTRY_STYLE_HOVER = {
  fillColor: '#1D9E75', fillOpacity: 0.18,
  color: '#5DCAA5', weight: 1, opacity: 1,
}

// ─── Rating helpers ───────────────────────────────────────────────────────────

function ratingBand(r) {
  if (['AAA', 'AA', 'A'].includes(r))  return 'high'
  if (['BBB', 'BB'].includes(r))       return 'mid'
  if (['B', 'CCC'].includes(r))        return 'low'
  return 'junk'
}

const BAND_COLORS = { high: '#1D9E75', mid: '#5DCAA5', low: '#C8C46A', junk: '#E09090' }
const BADGE_BG    = { high: '#063829', mid: '#0A2D23', low: '#23200F', junk: '#231212' }
const BADGE_FG    = { high: '#6DDBB8', mid: '#5DCAA5', low: '#C8C46A', junk: '#E09090' }

const markerColor  = r => BAND_COLORS[ratingBand(r)]
const isIG         = r => ['AAA', 'AA', 'A', 'BBB'].includes(r)
const markerRadius = p => 5 + ((p - 2.9) / (53.1 - 2.9)) * 11

// ─── PillGroup ────────────────────────────────────────────────────────────────

function PillGroup({ options, value, onChange }) {
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
            background: active ? '#1D9E75' : 'rgba(255,255,255,0.04)',
            color: active ? '#041A10' : '#5A7A6E',
            border: `1px solid ${active ? '#1D9E75' : '#1E3328'}`,
            borderRadius: '6px',
            padding: '3px 10px',
            fontSize: '11.5px',
            fontWeight: active ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.13s',
            fontFamily: FONT_SANS,
            letterSpacing: '0.01em',
          }}>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0E2018 0%, #0A1810 100%)',
      border: '1px solid #1A2E22',
      borderRadius: '10px',
      padding: '11px 13px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {accent && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, #1D9E75 0%, transparent 80%)',
        }} />
      )}
      <div style={{ fontSize: '9.5px', color: '#3A5848', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: '600', fontFamily: FONT_SANS }}>
        {label}
      </div>
      <div style={{ fontSize: '19px', fontWeight: '500', color: '#E8F0EC', letterSpacing: '-0.03em', lineHeight: 1, fontFamily: FONT_MONO }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '10px', color: '#2E4838', marginTop: '4px', fontFamily: FONT_SANS }}>{sub}</div>}
    </div>
  )
}

// ─── ProjectRow (sidebar list) ────────────────────────────────────────────────

function ProjectRow({ project, isSelected, onClick }) {
  const [hov, setHov] = useState(false)
  const color = markerColor(project.rating)
  const fg = BADGE_FG[ratingBand(project.rating)]

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%',
        background: isSelected
          ? 'rgba(29,158,117,0.1)'
          : hov ? 'rgba(255,255,255,0.03)' : 'transparent',
        border: `1px solid ${isSelected ? 'rgba(29,158,117,0.4)' : hov ? '#1A2E22' : 'transparent'}`,
        borderRadius: '8px',
        padding: '8px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.13s',
        marginBottom: '2px',
      }}
    >
      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, flexShrink: 0, marginTop: '1px' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '12.5px', fontWeight: '500', color: isSelected ? '#B8E8D8' : '#C8D8D2', fontFamily: FONT_SANS, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>
          {project.name}
        </div>
        <div style={{ fontSize: '10.5px', color: '#3A5848', fontFamily: FONT_SANS, marginTop: '1px' }}>
          {project.type} · {project.region}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '12px', fontWeight: '500', color: '#C8D8D2', fontFamily: FONT_MONO }}>${project.price}</div>
        <div style={{ fontSize: '10px', color: fg, fontFamily: FONT_MONO }}>{project.rating}</div>
      </div>
    </button>
  )
}

// ─── CoBenefitDots ────────────────────────────────────────────────────────────

function CoBenefitDots({ score }) {
  return (
    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: i < score ? '#1D9E75' : '#1A2E22',
        }} />
      ))}
      <span style={{ fontSize: '11px', color: '#4A6858', marginLeft: '3px', fontFamily: FONT_MONO }}>{score}/5</span>
    </div>
  )
}

// ─── PremiumDial ──────────────────────────────────────────────────────────────

function PremiumDial({ project, regionalStats }) {
  if (!regionalStats || regionalStats.max === regionalStats.min) return null

  const { min, max, avg } = regionalStats
  const position  = Math.max(0, Math.min(1, (project.price - min) / (max - min)))
  const angleDeg  = 180 - position * 180
  const angleRad  = (angleDeg * Math.PI) / 180

  const cx = 110, cy = 105, r = 88, needleR = 78
  const tipX = cx + needleR * Math.cos(angleRad)
  const tipY = cy - needleR * Math.sin(angleRad)

  const pct = Math.round(((project.price - avg) / avg) * 100)
  const pos = pct >= 0
  const calloutColor = pos ? '#5DCAA5' : '#C8C46A'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg viewBox="0 0 220 120" width="200" height="110" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="dialGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#E09090" />
            <stop offset="33%"  stopColor="#C8C46A" />
            <stop offset="66%"  stopColor="#5DCAA5" />
            <stop offset="100%" stopColor="#0F6E56" />
          </linearGradient>
        </defs>
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="#1A2E22" strokeWidth="10" strokeLinecap="round" />
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="url(#dialGrad)" strokeWidth="8" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={tipX} y2={tipY}
          stroke="#E8F0EC" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="6" fill="#1D9E75" />
        <circle cx={cx} cy={cy} r="2.5" fill="#E8F0EC" />
        <text x={cx - r + 4} y={cy + 16} fill="#3A5848" fontSize="10" textAnchor="middle" fontFamily={FONT_SANS}>low</text>
        <text x={cx + r - 4} y={cy + 16} fill="#3A5848" fontSize="10" textAnchor="middle" fontFamily={FONT_SANS}>high</text>
      </svg>
      <div style={{ fontSize: '13px', fontWeight: '600', color: calloutColor, marginTop: '2px', letterSpacing: '-0.02em', fontFamily: FONT_MONO }}>
        {pos ? '↑' : '↓'} {Math.abs(pct)}% {pos ? 'above' : 'below'} regional avg
      </div>
    </div>
  )
}

// ─── SpotPriceInfo popover ────────────────────────────────────────────────────

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
          color: open ? '#1D9E75' : '#3A5848',
          fontSize: '12px', lineHeight: 1, padding: '0 2px',
          transition: 'color 0.12s', fontFamily: FONT_SANS,
        }}
        aria-label="Spot price info"
      >ⓘ</button>
      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
          transform: 'translateX(-50%)', width: '240px',
          background: '#0A1810', border: '1px solid #1A2E22',
          borderRadius: '8px', padding: '11px 13px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)', zIndex: 9999,
        }}>
          <div style={{ fontSize: '11.5px', color: '#6A8878', lineHeight: 1.6, fontFamily: FONT_SANS }}>
            Spot price = current market rate per tonne CO₂e. BBB+ credits average $26/t vs $14/t for BB−, a ~86% premium.{' '}
            <span style={{ color: '#2E4838' }}>Source: Sylvera 2025.</span>
          </div>
          <div style={{
            position: 'absolute', bottom: '-5px', left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: '8px', height: '8px',
            background: '#0A1810', border: '1px solid #1A2E22',
            borderTop: 'none', borderLeft: 'none',
          }} />
        </div>
      )}
    </span>
  )
}

// ─── Map helpers ──────────────────────────────────────────────────────────────

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

// Fires setSelected(null) when user clicks bare map (not a marker)
function MapClickHandler({ onMapClick }) {
  const map = useMap()
  useEffect(() => {
    map.on('click', onMapClick)
    return () => map.off('click', onMapClick)
  }, [map, onMapClick])
  return null
}

// ─── MarkerLayer (hover glitch fixed) ────────────────────────────────────────

const MarkerLayer = memo(function MarkerLayer({ filtered, selected, onSelect }) {
  const [hoveredMarker, setHoveredMarker] = useState(null)

  return (
    <>
      {filtered.map(p => {
        const isSel = selected?.name === p.name
        const isHov = hoveredMarker === p.name && !isSel
        const color  = markerColor(p.rating)
        const baseR  = markerRadius(p.price)
        // Fixed: use +2 flat offset instead of *1.4 multiplier — avoids large jump
        const r = isSel ? baseR + 3 : isHov ? baseR + 2 : baseR
        return (
          <CircleMarker
            key={p.name}
            center={[p.lat, p.lng]}
            radius={r}
            pane="markersPane"
            pathOptions={{
              fillColor: color,
              fillOpacity: isSel ? 1 : 0.82,
              color: isSel ? '#E8F0EC' : isHov ? '#E8F0EC' : color,
              weight: isSel ? 2.5 : isHov ? 1.5 : 1,
              bubblingMouseEvents: false,
            }}
            eventHandlers={{
              click: (e) => {
                e.originalEvent.stopPropagation()
                setHoveredMarker(null)   // clear hover state immediately on click
                onSelect(p)
              },
              mouseover: () => { if (!isSel) setHoveredMarker(p.name) },
              mouseout:  () => setHoveredMarker(null),
            }}
          >
            <Tooltip direction="top" offset={[0, -(r + 3)]} opacity={1} permanent={false}>
              <strong style={{ color: '#E8F0EC', fontSize: '12px', fontFamily: FONT_SANS }}>{p.name}</strong>
              <br />
              <span style={{ color, fontFamily: FONT_MONO }}>{p.rating}</span>
              <span style={{ color: '#6A8878', fontFamily: FONT_SANS }}>{' · '}${p.price}/tCO₂e</span>
            </Tooltip>
          </CircleMarker>
        )
      })}
    </>
  )
})

// ─── ProjectModal (floats over map) ──────────────────────────────────────────

function ProjectModal({ project, regionalStats, onClose }) {
  const band = ratingBand(project.rating)
  const bg   = BADGE_BG[band]
  const fg   = BADGE_FG[band]

  return (
    <div
      className="project-modal"
      style={{
        position: 'absolute',
        top: '70px',
        right: '16px',
        width: '296px',
        maxHeight: 'calc(100dvh - 100px)',
        overflowY: 'auto',
        background: 'rgba(8, 18, 13, 0.97)',
        border: '1px solid #253D30',
        borderRadius: '14px',
        padding: '15px',
        zIndex: 1001,
        backdropFilter: 'blur(20px)',
        boxShadow: '0 32px 64px rgba(0,0,0,0.75), 0 0 0 1px rgba(29,158,117,0.08)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '13px' }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: '10px' }}>
          <div style={{ fontSize: '14.5px', fontWeight: '600', color: '#E8F0EC', lineHeight: 1.35, fontFamily: FONT_SANS, letterSpacing: '-0.01em' }}>
            {project.name}
          </div>
          <div style={{ display: 'flex', gap: '5px', marginTop: '7px', flexWrap: 'wrap' }}>
            <Tag>{project.region}</Tag>
            <Tag>{project.type}</Tag>
          </div>
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid #1A2E22',
          borderRadius: '7px',
          color: '#4A6858',
          cursor: 'pointer',
          fontSize: '15px',
          lineHeight: 1,
          width: '27px',
          height: '27px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.13s',
          fontFamily: FONT_SANS,
        }}>×</button>
      </div>

      {/* Rating + Price */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px', marginBottom: '7px' }}>
        <div style={{ background: bg, borderRadius: '10px', padding: '11px 12px' }}>
          <div style={{ fontSize: '9.5px', color: fg, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '4px', fontFamily: FONT_SANS }}>Rating</div>
          <div style={{ fontSize: '25px', fontWeight: '600', color: fg, fontFamily: FONT_MONO, letterSpacing: '-0.02em', lineHeight: 1 }}>{project.rating}</div>
        </div>
        <div style={{ background: 'rgba(12,24,18,0.9)', border: '1px solid #1A2E22', borderRadius: '10px', padding: '11px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '4px' }}>
            <span style={{ fontSize: '9.5px', color: '#4A6858', textTransform: 'uppercase', letterSpacing: '0.09em', fontFamily: FONT_SANS }}>Spot price</span>
            <SpotPriceInfo />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
            <span style={{ fontSize: '21px', fontWeight: '400', color: '#E8F0EC', fontFamily: FONT_MONO, letterSpacing: '-0.03em', lineHeight: 1 }}>${project.price}</span>
            <span style={{ fontSize: '10px', color: '#3A5848', fontFamily: FONT_SANS }}>/tCO₂e</span>
          </div>
        </div>
      </div>

      {/* Premium dial */}
      <div style={{
        background: 'rgba(12,24,18,0.9)', border: '1px solid #1A2E22',
        borderRadius: '10px', padding: '12px 12px 8px', marginBottom: '7px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{ fontSize: '9.5px', color: '#3A5848', textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: '600', marginBottom: '2px', alignSelf: 'flex-start', fontFamily: FONT_SANS }}>
          Regional position
        </div>
        <PremiumDial project={project} regionalStats={regionalStats} />
      </div>

      {/* Vintage + Co-benefits */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
        <div style={{ background: 'rgba(12,24,18,0.9)', border: '1px solid #1A2E22', borderRadius: '10px', padding: '11px 12px' }}>
          <div style={{ fontSize: '9.5px', color: '#3A5848', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '5px', fontFamily: FONT_SANS }}>Vintage</div>
          <div style={{ fontSize: '19px', fontWeight: '400', color: '#E8F0EC', fontFamily: FONT_MONO }}>{project.vintage}</div>
        </div>
        <div style={{ background: 'rgba(12,24,18,0.9)', border: '1px solid #1A2E22', borderRadius: '10px', padding: '11px 12px' }}>
          <div style={{ fontSize: '9.5px', color: '#3A5848', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '8px', fontFamily: FONT_SANS }}>Co-benefits</div>
          <CoBenefitDots score={project.coBenefit} />
        </div>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [selected, setSelected]         = useState(null)
  const [regionFilter, setRegionFilter] = useState([])
  const [typeFilter, setTypeFilter]     = useState([])
  const [ratingFilter, setRatingFilter] = useState([])
  const [worldGeo, setWorldGeo]         = useState(null)

  const onSelect = useCallback((p) => {
    setSelected(prev => prev?.name === p.name ? null : p)
  }, [])

  const onMapClick = useCallback(() => setSelected(null), [])

  useEffect(() => {
    fetch(GEOJSON_URL).then(r => r.json()).then(setWorldGeo).catch(() => {})
  }, [])

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

  const filtered = useMemo(() => PROJECTS.filter(p => {
    if (regionFilter.length > 0) {
      const mapped = regionFilter.map(r => REGION_MAP[r] || r)
      if (!mapped.includes(p.region)) return false
    }
    if (typeFilter.length > 0 && !typeFilter.includes(p.type))   return false
    if (ratingFilter.length > 0 && !ratingFilter.includes(p.rating)) return false
    return true
  }), [regionFilter, typeFilter, ratingFilter])

  const sortedFiltered = useMemo(() =>
    [...filtered].sort((a, b) =>
      RATING_INDEX[a.rating] - RATING_INDEX[b.rating] || b.price - a.price
    ), [filtered])

  const avgPrice   = filtered.length ? (filtered.reduce((s, p) => s + p.price, 0) / filtered.length).toFixed(1) : '—'
  const igAvg      = (() => { const ig  = filtered.filter(p => isIG(p.rating));  return ig.length  ? ig.reduce((s,p)  => s + p.price, 0) / ig.length  : null })()
  const subAvg     = (() => { const sub = filtered.filter(p => !isIG(p.rating)); return sub.length ? sub.reduce((s,p) => s + p.price, 0) / sub.length : null })()
  const igPremium  = igAvg && subAvg ? Math.round(((igAvg - subAvg) / subAvg) * 100) : null
  const topProject = filtered.length ? filtered.reduce((b, p) => RATING_INDEX[p.rating] < RATING_INDEX[b.rating] ? p : b, filtered[0]) : null

  const regionalStats = useMemo(() => {
    if (!selected) return null
    const peers  = PROJECTS.filter(p => p.region === selected.region)
    const prices = peers.map(p => p.price)
    return { min: Math.min(...prices), max: Math.max(...prices), avg: prices.reduce((s, x) => s + x, 0) / prices.length }
  }, [selected])

  return (
    <div style={{ display: 'flex', width: '100%', height: '100dvh', background: '#080F0A', fontFamily: FONT_SANS }}>

      {/* ── Map ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
        <MapContainer
          center={[15, 15]}
          zoom={2}
          minZoom={2}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
          worldCopyJump={false}
          maxBoundsViscosity={1.0}
          maxBounds={[[-85, -180], [85, 180]]}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            subdomains="abcd"
            maxZoom={19}
            noWrap={true}
          />

          <CreateMarkersPane />
          <MapClickHandler onMapClick={onMapClick} />

          {worldGeo && (
            <GeoJSON
              key="world-countries"
              data={worldGeo}
              style={() => COUNTRY_STYLE_DEFAULT}
              onEachFeature={onEachCountry}
              smoothFactor={0}
              pathOptions={{ interactive: true, bubblingMouseEvents: false }}
              pane="overlayPane"
            />
          )}

          <MarkerLayer filtered={filtered} selected={selected} onSelect={onSelect} />
        </MapContainer>

        {/* Title overlay */}
        <div style={{
          position: 'absolute', top: 16, left: 16, zIndex: 1000, pointerEvents: 'none',
          background: 'rgba(8,15,10,0.93)', border: '1px solid #1A2E22',
          borderRadius: '10px', padding: '10px 14px', backdropFilter: 'blur(14px)',
        }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#DDE8E3', letterSpacing: '-0.01em', fontFamily: FONT_SANS }}>
            Carbon Project Explorer
          </div>
          <div style={{ fontSize: '10px', color: '#3A5848', marginTop: '2px', fontFamily: FONT_SANS }}>
            {PROJECTS.length} projects · ratings × spot prices
          </div>
        </div>

        {/* Legend */}
        <div style={{
          position: 'absolute', bottom: 28, left: 16, zIndex: 1000, pointerEvents: 'none',
          background: 'rgba(8,15,10,0.93)', border: '1px solid #1A2E22',
          borderRadius: '10px', padding: '11px 13px', backdropFilter: 'blur(14px)',
        }}>
          <div style={{ fontSize: '9px', color: '#253D30', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: '700', fontFamily: FONT_SANS }}>
            Sylvera Rating
          </div>
          {[
            { label: 'AAA / AA / A', color: '#1D9E75' },
            { label: 'BBB / BB',     color: '#5DCAA5' },
            { label: 'B / CCC',      color: '#C8C46A' },
            { label: 'CC / D',       color: '#E09090' },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ fontSize: '10.5px', color: '#4A6858', fontFamily: FONT_SANS }}>{label}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #1A2E22', marginTop: '7px', paddingTop: '7px', fontSize: '10px', color: '#253D30', fontFamily: FONT_SANS }}>
            Circle size = spot price
          </div>
        </div>

        {/* Project modal — floats over map */}
        {selected && (
          <ProjectModal
            project={selected}
            regionalStats={regionalStats}
            onClose={() => setSelected(null)}
          />
        )}
      </div>

      {/* ── Right panel ─────────────────────────────────────────── */}
      <div style={{
        width: '310px', flexShrink: 0, height: '100dvh',
        background: '#0A1510',
        borderLeft: '1px solid #162A1E',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>

        {/* Filters section */}
        <div style={{
          padding: '14px 14px 12px',
          borderBottom: '1px solid #162A1E',
          background: 'linear-gradient(180deg, #0C1912 0%, #0A1510 100%)',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px', fontFamily: FONT_SANS }}>
            Filters
          </div>

          <div style={{ marginBottom: '9px' }}>
            <div style={{ fontSize: '9.5px', color: '#2E4838', marginBottom: '5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: FONT_SANS }}>Region</div>
            <PillGroup options={REGIONS} value={regionFilter} onChange={setRegionFilter} />
          </div>
          <div style={{ marginBottom: '9px' }}>
            <div style={{ fontSize: '9.5px', color: '#2E4838', marginBottom: '5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: FONT_SANS }}>Project type</div>
            <PillGroup options={TYPES} value={typeFilter} onChange={setTypeFilter} />
          </div>
          <div>
            <div style={{ fontSize: '9.5px', color: '#2E4838', marginBottom: '5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: FONT_SANS }}>Rating</div>
            <PillGroup options={RATINGS} value={ratingFilter} onChange={setRatingFilter} />
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ padding: '12px 12px 10px', borderBottom: '1px solid #162A1E', flexShrink: 0 }}>
          <div style={{ fontSize: '9.5px', fontWeight: '700', color: '#2E4838', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '9px', fontFamily: FONT_SANS }}>
            Overview · <span style={{ color: '#4A6858' }}>{filtered.length} projects</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <StatCard label="Avg price"  value={avgPrice !== '—' ? `$${avgPrice}` : '—'} sub="per tCO₂e" accent />
            <StatCard label="IG premium" value={igPremium != null ? `+${igPremium}%` : '—'} sub="vs sub-IG" />
            <StatCard label="Top rating" value={topProject ? topProject.rating : '—'} sub={topProject ? topProject.name.split(' ').slice(0,2).join(' ') + '…' : ''} />
            <StatCard label="Total"      value={filtered.length} sub={`of ${PROJECTS.length}`} />
          </div>
        </div>

        {/* Project list */}
        <div className="panel-scroll" style={{ flex: 1, overflowY: 'auto', padding: '10px 8px 0' }}>
          <div style={{ fontSize: '9.5px', fontWeight: '700', color: '#2E4838', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '7px', padding: '0 4px', fontFamily: FONT_SANS }}>
            Projects
          </div>
          {sortedFiltered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 12px', color: '#2E4838', fontSize: '12px', fontFamily: FONT_SANS }}>
              No projects match filters
            </div>
          ) : (
            sortedFiltered.map(p => (
              <ProjectRow
                key={p.name}
                project={p}
                isSelected={selected?.name === p.name}
                onClick={() => setSelected(prev => prev?.name === p.name ? null : p)}
              />
            ))
          )}
          <div style={{ height: '12px' }} />
        </div>

        {/* Footer */}
        <div style={{
          padding: '8px 14px',
          borderTop: '1px solid #162A1E',
          fontSize: '9.5px', color: '#1E3028', lineHeight: 1.5,
          flexShrink: 0, fontFamily: FONT_SANS,
        }}>
          Illustrative data. Calibrated to Sylvera State of Carbon Credits 2025.
        </div>
      </div>
    </div>
  )
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function Tag({ children }) {
  return (
    <span style={{
      background: 'rgba(29,158,117,0.08)',
      color: '#4A8070',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      border: '1px solid #1A3028',
      fontFamily: FONT_SANS,
    }}>
      {children}
    </span>
  )
}
