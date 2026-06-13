import { useState, useMemo, useEffect, useRef, useCallback, memo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, GeoJSON, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const FONT_SANS = "'DM Sans', system-ui, sans-serif"
const FONT_MONO = "'JetBrains Mono', monospace"

// ─── Data ─────────────────────────────────────────────────────────────────────

const PROJECTS = [
  { name: "Sumatra Peatland Restore",    region: "SE Asia",       type: "ARR",        rating: "BB",  price: 17.2, vintage: 2021, coBenefit: 3, lat: -0.5,  lng: 102.0  },
  { name: "Katingan Mentaya",            region: "SE Asia",       type: "REDD+",      rating: "BBB", price: 24.8, vintage: 2022, coBenefit: 4, lat: -1.8,  lng: 113.0  },
  { name: "Madre de Dios Corridor",      region: "Latin America", type: "REDD+",      rating: "A",   price: 31.5, vintage: 2023, coBenefit: 4, lat: -11.0, lng: -70.0  },
  { name: "Kariba REDD+",               region: "Africa",        type: "REDD+",      rating: "BB",  price: 16.4, vintage: 2020, coBenefit: 3, lat: -16.5, lng: 28.8   },
  { name: "Alto Mayo",                   region: "Latin America", type: "ARR",        rating: "BBB", price: 25.9, vintage: 2022, coBenefit: 4, lat: -6.0,  lng: -77.5  },
  { name: "Appalachian Hardwood",        region: "North America", type: "IFM",        rating: "AA",  price: 41.2, vintage: 2023, coBenefit: 4, lat: 37.5,  lng: -82.0  },
  { name: "Rimba Raya",                  region: "SE Asia",       type: "REDD+",      rating: "BBB", price: 26.3, vintage: 2021, coBenefit: 5, lat: -2.5,  lng: 112.5  },
  { name: "Cerrado Savanna",             region: "Latin America", type: "REDD+",      rating: "B",   price: 11.8, vintage: 2020, coBenefit: 2, lat: -15.0, lng: -47.0  },
  { name: "Congo Basin Protect",         region: "Africa",        type: "REDD+",      rating: "AA",  price: 43.1, vintage: 2023, coBenefit: 5, lat: -1.0,  lng: 24.0   },
  { name: "Tasman Sea Kelp",             region: "SE Asia",       type: "Blue Carbon",rating: "A",   price: 33.7, vintage: 2023, coBenefit: 5, lat: -40.0, lng: 152.0  },
  { name: "Gujarat Solar Cookstoves",    region: "SE Asia",       type: "Cookstoves", rating: "CCC", price: 7.4,  vintage: 2019, coBenefit: 2, lat: 22.0,  lng: 72.0   },
  { name: "Boreal Shield IFM",           region: "North America", type: "IFM",        rating: "AAA", price: 51.6, vintage: 2024, coBenefit: 5, lat: 52.0,  lng: -90.0  },
  { name: "Patagonia Blue Carbon",       region: "Latin America", type: "Blue Carbon",rating: "A",   price: 32.4, vintage: 2023, coBenefit: 5, lat: -48.0, lng: -74.0  },
  { name: "Mekong Delta Mangrove",       region: "SE Asia",       type: "Blue Carbon",rating: "BB",  price: 17.9, vintage: 2021, coBenefit: 4, lat: 10.0,  lng: 106.0  },
  { name: "Sahel Agroforest",            region: "Africa",        type: "ARR",        rating: "B",   price: 10.9, vintage: 2020, coBenefit: 3, lat: 13.0,  lng: 2.0    },
  { name: "Borneo Orangutan Forest",     region: "SE Asia",       type: "REDD+",      rating: "AA",  price: 44.5, vintage: 2024, coBenefit: 5, lat: 1.0,   lng: 114.0  },
  { name: "Andes Cloud Forest",          region: "Latin America", type: "ARR",        rating: "BBB", price: 27.1, vintage: 2022, coBenefit: 4, lat: -2.0,  lng: -78.0  },
  { name: "Great Lakes Afforestation",   region: "North America", type: "ARR",        rating: "BBB", price: 25.4, vintage: 2021, coBenefit: 3, lat: 45.0,  lng: -84.0  },
  { name: "Mau Forest Restore",          region: "Africa",        type: "ARR",        rating: "A",   price: 30.8, vintage: 2022, coBenefit: 4, lat: -0.5,  lng: 35.5   },
  { name: "Sundarbans Blue",             region: "SE Asia",       type: "Blue Carbon",rating: "AA",  price: 42.3, vintage: 2023, coBenefit: 5, lat: 21.9,  lng: 89.5   },
  { name: "Yucatan Biosphere",           region: "North America", type: "REDD+",      rating: "A",   price: 31.9, vintage: 2022, coBenefit: 4, lat: 20.0,  lng: -89.0  },
  { name: "Siberian Taiga Protect",      region: "Europe",        type: "IFM",        rating: "BB",  price: 18.3, vintage: 2021, coBenefit: 2, lat: 62.0,  lng: 105.0  },
  { name: "Gulf of Mexico Seagrass",     region: "North America", type: "Blue Carbon",rating: "BBB", price: 26.8, vintage: 2022, coBenefit: 4, lat: 24.0,  lng: -90.0  },
  { name: "Nile Delta Mangrove",         region: "Africa",        type: "Blue Carbon",rating: "BB",  price: 15.7, vintage: 2020, coBenefit: 3, lat: 31.0,  lng: 31.5   },
  { name: "Papua Highland ARR",          region: "SE Asia",       type: "ARR",        rating: "B",   price: 12.3, vintage: 2020, coBenefit: 2, lat: -5.0,  lng: 144.0  },
  { name: "Scottish Peatland",           region: "Europe",        type: "IFM",        rating: "AA",  price: 40.6, vintage: 2023, coBenefit: 4, lat: 57.0,  lng: -4.5   },
  { name: "Minas Gerais REDD+",          region: "Latin America", type: "REDD+",      rating: "B",   price: 11.2, vintage: 2019, coBenefit: 2, lat: -18.0, lng: -44.0  },
  { name: "Himalayan Watershed",         region: "SE Asia",       type: "ARR",        rating: "BBB", price: 24.1, vintage: 2021, coBenefit: 3, lat: 28.0,  lng: 84.0   },
  { name: "Ethiopian Highlands ARR",     region: "Africa",        type: "ARR",        rating: "BBB", price: 25.6, vintage: 2022, coBenefit: 4, lat: 9.0,   lng: 39.0   },
  { name: "Lake Tanganyika Buffer",      region: "Africa",        type: "REDD+",      rating: "A",   price: 29.7, vintage: 2022, coBenefit: 4, lat: -6.0,  lng: 29.5   },
  { name: "Oaxaca Community Forest",     region: "North America", type: "IFM",        rating: "AA",  price: 41.8, vintage: 2023, coBenefit: 5, lat: 17.0,  lng: -96.0  },
  { name: "Valdivian Rainforest",        region: "Latin America", type: "REDD+",      rating: "AA",  price: 43.7, vintage: 2024, coBenefit: 5, lat: -40.0, lng: -72.0  },
  { name: "Borneo Fire Prevent",         region: "SE Asia",       type: "REDD+",      rating: "CCC", price: 7.9,  vintage: 2019, coBenefit: 2, lat: 1.5,   lng: 110.0  },
  { name: "Rwenzori Mountains ARR",      region: "Africa",        type: "ARR",        rating: "A",   price: 31.2, vintage: 2022, coBenefit: 4, lat: 0.4,   lng: 30.0   },
  { name: "Ganges Plain Cookstoves",     region: "SE Asia",       type: "Cookstoves", rating: "CC",  price: 4.8,  vintage: 2019, coBenefit: 2, lat: 25.0,  lng: 83.0   },
  { name: "Caucasus Mountain IFM",       region: "Europe",        type: "IFM",        rating: "BBB", price: 25.1, vintage: 2021, coBenefit: 3, lat: 42.0,  lng: 44.0   },
  { name: "Amazon Headwaters",           region: "Latin America", type: "REDD+",      rating: "AAA", price: 52.4, vintage: 2024, coBenefit: 5, lat: -3.0,  lng: -62.0  },
  { name: "Pantanal Wetlands",           region: "Latin America", type: "Blue Carbon",rating: "AA",  price: 41.0, vintage: 2023, coBenefit: 5, lat: -17.0, lng: -57.0  },
  { name: "West African Cookstoves",     region: "Africa",        type: "Cookstoves", rating: "D",   price: 2.9,  vintage: 2019, coBenefit: 1, lat: 7.0,   lng: -1.0   },
  { name: "Viet Bac REDD+",             region: "SE Asia",       type: "REDD+",      rating: "BB",  price: 16.8, vintage: 2020, coBenefit: 3, lat: 22.0,  lng: 105.0  },
  { name: "Iberian Cork Oak IFM",        region: "Europe",        type: "IFM",        rating: "A",   price: 30.2, vintage: 2022, coBenefit: 4, lat: 38.5,  lng: -8.0   },
  { name: "Caribbean Coral-Carbon",      region: "North America", type: "Blue Carbon",rating: "AAA", price: 53.1, vintage: 2024, coBenefit: 5, lat: 17.0,  lng: -66.0  },
  { name: "Tigris Riparian Restore",     region: "Europe",        type: "ARR",        rating: "BB",  price: 17.5, vintage: 2021, coBenefit: 3, lat: 33.0,  lng: 44.0   },
  { name: "Niger Delta Mangrove",        region: "Africa",        type: "Blue Carbon",rating: "BB",  price: 15.2, vintage: 2020, coBenefit: 3, lat: 4.5,   lng: 6.0    },
  { name: "Uzbek Steppe ARR",            region: "Europe",        type: "ARR",        rating: "CCC", price: 8.1,  vintage: 2019, coBenefit: 2, lat: 41.0,  lng: 64.0   },
  { name: "Laos Watershed REDD+",        region: "SE Asia",       type: "REDD+",      rating: "B",   price: 12.7, vintage: 2020, coBenefit: 2, lat: 18.0,  lng: 103.0  },
  { name: "Parana Atlantic Forest",      region: "Latin America", type: "ARR",        rating: "BBB", price: 26.5, vintage: 2022, coBenefit: 4, lat: -24.0, lng: -51.0  },
  { name: "Saharan Edge Cookstoves",     region: "Africa",        type: "Cookstoves", rating: "CC",  price: 5.1,  vintage: 2019, coBenefit: 1, lat: 15.0,  lng: 17.0   },
  { name: "British Columbia IFM",        region: "North America", type: "IFM",        rating: "AAA", price: 51.9, vintage: 2024, coBenefit: 5, lat: 54.0,  lng: -124.0 },
  { name: "Caspian Littoral Blue",       region: "Europe",        type: "Blue Carbon",rating: "A",   price: 29.5, vintage: 2022, coBenefit: 4, lat: 41.5,  lng: 51.0   },
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
  fillColor: '#000', fillOpacity: 0,
  color: '#1A2A1E', weight: 0.6, opacity: 0.5,
}
const COUNTRY_STYLE_HOVER = {
  fillColor: '#1D9E75', fillOpacity: 0.15,
  color: '#1D9E75', weight: 1.2, opacity: 0.9,
}

// ─── Rating helpers ───────────────────────────────────────────────────────────

function ratingBand(r) {
  if (['AAA', 'AA', 'A'].includes(r))  return 'high'
  if (['BBB', 'BB'].includes(r))       return 'mid'
  if (['B', 'CCC'].includes(r))        return 'low'
  return 'junk'
}

const BAND_COLORS = { high: '#1D9E75', mid: '#5DCAA5', low: '#C8C46A', junk: '#E09090' }
const BADGE_BG    = { high: '#041E12', mid: '#071F18', low: '#1A1A08', junk: '#1A0808' }
const BADGE_FG    = { high: '#5DCAA5', mid: '#5DCAA5', low: '#C8C46A', junk: '#E09090' }

const markerColor  = r => BAND_COLORS[ratingBand(r)]
const isIG         = r => ['AAA', 'AA', 'A', 'BBB'].includes(r)
const markerRadius = p => 5 + ((p - 2.9) / (53.1 - 2.9)) * 11

// ─── Map infrastructure ───────────────────────────────────────────────────────

// Creates markersPane (z650) and labelsPane (z700, no pointer events)
function CreatePanes() {
  const map = useMap()
  useEffect(() => {
    if (!map.getPane('markersPane')) {
      map.createPane('markersPane')
      map.getPane('markersPane').style.zIndex = 650
    }
    if (!map.getPane('labelsPane')) {
      map.createPane('labelsPane')
      map.getPane('labelsPane').style.zIndex = 700
      map.getPane('labelsPane').style.pointerEvents = 'none'
    }
  }, [map])
  return null
}

// Fit world on mount, fly to project on change, emit screen position after moveend
function MapController({ project, onMapReady, onProjectPositioned, onMapClick }) {
  const map = useMap()

  useEffect(() => {
    onMapReady(map)
    // Use setTimeout(0) so the container has its final pixel dimensions
    const t = setTimeout(() => {
      map.invalidateSize(false)
      map.fitBounds([[-68, -176], [82, 176]], { padding: [0, 0], animate: false })
      map.setMinZoom(map.getZoom())
    }, 0)
    map.on('click', onMapClick)
    return () => { clearTimeout(t); map.off('click', onMapClick) }
  }, [onMapClick]) // eslint-disable-line

  useEffect(() => {
    if (!project) return
    map.flyTo([project.lat, project.lng], 5, { duration: 0.8, easeLinearity: 0.35 })
    const handler = () => {
      const pt = map.latLngToContainerPoint([project.lat, project.lng])
      const sz = map.getSize()
      onProjectPositioned({ x: pt.x, y: pt.y, mapW: sz.x, mapH: sz.y })
    }
    map.once('moveend', handler)
    return () => map.off('moveend', handler)
  }, [project, onProjectPositioned])

  return null
}

// ─── Marker layer ─────────────────────────────────────────────────────────────

const MarkerLayer = memo(function MarkerLayer({ filtered, selected, onSelect }) {
  const [hoveredMarker, setHoveredMarker] = useState(null)

  return (
    <>
      {filtered.map(p => {
        const isSel  = selected?.name === p.name
        const isHov  = hoveredMarker === p.name && !isSel
        const color  = markerColor(p.rating)
        const baseR  = markerRadius(p.price)
        const r = isSel ? baseR + 3 : isHov ? baseR + 2 : baseR
        return (
          <CircleMarker
            key={p.name}
            center={[p.lat, p.lng]}
            radius={r}
            pane="markersPane"
            pathOptions={{
              fillColor: color, fillOpacity: isSel ? 1 : 0.85,
              color: isSel ? '#E8F0EC' : isHov ? '#E8F0EC' : color,
              weight: isSel ? 2.5 : isHov ? 1.5 : 1,
              bubblingMouseEvents: false,
            }}
            eventHandlers={{
              click: (e) => {
                e.originalEvent.stopPropagation()
                setHoveredMarker(null)
                onSelect(p)
              },
              mouseover: () => { if (!isSel) setHoveredMarker(p.name) },
              mouseout:  () => setHoveredMarker(null),
            }}
          >
            <Tooltip direction="top" offset={[0, -(r + 3)]} opacity={1} permanent={false}>
              <strong style={{ color: '#E8F0EC', fontFamily: FONT_SANS }}>{p.name}</strong>
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

// ─── PillGroup ────────────────────────────────────────────────────────────────

function PillGroup({ options, value, onChange }) {
  const toggle = opt => {
    if (opt === 'All') { onChange([]); return }
    onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt])
  }
  const isActive = opt => opt === 'All' ? value.length === 0 : value.includes(opt)

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {options.map(opt => {
        const active = isActive(opt)
        return (
          <button key={opt} onClick={() => toggle(opt)} style={{
            background: active ? '#1D9E75' : 'transparent',
            color: active ? '#030D07' : '#354D42',
            border: `1px solid ${active ? '#1D9E75' : '#1A2A1E'}`,
            borderRadius: '5px', padding: '3px 9px',
            fontSize: '11px', fontWeight: active ? '700' : '400',
            cursor: 'pointer', transition: 'all 0.12s',
            fontFamily: FONT_SANS, letterSpacing: '0.01em',
          }}>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

// ─── CoBenefitDots ────────────────────────────────────────────────────────────

function CoBenefitDots({ score }) {
  return (
    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: i < score ? '#1D9E75' : '#162018',
        }} />
      ))}
      <span style={{ fontSize: '11px', color: '#354D42', marginLeft: '3px', fontFamily: FONT_MONO }}>{score}/5</span>
    </div>
  )
}

// ─── PremiumDial ──────────────────────────────────────────────────────────────

function PremiumDial({ project, regionalStats }) {
  if (!regionalStats || regionalStats.max === regionalStats.min) return null
  const { min, max, avg } = regionalStats
  const position = Math.max(0, Math.min(1, (project.price - min) / (max - min)))
  const angleDeg = 180 - position * 180
  const angleRad = (angleDeg * Math.PI) / 180
  const cx = 110, cy = 105, r = 88, needleR = 78
  const tipX = cx + needleR * Math.cos(angleRad)
  const tipY = cy - needleR * Math.sin(angleRad)
  const pct = Math.round(((project.price - avg) / avg) * 100)
  const pos = pct >= 0

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
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke="#162018" strokeWidth="10" strokeLinecap="round" />
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke="url(#dialGrad)" strokeWidth="8" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={tipX} y2={tipY} stroke="#D8E6DF" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="6" fill="#1D9E75" />
        <circle cx={cx} cy={cy} r="2.5" fill="#D8E6DF" />
        <text x={cx-r+4} y={cy+16} fill="#2E4038" fontSize="10" textAnchor="middle" fontFamily={FONT_SANS}>low</text>
        <text x={cx+r-4} y={cy+16} fill="#2E4038" fontSize="10" textAnchor="middle" fontFamily={FONT_SANS}>high</text>
      </svg>
      <div style={{ fontSize: '12.5px', fontWeight: '600', color: pos ? '#5DCAA5' : '#C8C46A', marginTop: '2px', fontFamily: FONT_MONO, letterSpacing: '-0.02em' }}>
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
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: open ? '#1D9E75' : '#2E4038', fontSize: '12px',
        lineHeight: 1, padding: '0 2px', fontFamily: FONT_SANS,
      }} aria-label="info">ⓘ</button>
      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
          transform: 'translateX(-50%)', width: '230px',
          background: '#060B07', border: '1px solid #1A2A1E',
          borderRadius: '8px', padding: '10px 12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.7)', zIndex: 9999,
        }}>
          <div style={{ fontSize: '11px', color: '#4A6858', lineHeight: 1.6, fontFamily: FONT_SANS }}>
            Spot price = market rate per tonne CO₂e. BBB+ credits average $26/t vs $14/t for BB−, a ~86% premium.{' '}
            <span style={{ color: '#1E3028' }}>Source: Sylvera 2025.</span>
          </div>
          <div style={{ position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: '8px', height: '8px', background: '#060B07', border: '1px solid #1A2A1E', borderTop: 'none', borderLeft: 'none' }} />
        </div>
      )}
    </span>
  )
}

