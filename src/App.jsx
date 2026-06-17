import { useState, useMemo, useEffect, useRef, useCallback, memo } from 'react'
import { createPortal } from 'react-dom'
import { MapContainer, TileLayer, CircleMarker, Tooltip, GeoJSON, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const FONT_SANS = "'Geologica', system-ui, sans-serif"
const FONT_MONO = "'JetBrains Mono', monospace"
const FONT_SYNE = "'Syne', system-ui, sans-serif"
const FONT_COND = "'Gondens', system-ui, sans-serif"
const SIDEBAR_W = 330

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

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconFilter() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <line x1="1" y1="2.5" x2="11" y2="2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="3" y1="6" x2="9" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="5" y1="9.5" x2="7" y2="9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function IconChart() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <rect x="1" y="6.5" width="2.5" height="4.5" rx="0.5" fill="currentColor"/>
      <rect x="4.75" y="4" width="2.5" height="7" rx="0.5" fill="currentColor"/>
      <rect x="8.5" y="1.5" width="2.5" height="9.5" rx="0.5" fill="currentColor"/>
    </svg>
  )
}

function IconList() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="2" cy="3" r="1" fill="currentColor"/>
      <line x1="5" y1="3" x2="11" y2="3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="2" cy="6.5" r="1" fill="currentColor"/>
      <line x1="5" y1="6.5" x2="11" y2="6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="2" cy="10" r="1" fill="currentColor"/>
      <line x1="5" y1="10" x2="11" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function IconChevron({ open }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── Map infrastructure ───────────────────────────────────────────────────────

function CreatePanes() {
  const map = useMap()
  useEffect(() => {
    if (!map.getPane('markersPane')) {
      const pane = map.createPane('markersPane')
      pane.style.zIndex = 710
      // Remove zoom animation so markers don't visually scale during flyTo
      pane.classList.remove('leaflet-zoom-animated')
    }
    if (!map.getPane('labelsPane')) {
      const pane = map.createPane('labelsPane')
      pane.style.zIndex = 700
      pane.style.pointerEvents = 'none'
    }
    // Tooltips must render above markers
    const tooltipPane = map.getPane('tooltipPane')
    if (tooltipPane) tooltipPane.style.zIndex = 750
  }, [map])
  return null
}

// Fit world on mount, fly to project on change, emit screen position after moveend
function MapController({ project, onMapReady, onProjectPositioned, onMapClick }) {
  const map = useMap()

  useEffect(() => {
    onMapReady(map)
    const t = setTimeout(() => {
      map.invalidateSize(false)
      map.fitBounds([[-68, -176], [82, 176]], { padding: [0, 0], animate: false })
      const sz = map.getSize()
      const minFillZoom = Math.ceil(Math.log2(sz.x / 256))
      if (map.getZoom() < minFillZoom) map.setZoom(minFillZoom, { animate: false })
      map.setMinZoom(map.getZoom())
    }, 0)
    map.on('click', onMapClick)
    return () => { clearTimeout(t); map.off('click', onMapClick) }
  }, [onMapClick]) // eslint-disable-line

  useEffect(() => {
    if (!project) return
    // Smoother flyTo with longer duration and gentler easing
    map.flyTo([project.lat, project.lng], 5, { duration: 1.0, easeLinearity: 0.2 })
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
            color: active ? '#030D07' : '#EDE0C0',
            border: `1px solid ${active ? '#1D9E75' : 'rgba(237,224,192,0.25)'}`,
            borderRadius: '5px', padding: '3px 9px',
            fontSize: '13px', fontWeight: active ? '700' : '400',
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
      <span style={{ fontSize: '11px', color: '#5A8070', marginLeft: '3px', fontFamily: FONT_MONO }}>{score}/5</span>
    </div>
  )
}

// ─── PremiumDial ──────────────────────────────────────────────────────────────

function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4)
}