// ─── Project modal (dynamic position, right of marker) ────────────────────────

const MODAL_W = 292
const MODAL_H = 460

function ProjectModal({ project, regionalStats, onClose, markerPos }) {
  const band = ratingBand(project.rating)
  const bg   = BADGE_BG[band]
  const fg   = BADGE_FG[band]

  // Compute position relative to marker pixel coords
  const posStyle = useMemo(() => {
    if (!markerPos) return { top: 72, right: 16 }
    const { x, y, mapW, mapH } = markerPos
    const OFF = 22, PAD = 14
    let left = x + OFF
    let top  = y - MODAL_H / 2
    if (left + MODAL_W > mapW - PAD) left = x - MODAL_W - OFF
    if (left < PAD) left = PAD
    if (top < 72) top = 72
    if (top + MODAL_H > mapH - PAD) top = mapH - MODAL_H - PAD
    return { left, top }
  }, [markerPos])

  return (
    <div className="project-modal" style={{
      position: 'absolute', ...posStyle, width: `${MODAL_W}px`,
      maxHeight: `calc(100dvh - 100px)`, overflowY: 'auto',
      background: '#050908', border: '1px solid #1A2A1E',
      borderRadius: '12px', padding: '14px', zIndex: 1001,
      backdropFilter: 'blur(20px)',
      boxShadow: '0 28px 56px rgba(0,0,0,0.85), 0 0 0 1px rgba(29,158,117,0.07)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: '10px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#D8E6DF', lineHeight: 1.35, fontFamily: FONT_SANS, letterSpacing: '-0.01em' }}>
            {project.name}
          </div>
          <div style={{ display: 'flex', gap: '5px', marginTop: '6px', flexWrap: 'wrap' }}>
            <Tag>{project.region}</Tag>
            <Tag>{project.type}</Tag>
          </div>
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2A1E',
          borderRadius: '6px', color: '#354D42', cursor: 'pointer',
          fontSize: '15px', lineHeight: 1, width: '26px', height: '26px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          fontFamily: FONT_SANS,
        }}>×</button>
      </div>

      {/* Rating + Price */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px', marginBottom: '7px' }}>
        <div style={{ background: bg, borderRadius: '8px', padding: '10px 12px' }}>
          <div style={{ fontSize: '9px', color: fg, opacity: 0.55, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px', fontFamily: FONT_SANS }}>Rating</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: fg, fontFamily: FONT_MONO, letterSpacing: '-0.02em', lineHeight: 1 }}>{project.rating}</div>
        </div>
        <div style={{ background: '#0B1410', border: '1px solid #1A2A1E', borderRadius: '8px', padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '4px' }}>
            <span style={{ fontSize: '9px', color: '#354D42', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: FONT_SANS }}>Spot price</span>
            <SpotPriceInfo />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
            <span style={{ fontSize: '20px', fontWeight: '400', color: '#C8A23A', fontFamily: FONT_MONO, letterSpacing: '-0.03em', lineHeight: 1 }}>${project.price}</span>
            <span style={{ fontSize: '9px', color: '#2E4038', fontFamily: FONT_SANS }}>/tCO₂e</span>
          </div>
        </div>
      </div>

      {/* Dial */}
      <div style={{ background: '#0B1410', border: '1px solid #1A2A1E', borderRadius: '8px', padding: '11px 12px 7px', marginBottom: '7px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: '9px', color: '#2E4038', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600', marginBottom: '2px', alignSelf: 'flex-start', fontFamily: FONT_SANS }}>Regional position</div>
        <PremiumDial project={project} regionalStats={regionalStats} />
      </div>

      {/* Vintage + Co-benefits */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
        <div style={{ background: '#0B1410', border: '1px solid #1A2A1E', borderRadius: '8px', padding: '10px 12px' }}>
          <div style={{ fontSize: '9px', color: '#2E4038', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px', fontFamily: FONT_SANS }}>Vintage</div>
          <div style={{ fontSize: '18px', fontWeight: '400', color: '#D8E6DF', fontFamily: FONT_MONO }}>{project.vintage}</div>
        </div>
        <div style={{ background: '#0B1410', border: '1px solid #1A2A1E', borderRadius: '8px', padding: '10px 12px' }}>
          <div style={{ fontSize: '9px', color: '#2E4038', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '7px', fontFamily: FONT_SANS }}>Co-benefits</div>
          <CoBenefitDots score={project.coBenefit} />
        </div>
      </div>
    </div>
  )
}

// ─── Walkthrough modal ────────────────────────────────────────────────────────

function WTSection({ title, children }) {
  return (
    <div style={{ marginBottom: '22px' }}>
      <div style={{ fontSize: '9px', fontWeight: '700', color: '#1A2A1E', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '10px', fontFamily: FONT_SANS }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function WalkthroughModal({ onClose }) {
  const [dontShow, setDontShow] = useState(false)
  const close = () => {
    if (dontShow) localStorage.setItem('cpe_seen', '1')
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.82)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(5px)',
    }}>
      <div style={{
        background: '#060B07', border: '1px solid #162018',
        borderRadius: '14px', width: '540px', maxHeight: '88vh',
        overflowY: 'auto', padding: '28px',
      }} className="panel-scroll">
        {/* Header */}
        <div style={{ marginBottom: '26px' }}>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#D8E6DF', fontFamily: FONT_SANS, letterSpacing: '-0.025em', marginBottom: '5px' }}>
            Carbon Project Explorer
          </div>
          <div style={{ fontSize: '12.5px', color: '#2E4038', fontFamily: FONT_SANS }}>
            A guide to ratings, map navigation, and data interpretation
          </div>
        </div>

        {/* Rating system */}
        <WTSection title="Sylvera Rating System">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { band: 'AAA / AA / A',  label: 'Investment Grade',        color: '#5DCAA5', bg: '#041E12', desc: 'Highest quality. Rigorous validation, fully additional and permanent credits.' },
              { band: 'BBB / BB',      label: 'Near Investment Grade',    color: '#5DCAA5', bg: '#071F18', desc: 'Solid quality. Strong methodology with minor data or process gaps.' },
              { band: 'B / CCC',       label: 'Below Investment Grade',   color: '#C8C46A', bg: '#1A1A08', desc: 'Below average quality. Significant methodology or additionality concerns.' },
              { band: 'CC / D',        label: 'Speculative / Default',    color: '#E09090', bg: '#1A0808', desc: 'High risk. Serious concerns about credit integrity or permanence.' },
            ].map(r => (
              <div key={r.band} style={{ background: r.bg, border: `1px solid ${r.color}18`, borderRadius: '8px', padding: '10px 14px', display: 'flex', gap: '14px' }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: '13px', fontWeight: '600', color: r.color, minWidth: '76px', paddingTop: '1px', flexShrink: 0 }}>{r.band}</div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: r.color, fontFamily: FONT_SANS, marginBottom: '2px' }}>{r.label}</div>
                  <div style={{ fontSize: '11px', color: '#354D42', fontFamily: FONT_SANS, lineHeight: 1.55 }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </WTSection>

        {/* Map */}
        <WTSection title="Map Navigation">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              ['Circle markers', 'Each dot = one carbon project. Circle size scales with spot price — larger = more expensive.', '#1D9E75'],
              ['Click a marker', 'Zooms into that project\'s location and opens a detail card to the right of the marker.', '#1D9E75'],
              ['Hover a country', 'Highlights the country boundary and shows its name.', '#1D9E75'],
              ['Click map background', 'Closes the detail card and returns to full overview.', '#354D42'],
            ].map(([k, v, c]) => (
              <div key={k} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: '11px', color: c, minWidth: '100px', paddingTop: '1px', flexShrink: 0 }}>{k}</div>
                <div style={{ fontSize: '11.5px', color: '#354D42', fontFamily: FONT_SANS, lineHeight: 1.55 }}>{v}</div>
              </div>
            ))}
          </div>
        </WTSection>

        {/* Sidebar */}
        <WTSection title="Sidebar & Filters">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              ['Filters', 'Filter by Region, Project Type, and Rating. Multi-select works as OR — picking Africa + SE Asia shows both.', '#C8A23A'],
              ['Stats', 'Average spot price, IG premium, and project count all update live as you apply filters.', '#C8A23A'],
              ['Project list', 'Sorted by rating then price. Click any row to zoom the map and open its detail card.', '#C8A23A'],
            ].map(([k, v, c]) => (
              <div key={k} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: '11px', color: c, minWidth: '100px', paddingTop: '1px', flexShrink: 0 }}>{k}</div>
                <div style={{ fontSize: '11.5px', color: '#354D42', fontFamily: FONT_SANS, lineHeight: 1.55 }}>{v}</div>
              </div>
            ))}
          </div>
        </WTSection>

        {/* Detail card */}
        <WTSection title="Project Detail Card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              ['Spot price', 'Current market rate per tonne of CO₂ equivalent removed or avoided. Shown in amber.'],
              ['Regional dial', 'Semicircle gauge showing where this project\'s price sits within its regional peer group (min → max). Needle near right = premium-priced.'],
              ['Co-benefits', 'Score out of 5 for biodiversity, community welfare, and ecosystem services beyond carbon.'],
              ['Vintage', 'Year the carbon credits were generated, not purchased.'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: '11px', color: '#5DCAA5', minWidth: '100px', paddingTop: '1px', flexShrink: 0 }}>{k}</div>
                <div style={{ fontSize: '11.5px', color: '#354D42', fontFamily: FONT_SANS, lineHeight: 1.55 }}>{v}</div>
              </div>
            ))}
          </div>
        </WTSection>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #162018' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={dontShow} onChange={e => setDontShow(e.target.checked)} style={{ accentColor: '#1D9E75', width: '13px', height: '13px' }} />
            <span style={{ fontSize: '11.5px', color: '#2E4038', fontFamily: FONT_SANS }}>Don't show on next visit</span>
          </label>
          <button onClick={close} style={{
            background: '#1D9E75', border: 'none', borderRadius: '7px',
            color: '#020D06', fontSize: '13px', fontWeight: '700',
            padding: '9px 22px', cursor: 'pointer', fontFamily: FONT_SANS, letterSpacing: '-0.01em',
          }}>
            Got it →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Sidebar project row ───────────────────────────────────────────────────────

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
        background: isSelected ? 'rgba(29,158,117,0.09)' : hov ? 'rgba(255,255,255,0.025)' : 'transparent',
        border: `1px solid ${isSelected ? 'rgba(29,158,117,0.35)' : hov ? '#1A2A1E' : 'transparent'}`,
        borderRadius: '7px', padding: '8px 9px',
        display: 'flex', alignItems: 'center', gap: '9px',
        cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s', marginBottom: '2px',
      }}
    >
      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '12px', fontWeight: '500', color: isSelected ? '#A8D4C0' : '#8AADA0', fontFamily: FONT_SANS, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>
          {project.name}
        </div>
        <div style={{ fontSize: '10px', color: '#253530', fontFamily: FONT_SANS, marginTop: '1px' }}>
          {project.type} · {project.region}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '11.5px', fontWeight: '500', color: '#C8A23A', fontFamily: FONT_MONO }}>${project.price}</div>
        <div style={{ fontSize: '10px', color: fg, fontFamily: FONT_MONO }}>{project.rating}</div>
      </div>
    </button>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [selected, setSelected]         = useState(null)
  const [regionFilter, setRegionFilter] = useState([])
  const [typeFilter, setTypeFilter]     = useState([])
  const [ratingFilter, setRatingFilter] = useState([])
  const [worldGeo, setWorldGeo]         = useState(null)
  const [markerPos, setMarkerPos]       = useState(null)  // pixel position of selected marker
  const [showWalkthrough, setShowWalkthrough] = useState(false)

  // Auto-open walkthrough on first visit
  useEffect(() => {
    if (!localStorage.getItem('cpe_seen')) setShowWalkthrough(true)
  }, [])

  const onSelect = useCallback((p) => {
    setSelected(prev => {
      if (prev?.name === p.name) { setMarkerPos(null); return null }
      return p
    })
    setMarkerPos(null)  // reset while map flies
  }, [])

  const onMapReady = useCallback(() => {}, [])
  const onProjectPositioned = useCallback((pos) => setMarkerPos(pos), [])
  const onMapClick = useCallback(() => { setSelected(null); setMarkerPos(null) }, [])

  useEffect(() => {
    if (!selected) setMarkerPos(null)
  }, [selected])

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
    if (typeFilter.length > 0 && !typeFilter.includes(p.type))       return false
    if (ratingFilter.length > 0 && !ratingFilter.includes(p.rating)) return false
    return true
  }), [regionFilter, typeFilter, ratingFilter])

  const sortedFiltered = useMemo(() =>
    [...filtered].sort((a, b) => RATING_INDEX[a.rating] - RATING_INDEX[b.rating] || b.price - a.price),
  [filtered])

  const avgPrice  = filtered.length ? (filtered.reduce((s, p) => s + p.price, 0) / filtered.length).toFixed(1) : null
  const igAvg     = (() => { const ig  = filtered.filter(p => isIG(p.rating));  return ig.length  ? ig.reduce((s,p)  => s + p.price, 0) / ig.length  : null })()
  const subAvg    = (() => { const sub = filtered.filter(p => !isIG(p.rating)); return sub.length ? sub.reduce((s,p) => s + p.price, 0) / sub.length : null })()
  const igPremium = igAvg && subAvg ? Math.round(((igAvg - subAvg) / subAvg) * 100) : null

  const regionalStats = useMemo(() => {
    if (!selected) return null
    const peers  = PROJECTS.filter(p => p.region === selected.region)
    const prices = peers.map(p => p.price)
    return { min: Math.min(...prices), max: Math.max(...prices), avg: prices.reduce((s, x) => s + x, 0) / prices.length }
  }, [selected])

  return (
    <div style={{ display: 'flex', width: '100%', height: '100dvh', background: '#040807', fontFamily: FONT_SANS }}>

      {showWalkthrough && <WalkthroughModal onClose={() => setShowWalkthrough(false)} />}

      {/* ── Map ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
        <MapContainer
          center={[20, 10]} zoom={2} minZoom={1}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
          worldCopyJump={false}
          maxBoundsViscosity={0.9}
          maxBounds={[[-80, -185], [88, 185]]}
        >
          <CreatePanes />
          <MapController
            project={selected}
            onMapReady={onMapReady}
            onProjectPositioned={onProjectPositioned}
            onMapClick={onMapClick}
          />

          {/* ESRI Dark Gray Base — English labels on reference layer */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; <a href="https://esri.com">Esri</a>'
            maxZoom={16}
            noWrap={true}
            bounds={[[-90, -180], [90, 180]]}
          />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
            maxZoom={16}
            noWrap={true}
            pane="labelsPane"
            bounds={[[-90, -180], [90, 180]]}
          />

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

        {/* Title + walkthrough trigger */}
        <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 1000, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'rgba(4,8,7,0.96)', border: '1px solid #162018',
            borderRadius: '10px', padding: '12px 16px', backdropFilter: 'blur(16px)',
            pointerEvents: 'none',
          }}>
            <div style={{ fontSize: '17px', fontWeight: '800', color: '#C8E0D4', letterSpacing: '-0.025em', fontFamily: FONT_SANS }}>
              Carbon Project Explorer
            </div>
            <div style={{ fontSize: '10px', color: '#253530', marginTop: '3px', fontFamily: FONT_SANS, letterSpacing: '0.01em' }}>
              {PROJECTS.length} projects · Sylvera ratings × spot prices
            </div>
          </div>
          <button
            onClick={() => setShowWalkthrough(true)}
            title="How to use"
            style={{
              width: '34px', height: '34px',
              background: 'rgba(4,8,7,0.96)', border: '1px solid #1D9E75',
              borderRadius: '50%', color: '#1D9E75',
              cursor: 'pointer', fontSize: '13px', fontWeight: '700',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(16px)', fontFamily: FONT_MONO,
            }}
          >?</button>
        </div>

        {/* Legend */}
        <div style={{
          position: 'absolute', bottom: 28, left: 16, zIndex: 1000, pointerEvents: 'none',
          background: 'rgba(4,8,7,0.96)', border: '1px solid #162018',
          borderRadius: '10px', padding: '11px 13px', backdropFilter: 'blur(16px)',
        }}>
          <div style={{ fontSize: '8.5px', color: '#1A2A1E', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px', fontWeight: '700', fontFamily: FONT_SANS }}>Sylvera Rating</div>
          {[
            { label: 'AAA / AA / A', color: '#1D9E75' },
            { label: 'BBB / BB',     color: '#5DCAA5' },
            { label: 'B / CCC',      color: '#C8C46A' },
            { label: 'CC / D',       color: '#E09090' },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ fontSize: '10px', color: '#354D42', fontFamily: FONT_SANS }}>{label}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #162018', marginTop: '7px', paddingTop: '7px', fontSize: '9.5px', color: '#1A2A1E', fontFamily: FONT_SANS }}>Circle size = spot price</div>
        </div>

        {/* Project modal — positioned to right of clicked marker */}
        {selected && (
          <ProjectModal
            project={selected}
            regionalStats={regionalStats}
            onClose={() => { setSelected(null); setMarkerPos(null) }}
            markerPos={markerPos}
          />
        )}
      </div>

      {/* ── Sidebar ───────────────────────────────────────── */}
      <div style={{
        width: '295px', flexShrink: 0, height: '100dvh',
        background: '#040807',
        borderLeft: '1px solid #0E1810',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>

        {/* Filters */}
        <div style={{ padding: '16px 14px 14px', borderBottom: '1px solid #0E1810', flexShrink: 0 }}>
          <div style={{ fontSize: '9px', fontWeight: '800', color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: FONT_SANS, marginBottom: '13px' }}>
            Filters
          </div>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '9px', color: '#1A2A1E', marginBottom: '5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.09em', fontFamily: FONT_SANS }}>Region</div>
            <PillGroup options={REGIONS} value={regionFilter} onChange={setRegionFilter} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '9px', color: '#1A2A1E', marginBottom: '5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.09em', fontFamily: FONT_SANS }}>Project type</div>
            <PillGroup options={TYPES} value={typeFilter} onChange={setTypeFilter} />
          </div>
          <div>
            <div style={{ fontSize: '9px', color: '#1A2A1E', marginBottom: '5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.09em', fontFamily: FONT_SANS }}>Rating</div>
            <PillGroup options={RATINGS} value={ratingFilter} onChange={setRatingFilter} />
          </div>
        </div>

        {/* Bold stats — flat, no gradients */}
        <div style={{ padding: '20px 16px 18px', borderBottom: '1px solid #0E1810', flexShrink: 0 }}>
          {/* Avg price — hero number in amber */}
          {avgPrice && (
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '8.5px', color: '#1A2A1E', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: FONT_SANS, marginBottom: '3px' }}>Avg spot price</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                <span style={{ fontSize: '44px', fontWeight: '800', color: '#C8A23A', letterSpacing: '-0.05em', lineHeight: 1, fontFamily: FONT_MONO }}>${avgPrice}</span>
                <span style={{ fontSize: '11px', color: '#253530', fontFamily: FONT_SANS, paddingBottom: '6px' }}>/tCO₂e</span>
              </div>
            </div>
          )}

          {/* IG premium */}
          {igPremium !== null && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '8.5px', color: '#1A2A1E', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: FONT_SANS, marginBottom: '3px' }}>IG vs sub-IG premium</div>
              <span style={{ fontSize: '28px', fontWeight: '700', color: '#1D9E75', letterSpacing: '-0.035em', lineHeight: 1, fontFamily: FONT_MONO }}>+{igPremium}%</span>
            </div>
          )}

          {/* Count */}
          <div>
            <div style={{ fontSize: '8.5px', color: '#1A2A1E', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: FONT_SANS, marginBottom: '3px' }}>Projects</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '28px', fontWeight: '700', color: '#6A9080', letterSpacing: '-0.035em', lineHeight: 1, fontFamily: FONT_MONO }}>{filtered.length}</span>
              <span style={{ fontSize: '11px', color: '#1A2A1E', fontFamily: FONT_SANS }}>of {PROJECTS.length}</span>
            </div>
          </div>
        </div>

        {/* Project list */}
        <div className="panel-scroll" style={{ flex: 1, overflowY: 'auto', padding: '10px 8px 0' }}>
          <div style={{ fontSize: '8.5px', fontWeight: '800', color: '#162018', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px', padding: '0 3px', fontFamily: FONT_SANS }}>
            Projects
          </div>
          {sortedFiltered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 12px', color: '#1A2A1E', fontSize: '12px', fontFamily: FONT_SANS }}>No projects match filters</div>
          ) : sortedFiltered.map(p => (
            <ProjectRow
              key={p.name}
              project={p}
              isSelected={selected?.name === p.name}
              onClick={() => onSelect(p)}
            />
          ))}
          <div style={{ height: '12px' }} />
        </div>

        {/* Footer */}
        <div style={{ padding: '8px 14px', borderTop: '1px solid #0E1810', fontSize: '9px', color: '#111C14', lineHeight: 1.5, flexShrink: 0, fontFamily: FONT_SANS }}>
          Illustrative data. Calibrated to Sylvera State of Carbon Credits 2025.
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Tag({ children }) {
  return (
    <span style={{
      background: 'rgba(29,158,117,0.07)', color: '#354D42',
      padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px',
      border: '1px solid #162018', fontFamily: FONT_SANS,
    }}>
      {children}
    </span>
  )
}