function PremiumDial({ project, regionalStats }) {
  const [currentAngle, setCurrentAngle] = useState(90) // 90° = pointing up = 12 o'clock
  const animRef = useRef(null)
  const delayRef = useRef(null)

  if (!regionalStats || regionalStats.max === regionalStats.min) return null
  const { min, max, avg } = regionalStats
  const position = Math.max(0, Math.min(1, (project.price - min) / (max - min)))
  const finalAngle = 180 - position * 180
  const pct = Math.round(((project.price - avg) / avg) * 100)
  const pos = pct >= 0

  useEffect(() => {
    setCurrentAngle(90) // reset to 12 o'clock when project changes
    const duration = 1800
    delayRef.current = setTimeout(() => {
      const startTime = performance.now()
      function frame(now) {
        const t = Math.min(1, (now - startTime) / duration)
        setCurrentAngle(90 + (finalAngle - 90) * easeOutQuart(t))
        if (t < 1) animRef.current = requestAnimationFrame(frame)
      }
      animRef.current = requestAnimationFrame(frame)
    }, 80)
    return () => {
      clearTimeout(delayRef.current)
      cancelAnimationFrame(animRef.current)
    }
  }, [finalAngle])

  const cx = 110, cy = 105, r = 88, needleR = 78
  const angleRad = (currentAngle * Math.PI) / 180
  const tipX = cx + needleR * Math.cos(angleRad)
  const tipY = cy - needleR * Math.sin(angleRad)

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
        <text x={cx-r+4} y={cy+16} fill="#4A6858" fontSize="10" textAnchor="middle" fontFamily={FONT_SANS}>low</text>
        <text x={cx+r-4} y={cy+16} fill="#4A6858" fontSize="10" textAnchor="middle" fontFamily={FONT_SANS}>high</text>
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
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef(null)

  const handleClick = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 8, left: r.left + r.width / 2 })
    }
    setOpen(o => !o)
  }

  useEffect(() => {
    if (!open) return
    const h = e => { if (!btnRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <>
      <button ref={btnRef} onClick={handleClick} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: open ? '#1D9E75' : '#4A7060', fontSize: '12px',
        lineHeight: 1, padding: '0 2px', fontFamily: FONT_SANS,
      }} aria-label="info">ⓘ</button>
      {open && createPortal(
        <div style={{
          position: 'fixed', top: pos.top, left: pos.left,
          transform: 'translateX(-50%)', width: '230px',
          background: '#060B07', border: '1px solid #1A2A1E',
          borderRadius: '8px', padding: '10px 12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.7)', zIndex: 99999,
        }}>
          <div style={{ fontSize: '11px', color: '#5A8878', lineHeight: 1.6, fontFamily: FONT_SANS }}>
            Spot price = market rate per tonne CO₂e. BBB+ credits average $26/t vs $14/t for BB−, a ~86% premium.{' '}
            <span style={{ color: '#3A5848' }}>Source: Sylvera 2025.</span>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

// ─── Count-up hook ────────────────────────────────────────────────────────────

function useCountUp(target, duration = 550) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)
  useEffect(() => {
    setValue(0)
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(target * eased)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    const timer = setTimeout(() => { rafRef.current = requestAnimationFrame(tick) }, 40)
    return () => { clearTimeout(timer); cancelAnimationFrame(rafRef.current) }
  }, [target, duration])
  return value
}

// ─── Project modal (dynamic position, right of marker) ────────────────────────

const MODAL_W = 292
const MODAL_H = 460

function ProjectModal({ project, regionalStats, onClose, markerPos }) {
  const band = ratingBand(project.rating)
  const bg   = BADGE_BG[band]
  const fg   = BADGE_FG[band]
  const animatedPrice = useCountUp(project.price)

  const posStyle = useMemo(() => {
    if (!markerPos) return { top: 72, left: 16 }
    const { x, y, mapW, mapH } = markerPos
    const OFF = 22, PAD = 14
    const rightBound = mapW - SIDEBAR_W - PAD
    let left = x + OFF
    let top  = y - MODAL_H / 2
    if (left + MODAL_W > rightBound) left = x - MODAL_W - OFF
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
          borderRadius: '6px', color: '#4A6858', cursor: 'pointer',
          fontSize: '15px', lineHeight: 1, width: '26px', height: '26px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          fontFamily: FONT_SANS,
        }}>×</button>
      </div>

      {/* Rating + Price */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px', marginBottom: '7px' }}>
        <div style={{ background: bg, borderRadius: '8px', padding: '10px 12px' }}>
          <div style={{ fontSize: '9px', color: fg, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px', fontFamily: FONT_SANS }}>Rating</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: fg, fontFamily: FONT_MONO, letterSpacing: '-0.02em', lineHeight: 1 }}>{project.rating}</div>
        </div>
        <div style={{ background: '#0B1410', border: '1px solid #1A2A1E', borderRadius: '8px', padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '4px' }}>
            <span style={{ fontSize: '9px', color: '#4A7060', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: FONT_SANS }}>Spot price</span>
            <SpotPriceInfo />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
            <span style={{ fontSize: '20px', fontWeight: '400', color: '#C8A23A', fontFamily: FONT_MONO, letterSpacing: '-0.03em', lineHeight: 1 }}>${animatedPrice.toFixed(1)}</span>
            <span style={{ fontSize: '9px', color: '#3A5848', fontFamily: FONT_SANS }}>/tCO₂e</span>
          </div>
        </div>
      </div>

      {/* Dial */}
      <div style={{ background: '#0B1410', border: '1px solid #1A2A1E', borderRadius: '8px', padding: '11px 12px 7px', marginBottom: '7px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: '9px', color: '#4A7060', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600', marginBottom: '2px', alignSelf: 'flex-start', fontFamily: FONT_SANS }}>Regional position</div>
        <PremiumDial key={project.name} project={project} regionalStats={regionalStats} />
      </div>

      {/* Vintage + Co-benefits */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
        <div style={{ background: '#0B1410', border: '1px solid #1A2A1E', borderRadius: '8px', padding: '10px 12px' }}>
          <div style={{ fontSize: '9px', color: '#4A7060', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px', fontFamily: FONT_SANS }}>Vintage</div>
          <div style={{ fontSize: '18px', fontWeight: '400', color: '#D8E6DF', fontFamily: FONT_MONO }}>{project.vintage}</div>
        </div>
        <div style={{ background: '#0B1410', border: '1px solid #1A2A1E', borderRadius: '8px', padding: '10px 12px' }}>
          <div style={{ fontSize: '9px', color: '#4A7060', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '7px', fontFamily: FONT_SANS }}>Co-benefits</div>
          <CoBenefitDots score={project.coBenefit} />
        </div>
      </div>
    </div>
  )
}

// ─── Walkthrough modal ────────────────────────────────────────────────────────

const WT_SLIDES_COUNT = 6

function MelomysCard({ onClose }) {
  return createPortal(
    <>
      <style>{`
        @keyframes scrollReveal {
          0%   { transform: scaleY(0.04) translateY(-8px); opacity: 0; clip-path: inset(48% 0 48% 0); }
          50%  { opacity: 1; }
          80%  { transform: scaleY(1.02) translateY(0); clip-path: inset(0% 0 0% 0); }
          100% { transform: scaleY(1) translateY(0); clip-path: inset(0% 0 0% 0); }
        }
        .melomys-scroll { animation: scrollReveal 0.55s cubic-bezier(0.16,1,0.3,1) forwards; transform-origin: center; }
      `}</style>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 20000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(5,12,8,0.72)', backdropFilter: 'blur(10px)',
      }}>
        <div className="melomys-scroll" onClick={e => e.stopPropagation()} style={{
          width: '310px',
          background: '#F7F2E8',
          borderRadius: '14px',
          border: '1.5px solid #2A1E0E',
          cursor: 'default',
          userSelect: 'none',
          fontFamily: "'Georgia', 'Times New Roman', serif",
          overflow: 'hidden',
          boxShadow: '0 28px 72px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.25)',
        }}>

          {/* Illustration */}
          <div style={{ width: '100%', aspectRatio: '1 / 0.88', overflow: 'hidden', position: 'relative' }}>
            <img
              src="/melomys.webp"
              alt="Bramble Cay Melomys"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
            />
            {/* Vignette */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(ellipse at center, transparent 55%, rgba(42,30,14,0.28) 100%)',
            }} />
          </div>

          {/* Ruled divider */}
          <div style={{ padding: '0 20px' }}>
            <div style={{ borderTop: '1px solid #2A1E0E', marginTop: '0', opacity: 0.7 }} />
            <div style={{ borderTop: '1px solid #2A1E0E', marginTop: '3px', opacity: 0.25 }} />
          </div>

          {/* Body */}
          <div style={{ padding: '18px 24px 10px' }}>
            {/* Classification */}
            <div style={{
              fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase',
              color: '#7A6030', marginBottom: '6px', fontFamily: "'JetBrains Mono', monospace",
            }}>
              Rodentia · Muridae
            </div>

            {/* Name */}
            <div style={{ fontSize: '21px', fontWeight: '700', color: '#1A1208', lineHeight: 1.1, marginBottom: '2px' }}>
              Bramble Cay Melomys
            </div>
            <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#5A4428', marginBottom: '14px' }}>
              Melomys rubicola  ·  Thomas, 1924
            </div>

            {/* Description */}
            <div style={{ fontSize: '12.5px', lineHeight: 1.72, color: '#2E2010', marginBottom: '18px' }}>
              Endemic to a single 4-hectare coral cay in the Torres Strait. Storm-surge flooding driven by sea-level rise destroyed all vegetation and habitat. Last confirmed sighting: 2009.
            </div>
          </div>

          {/* Ruled divider */}
          <div style={{ padding: '0 20px' }}>
            <div style={{ borderTop: '1px solid #2A1E0E', opacity: 0.25 }} />
            <div style={{ borderTop: '1px solid #2A1E0E', marginTop: '3px', opacity: 0.7 }} />
          </div>

          {/* Status footer */}
          <div style={{ padding: '12px 24px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '8.5px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#7A6030', marginBottom: '3px' }}>
                IUCN Status
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8B2020', flexShrink: 0 }} />
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#8B2020', letterSpacing: '0.04em' }}>
                  Extinct — 2016
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '8.5px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#7A6030', marginBottom: '3px' }}>
                Cause
              </div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#2E2010' }}>
                Climate change
              </div>
            </div>
          </div>

        </div>
      </div>
    </>,
    document.body
  )
}

const HOP_SEQ = [
  { src: '/3.png', y: 0,  dur: 110 },
  { src: '/2.png', y: 15, dur: 80  },
  { src: '/5.png', y: 50, dur: 110 },
  { src: '/2.png', y: 20, dur: 80  },
  { src: '/4.png', y: 0,  dur: 130 },
  { src: '/1.png', y: 0,  dur: 100 },
]
const MOUSE_SIZE = 96

function WTMouseHopper({ slide, total }) {
  const containerRef = useRef(null)
  const [posX, setPosX] = useState(null)
  const [frame, setFrame] = useState({ src: '/1.png', y: 0, dir: 1 })
  const [cardOpen, setCardOpen] = useState(false)
  const prevSlideRef = useRef(slide)
  const currentDirRef = useRef(1)
  const hopRef = useRef(null)

  const zoneCenter = useCallback((idx) => {
    if (!containerRef.current) return 0
    const w = containerRef.current.offsetWidth
    return (idx + 0.5) * (w / total) - MOUSE_SIZE / 2
  }, [total])

  // init position after mount
  useEffect(() => { setPosX(zoneCenter(slide)) }, []) // eslint-disable-line

  // hop on slide change
  useEffect(() => {
    if (posX === null) return
    const prev = prevSlideRef.current
    if (prev === slide) return
    prevSlideRef.current = slide

    const newDir = slide > prev ? 1 : -1
    const oldDir = currentDirRef.current
    clearTimeout(hopRef.current)

    const startX = posX
    const endX = zoneCenter(slide)
    let step = 0

    function nextStep() {
      const f = HOP_SEQ[step]
      // hold old direction for first 2 frames, flip at apex (mid-air) — least visible
      const frameDir = step < 2 ? oldDir : newDir
      setFrame({ src: f.src, y: f.y, dir: frameDir })
      setPosX(startX + (endX - startX) * ((step + 1) / HOP_SEQ.length))
      step++
      if (step < HOP_SEQ.length) {
        hopRef.current = setTimeout(nextStep, f.dur)
      } else {
        currentDirRef.current = newDir
        setFrame({ src: '/1.png', y: 0, dir: newDir })
        setPosX(endX)
      }
    }
    nextStep()
    return () => clearTimeout(hopRef.current)
  }, [slide]) // eslint-disable-line

  return (
    <div ref={containerRef} style={{ position: 'relative', height: '96px', width: '100%', flexShrink: 0 }}>
      {posX !== null && (
        <img
          src={frame.src}
          alt="Bramble Cay Melomys"
          title="Click me!"
          onClick={() => setCardOpen(true)}
          style={{
            position: 'absolute',
            bottom: frame.y,
            left: posX,
            width: MOUSE_SIZE,
            height: MOUSE_SIZE,
            objectFit: 'contain',
            objectPosition: 'bottom center',
            transform: frame.dir === -1 ? 'scaleX(-1)' : 'none',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        />
      )}
      {cardOpen && <MelomysCard onClose={() => setCardOpen(false)} />}
    </div>
  )
}

const PAPER_BG_STYLE = {
  background: [
    'radial-gradient(ellipse at 20% 30%, rgba(210,185,140,0.18) 0%, transparent 60%)',
    'radial-gradient(ellipse at 80% 70%, rgba(180,155,110,0.12) 0%, transparent 55%)',
    'linear-gradient(160deg, #F2E8D0 0%, #EBE0C4 30%, #E4D5B4 55%, #EAD9BB 78%, #F0E4CC 100%)',
  ].join(', '),
}

function WalkthroughModal({ onClose }) {
  const [dontShow, setDontShow] = useState(false)
  const [slide, setSlide] = useState(0)
  const scrollRef = useRef(null)

  const close = () => {
    if (dontShow) localStorage.setItem('cpe_seen', '1')
    onClose()
  }

  const goTo = (idx) => {
    setSlide(idx)
    if (scrollRef.current) {
      const slides = scrollRef.current.children
      if (slides[idx]) scrollRef.current.scrollTo({ left: slides[idx].offsetLeft, behavior: 'smooth' })
    }
  }

  const next = () => goTo(Math.min(slide + 1, WT_SLIDES_COUNT - 1))
  const prev = () => goTo(Math.max(slide - 1, 0))

  const onScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, children } = scrollRef.current
    let closest = 0, minDist = Infinity
    Array.from(children).forEach((el, i) => {
      const d = Math.abs(el.offsetLeft - scrollLeft)
      if (d < minDist) { minDist = d; closest = i }
    })
    setSlide(closest)
  }

  const YELLOW = '#E8C847'
  const DARK   = '#1A1208'
  const INK    = '#1B2E1E'
  const MUTED  = '#7A6840'
  const GREEN  = '#1A6B42'
  const RED    = '#8B2020'
  const AMBER  = '#B86820'
  const headingStyle = { fontFamily: FONT_COND, fontWeight: '400', color: YELLOW, letterSpacing: '0.01em', lineHeight: 1.9 }
  const subStyle     = { fontFamily: FONT_SANS, color: INK, lineHeight: 1.72, fontWeight: '300', letterSpacing: '0.005em' }
  const labelStyle   = { fontFamily: FONT_SANS, fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '13px', color: MUTED }
  const ratingLabel  = { fontFamily: FONT_MONO, fontSize: 'clamp(22px,3vw,36px)', fontWeight: '600', marginBottom: '14px', letterSpacing: '-0.02em' }
  const hiGreen      = { color: GREEN, fontWeight: '700' }

  const sW = {
    flex: '0 0 100%', width: '100%', minWidth: 0,
    height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
    padding: '32px 48px 24px', boxSizing: 'border-box',
    scrollSnapAlign: 'start', overflowY: 'auto',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        width: 'min(900px, 92vw)', height: 'min(580px, 88vh)',
        borderRadius: '18px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
        position: 'relative',
        ...PAPER_BG_STYLE,
      }}>

      {/* Close */}
      <button onClick={close} style={{
        position: 'absolute', top: '16px', right: '18px', zIndex: 2,
        background: 'rgba(0,0,0,0.10)', border: '1px solid rgba(0,0,0,0.15)',
        borderRadius: '50%', width: '32px', height: '32px',
        color: DARK, fontSize: '16px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
      }}>×</button>

      {/* Scroll track */}
      {/* constrainer: establishes known width so minWidth:'100%' on slides resolves correctly */}
      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
      <div ref={scrollRef} onScroll={onScroll} style={{
        width: '100%', height: '100%', display: 'flex', overflowX: 'scroll', overflowY: 'hidden',
        scrollSnapType: 'x mandatory', scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}>

        {/* S1 — Hero: Ratings */}
        <div style={{ ...sW }}>
          <div style={{ ...headingStyle, fontSize: 'clamp(28px, 3.4vw, 44px)', marginBottom: '32px', color: '#163530', display: 'flex', flexDirection: 'column', gap: '0.15em' }}>
            <div>Ratings move</div>
            <div>markets.</div>
          </div>
          <div style={{ ...subStyle, fontSize: 'clamp(14px, 1.4vw, 17px)', maxWidth: '520px' }}>
            In carbon markets, quality isn't visible to the naked eye. A Sylvera rating changes that — translating complex project data into a single signal that buyers, sellers, and investors can act on. <span style={hiGreen}>Higher ratings don't just mean better projects. They mean better prices.</span>
          </div>
          <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ ...labelStyle, color: DARK }}>Scroll to explore</span>
            <span style={{ color: DARK, fontSize: '14px' }}>→</span>
          </div>
        </div>

        {/* S2 — Investment Grade cards */}
        <div style={{ ...sW, gap: '18px' }}>
          <div style={{ ...labelStyle, marginBottom: '2px' }}>INVESTMENT GRADE</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { rating: 'AAA/AA/A', color: GREEN,  bg: 'rgba(26,107,66,0.08)',  text: 'The highest confidence rating. Demonstrate exceptional additionality, near-permanent carbon storage, and independently verified co-benefits. Command the strongest premiums in the market.' },
              { rating: 'BBB/BB/B', color: GREEN,  bg: 'rgba(26,107,66,0.04)',  text: 'The investment-grade floor. Credits are credible and tradeable at premium prices, but carry some uncertainty — in baseline methodology, buffer pool sizing, or third-party verification depth.' },
            ].map(({ rating, color, bg, text }) => (
              <div key={rating} style={{ background: bg, border: `2px solid ${color}`, borderRadius: '12px', padding: '24px 22px' }}>
                <div style={{ ...ratingLabel, color }}>{rating}</div>
                <div style={{ ...subStyle, fontSize: '14px' }}>{text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* S3 — Below IG cards */}
        <div style={{ ...sW, gap: '18px' }}>
          <div style={{ ...labelStyle, marginBottom: '2px' }}>BELOW INVESTMENT GRADE</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { rating: 'CCC/CC/C', color: AMBER, bg: 'rgba(184,104,32,0.08)', text: 'High risk. Significant methodological or permanence concerns. May still transact but typically at steep discounts.' },
              { rating: 'D',        color: RED,   bg: 'rgba(139,32,32,0.08)',  text: 'Failed. Project has not delivered on its carbon promises. Credits at this level are effectively worthless in quality-conscious markets.' },
            ].map(({ rating, color, bg, text }) => (
              <div key={rating} style={{ background: bg, border: `2px solid ${color}`, borderRadius: '12px', padding: '24px 22px' }}>
                <div style={{ ...ratingLabel, color }}>{rating}</div>
                <div style={{ ...subStyle, fontSize: '14px' }}>{text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* S4 — Hero: Map */}
        <div style={{ ...sW }}>
          <div style={{ ...headingStyle, fontSize: 'clamp(24px, 3vw, 38px)', marginBottom: '32px', color: '#163530', display: 'flex', flexDirection: 'column', gap: '0.15em' }}>
            <div><span style={{ fontFamily: "'Big Shoulders Display', system-ui, sans-serif", fontWeight: '900', fontSize: '1em', letterSpacing: '-0.01em' }}>50</span> projects.</div>
            <div>Every continent.</div>
            <div>One question.</div>
          </div>
          <div style={{ ...subStyle, fontSize: 'clamp(14px, 1.4vw, 17px)', maxWidth: '520px' }}>
            The projects on this map are illustrative — fictional names, real geography. Their ratings and prices are calibrated to Sylvera's publicly available research from the State of Carbon Credits 2025. <span style={hiGreen}>Think of this as a sandbox: a live model of how quality flows through a real market.</span>
          </div>
        </div>

        {/* S5 — The Dot + Spot Price */}
        <div style={{ ...sW, gap: '28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
            {/* Dot column */}
            <div style={{ borderLeft: `3px solid ${YELLOW}`, paddingLeft: '16px' }}>
              <div style={{ fontFamily: FONT_SANS, fontWeight: '700', fontSize: '14px', color: DARK, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '16px' }}>THE DOT</div>
              <div style={{ minHeight: '76px', display: 'flex', alignItems: 'flex-end', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '18px' }}>
                  {[
                    { r: 10, color: '#1D9E75', label: 'IG' },
                    { r: 16, color: '#C8A23A', label: 'sub-IG' },
                    { r: 22, color: '#E07070', label: 'distressed' },
                  ].map(({ r, color, label }) => (
                    <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: r*2, height: r*2, borderRadius: '50%', background: color, boxShadow: `0 2px 8px ${color}66` }} />
                      <span style={{ fontFamily: FONT_MONO, fontSize: '9px', color: MUTED, letterSpacing: '0.04em' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ ...subStyle, fontSize: '14px' }}>Colour tells you the rating band — deep green for investment grade, amber for speculative, red for distressed. Bigger dot, more expensive credit.</div>
            </div>
            {/* Spot Price column */}
            <div style={{ borderLeft: `3px solid ${YELLOW}`, paddingLeft: '16px' }}>
              <div style={{ fontFamily: FONT_SANS, fontWeight: '700', fontSize: '14px', color: DARK, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '16px' }}>SPOT PRICE</div>
              <div style={{ minHeight: '76px', display: 'flex', alignItems: 'flex-end', marginBottom: '18px' }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: '32px', fontWeight: '900', color: AMBER, letterSpacing: '-0.02em' }}>$42<span style={{ fontSize: '16px' }}>/tCO₂e</span></div>
              </div>
              <div style={{ ...subStyle, fontSize: '14px' }}>The current market rate for one tonne of CO₂ equivalent. Investment-grade projects consistently command higher spot prices — sometimes by a factor of 17× compared to the lowest-rated credits.</div>
            </div>
          </div>
        </div>

        {/* S6 — Dial + Vintage + Co-benefits */}
        <div style={{ ...sW, gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '22px', alignItems: 'start' }}>
            {/* Dial column */}
            <div style={{ borderLeft: `3px solid ${YELLOW}`, paddingLeft: '16px' }}>
              <div style={{ fontFamily: FONT_SANS, fontWeight: '700', fontSize: '14px', color: DARK, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>THE DIAL</div>
              <div style={{ minHeight: '90px', display: 'flex', alignItems: 'flex-end', marginBottom: '10px' }}>
                <svg viewBox="0 0 220 115" width="150" height="78" style={{ display: 'block' }}>
                  <defs>
                    <linearGradient id="wtDialGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#E09090" />
                      <stop offset="33%" stopColor="#C8C46A" />
                      <stop offset="66%" stopColor="#5DCAA5" />
                      <stop offset="100%" stopColor="#0F6E56" />
                    </linearGradient>
                  </defs>
                  <path d="M 22 105 A 88 88 0 0 1 198 105" fill="none" stroke="rgba(26,46,30,0.25)" strokeWidth="10" strokeLinecap="round" />
                  <path d="M 22 105 A 88 88 0 0 1 198 105" fill="none" stroke="url(#wtDialGrad)" strokeWidth="8" strokeLinecap="round" />
                  <line x1="110" y1="105" x2="163" y2="50" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="110" cy="105" r="6" fill={GREEN} />
                  <circle cx="110" cy="105" r="2.5" fill="#F2E8D0" />
                  <text x="26" y="120" fill={MUTED} fontSize="9" textAnchor="middle" fontFamily={FONT_SANS}>low</text>
                  <text x="194" y="120" fill={MUTED} fontSize="9" textAnchor="middle" fontFamily={FONT_SANS}>high</text>
                </svg>
              </div>
              <div style={{ ...subStyle, fontSize: '13px' }}>Where this project sits relative to its regional peers — as a premium or discount.</div>
            </div>
            {/* Vintage column */}
            <div style={{ borderLeft: `3px solid ${YELLOW}`, paddingLeft: '16px' }}>
              <div style={{ fontFamily: FONT_SANS, fontWeight: '700', fontSize: '14px', color: DARK, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>VINTAGE</div>
              <div style={{ minHeight: '90px', display: 'flex', alignItems: 'flex-end', marginBottom: '10px' }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: '28px', fontWeight: '900', color: INK, letterSpacing: '-0.02em' }}>2021</div>
              </div>
              <div style={{ ...subStyle, fontSize: '13px' }}>The year the carbon credits were issued. More recent vintages often trade at a premium because they reflect current methodologies. Older credits may carry higher permanence uncertainty.</div>
            </div>
            {/* Co-benefits column */}
            <div style={{ borderLeft: `3px solid ${YELLOW}`, paddingLeft: '16px' }}>
              <div style={{ fontFamily: FONT_SANS, fontWeight: '700', fontSize: '14px', color: DARK, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>CO-BENEFITS</div>
              <div style={{ minHeight: '90px', display: 'flex', alignItems: 'flex-end', marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ width: '14px', height: '14px', borderRadius: '50%', background: i <= 4 ? GREEN : 'rgba(26,107,66,0.2)', border: `1.5px solid ${GREEN}` }} />
                  ))}
                </div>
              </div>
              <div style={{ ...subStyle, fontSize: '13px' }}>Projects that protect biodiversity, support communities, and advance SDGs command stronger buyer demand — particularly from corporates with ESG reporting obligations.</div>
            </div>
          </div>
        </div>

      </div>
      </div>{/* end constrainer */}

      {/* Mouse hopper */}
      <WTMouseHopper slide={slide} total={WT_SLIDES_COUNT} />

      {/* Dots + arrows + explore button */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 18px 18px', gap: '12px' }}>
        {/* Left spacer to balance explore button */}
        <div style={{ flex: '0 0 auto', minWidth: '120px' }} />
        {/* Center: nav */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <button onClick={prev} disabled={slide === 0} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: slide === 0 ? 'default' : 'pointer', color: slide === 0 ? 'rgba(0,0,0,0.18)' : DARK, padding: '4px 6px' }}>←</button>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {Array.from({ length: WT_SLIDES_COUNT }).map((_, i) => (
              <button key={i} onClick={() => goTo(i)} style={{
                width: i === slide ? '20px' : '7px', height: '7px',
                borderRadius: '4px', background: i === slide ? DARK : 'rgba(0,0,0,0.22)',
                border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.2s',
              }} />
            ))}
          </div>
          <button onClick={next} disabled={slide === WT_SLIDES_COUNT - 1} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: slide === WT_SLIDES_COUNT - 1 ? 'default' : 'pointer', color: slide === WT_SLIDES_COUNT - 1 ? 'rgba(0,0,0,0.18)' : DARK, padding: '4px 6px' }}>→</button>
        </div>
        {/* Right: explore */}
        <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <input type="checkbox" checked={dontShow} onChange={e => setDontShow(e.target.checked)} style={{ accentColor: DARK, width: '12px', height: '12px' }} />
            <span style={{ fontSize: '11px', color: MUTED, fontFamily: FONT_SANS }}>Don't show again</span>
          </label>
          <button onClick={close} style={{
            background: '#000000', border: 'none', borderRadius: '8px',
            color: '#D4FF3C', fontSize: '13px', fontWeight: '700',
            padding: '8px 18px', cursor: 'pointer', fontFamily: FONT_SANS, letterSpacing: '-0.01em', whiteSpace: 'nowrap',
          }}>
            Explore the map →
          </button>
        </div>
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
        <div style={{ fontSize: '14px', fontWeight: '500', color: isSelected ? '#A8D4C0' : '#9AB8AC', fontFamily: FONT_SANS, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>
          {project.name}
        </div>
        <div style={{ fontSize: '12px', color: '#4A6858', fontFamily: FONT_SANS, marginTop: '1px' }}>
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

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ icon, label, collapsible, open, onToggle }) {
  const inner = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#1D9E75' }}>
      {icon}
      <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: FONT_SANS }}>
        {label}
      </span>
      {collapsible && (
        <div style={{ marginLeft: 'auto', color: '#3A5848' }}>
          <IconChevron open={open} />
        </div>
      )}
    </div>
  )

  if (collapsible) {
    return (
      <button onClick={onToggle} style={{
        width: '100%', background: 'none', border: 'none', padding: '0',
        cursor: 'pointer', textAlign: 'left',
      }}>
        {inner}
      </button>
    )
  }
  return inner
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [selected, setSelected]         = useState(null)
  const [regionFilter, setRegionFilter] = useState([])
  const [typeFilter, setTypeFilter]     = useState([])
  const [ratingFilter, setRatingFilter] = useState([])
  const [worldGeo, setWorldGeo]         = useState(null)
  const [markerPos, setMarkerPos]       = useState(null)
  const [showWalkthrough, setShowWalkthrough] = useState(false)
  const [projectsOpen, setProjectsOpen] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cpe_seen')) {
      setShowWalkthrough(true)
    } else {
      setTimeout(() => setSidebarVisible(true), 200)
    }
  }, [])

  const handleWalkthroughClose = useCallback(() => {
    setShowWalkthrough(false)
    setTimeout(() => setSidebarVisible(true), 120)
  }, [])

  const onSelect = useCallback((p) => {
    setSelected(prev => {
      if (prev?.name === p.name) { setMarkerPos(null); return null }
      return p
    })
    setMarkerPos(null)
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

  const playPop = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(520, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.08)
      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.1)
      osc.onended = () => ctx.close()
    } catch (_) {}
  }, [])

  const onEachCountry = useCallback((_feature, layer) => {
    layer.on({
      mouseover(e) { e.target.setStyle(COUNTRY_STYLE_HOVER); playPop() },
      mouseout(e)  { e.target.setStyle(COUNTRY_STYLE_DEFAULT) },
    })
  }, [playPop])

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
    <div style={{ position: 'relative', width: '100%', height: '100dvh', background: '#000', fontFamily: FONT_SANS }}>

      {showWalkthrough && <WalkthroughModal onClose={handleWalkthroughClose} />}

      {/* ── Map — fills entire viewport ─────────────────────── */}
      <div style={{ position: 'absolute', inset: 0 }}>
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

          {/* CartoDB dark base — truly no labels */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            maxZoom={19}
            noWrap={true}
          />
          {/* CartoDB white labels only — on separate pane above markers */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
            maxZoom={19}
            minZoom={3}
            noWrap={true}
            pane="labelsPane"
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

        {/* Title — floating text, no container box */}
        <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 1000, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ pointerEvents: 'none' }}>
            <div style={{
              fontSize: '28px', fontWeight: '900', color: '#D4FF3C',
              letterSpacing: '-0.03em', fontFamily: FONT_SANS,
              textShadow: '0 2px 14px rgba(0,0,0,0.95), 0 1px 4px rgba(0,0,0,0.9)',
            }}>
              Carbon Project Explorer
            </div>
          </div>
          <button
            onClick={() => setShowWalkthrough(true)}
            title="How to use"
            style={{
              width: '30px', height: '30px',
              background: 'rgba(4,8,7,0.92)', border: '1px solid #1D9E75',
              borderRadius: '50%', color: '#1D9E75',
              cursor: 'pointer', fontSize: '13px', fontWeight: '700',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(12px)', fontFamily: FONT_MONO,
            }}
          >?</button>
        </div>

        {/* Legend */}
        <div style={{
          position: 'absolute', bottom: 28, left: 16, zIndex: 1000, pointerEvents: 'none',
          background: 'rgba(4,8,7,0.94)', border: '1px solid #162018',
          borderRadius: '10px', padding: '11px 13px', backdropFilter: 'blur(16px)',
        }}>
          <div style={{ fontSize: '11px', color: '#4A7060', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: '8px', fontWeight: '700', fontFamily: FONT_SANS }}>Sylvera Rating</div>
          {[
            { label: 'AAA / AA / A', color: '#1D9E75' },
            { label: 'BBB / BB',     color: '#5DCAA5' },
            { label: 'B / CCC',      color: '#C8C46A' },
            { label: 'CC / D',       color: '#E09090' },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#7A9880', fontFamily: FONT_SANS }}>{label}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #162018', marginTop: '7px', paddingTop: '7px', fontSize: '11px', color: '#4A7060', fontFamily: FONT_SANS }}>Circle size = spot price</div>
        </div>

        {/* Project modal */}
        {selected && markerPos && (
          <ProjectModal
            project={selected}
            regionalStats={regionalStats}
            onClose={() => { setSelected(null); setMarkerPos(null) }}
            markerPos={markerPos}
          />
        )}
      </div>

      {/* ── Sidebar — glassmorphism overlay ───────────────── */}
      {sidebarVisible && <div
        className="sidebar-panel"
        style={{
          position: 'absolute', top: 0, right: 0, height: '100dvh',
          width: `${SIDEBAR_W}px`, zIndex: 900,
          background: 'linear-gradient(165deg, rgba(48,90,62,0.38) 0%, rgba(32,68,46,0.45) 100%)',
          borderLeft: 'none',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >

        {/* Filters section */}
        <div style={{ padding: '16px 14px 14px', borderBottom: '1px solid rgba(232,223,192,0.08)', flexShrink: 0 }}>
          <div style={{ marginBottom: '13px' }}>
            <SectionHeader icon={<IconFilter />} label="Filters" />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '22px', color: '#EDE0C0', marginBottom: '14px', paddingBottom: '2px', fontWeight: '400', fontFamily: FONT_COND, letterSpacing: '0.01em' }}>Region</div>
            <PillGroup options={REGIONS} value={regionFilter} onChange={setRegionFilter} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '22px', color: '#EDE0C0', marginBottom: '14px', paddingBottom: '2px', fontWeight: '400', fontFamily: FONT_COND, letterSpacing: '0.01em' }}>Project type</div>
            <PillGroup options={TYPES} value={typeFilter} onChange={setTypeFilter} />
          </div>
          <div>
            <div style={{ fontSize: '22px', color: '#EDE0C0', marginBottom: '14px', paddingBottom: '2px', fontWeight: '400', fontFamily: FONT_COND, letterSpacing: '0.01em' }}>Rating</div>
            <PillGroup options={RATINGS} value={ratingFilter} onChange={setRatingFilter} />
          </div>
        </div>

        {/* Overview / Stats section */}
        <div style={{ padding: '20px 16px 18px', borderBottom: '1px solid rgba(232,223,192,0.08)', flexShrink: 0 }}>
          <div style={{ marginBottom: '16px' }}>
            <SectionHeader icon={<IconChart />} label="Overview" />
          </div>

          {avgPrice && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#EDE0C0', textTransform: 'uppercase', letterSpacing: '0.10em', fontFamily: FONT_SANS, marginBottom: '3px', fontWeight: '600' }}>Avg spot price</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                <span style={{ fontSize: '36px', fontWeight: '700', color: '#D4FF3C', letterSpacing: '-0.04em', lineHeight: 1, fontFamily: FONT_MONO }}>${avgPrice}</span>
                <span style={{ fontSize: '11px', color: '#3A5848', fontFamily: FONT_SANS, paddingBottom: '6px' }}>/tCO₂e</span>
              </div>
            </div>
          )}

          {igPremium !== null && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', color: '#EDE0C0', textTransform: 'uppercase', letterSpacing: '0.10em', fontFamily: FONT_SANS, marginBottom: '3px', fontWeight: '600' }}>IG vs sub-IG premium</div>
              <span style={{ fontSize: '36px', fontWeight: '700', color: '#1D9E75', letterSpacing: '-0.04em', lineHeight: 1, fontFamily: FONT_MONO }}>+{igPremium}%</span>
            </div>
          )}

          <div>
            <div style={{ fontSize: '11px', color: '#EDE0C0', textTransform: 'uppercase', letterSpacing: '0.10em', fontFamily: FONT_SANS, marginBottom: '3px', fontWeight: '600' }}>Projects</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '36px', fontWeight: '700', color: '#1D9E75', letterSpacing: '-0.04em', lineHeight: 1, fontFamily: FONT_MONO }}>{filtered.length}</span>
              <span style={{ fontSize: '11px', color: '#3A5848', fontFamily: FONT_SANS }}>of {PROJECTS.length}</span>
            </div>
          </div>
        </div>

        {/* Projects section — collapsible */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: projectsOpen ? 1 : 'none', flexShrink: 0 }}>
          <div style={{ padding: '12px 14px 10px', flexShrink: 0 }}>
            <SectionHeader
              icon={<IconList />}
              label={`Projects (${filtered.length})`}
              collapsible
              open={projectsOpen}
              onToggle={() => setProjectsOpen(o => !o)}
            />
          </div>

          {projectsOpen && (
            <div className="panel-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 8px 0' }}>
              {sortedFiltered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px 12px', color: '#3A5848', fontSize: '12px', fontFamily: FONT_SANS }}>No projects match filters</div>
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
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '8px 14px', borderTop: '1px solid #0E1810', fontSize: '11px', color: '#3A5848', lineHeight: 1.5, flexShrink: 0, marginTop: 'auto', fontFamily: FONT_SANS }}>
          Illustrative data. Calibrated to Sylvera State of Carbon Credits 2025.
        </div>
      </div>}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Tag({ children }) {
  return (
    <span style={{
      background: 'rgba(29,158,117,0.07)', color: '#5A8070',
      padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px',
      border: '1px solid #162018', fontFamily: FONT_SANS,
    }}>
      {children}
    </span>
  )
}
