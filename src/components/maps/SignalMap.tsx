'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Box, CircularProgress } from '@mui/material'

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export interface MapMarker {
  id: number
  latitude: number
  longitude: number
  title: string
  description?: string
  color?: string
  signalStrength?: number
}

export interface HeatmapPoint {
  latitude: number
  longitude: number
  intensity: number
}

export interface CoverageGridPoint {
  lat: number
  lng: number
  signal_dbm: number
  quality: 'excellent' | 'good' | 'fair' | 'poor'
}

interface SignalMapProps {
  markers?: MapMarker[]
  heatmapPoints?: HeatmapPoint[]
  center?: [number, number]
  zoom?: number
  height?: string | number
  showHeatmap?: boolean
  onMarkerClick?: (marker: MapMarker) => void
  drawingMode?: boolean
  onMapClick?: (lat: number, lng: number) => void
  polygonVertices?: [number, number][]
  coverageGrid?: CoverageGridPoint[]
}

export default function SignalMap({
  markers = [],
  heatmapPoints = [],
  center = [-23.5505, -46.6333], // São Paulo default
  zoom = 13,
  height = '500px',
  showHeatmap = false,
  onMarkerClick,
  drawingMode = false,
  onMapClick,
  polygonVertices = [],
  coverageGrid = [],
}: SignalMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const heatmapLayerRef = useRef<any>(null)
  const polygonLayerRef = useRef<L.Polyline | null>(null)
  const coverageLayerRef = useRef<L.LayerGroup | null>(null)

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    console.log('🗺️ Inicializando mapa Leaflet...', { center, zoom })

    try {
      // Criar mapa
      const map = L.map(mapRef.current).setView(center, zoom)
      console.log('✅ Mapa criado com sucesso')

      // Adicionar tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)
      console.log('✅ Tiles adicionados')

      // Criar layer groups
      markersLayerRef.current = L.layerGroup().addTo(map)
      console.log('✅ Layer de marcadores criado')

      mapInstanceRef.current = map

      // Forçar refresh do mapa após um pequeno delay
      setTimeout(() => {
        map.invalidateSize()
        console.log('✅ Mapa invalidado/atualizado')
      }, 100)

    } catch (error) {
      console.error('❌ Erro ao inicializar mapa:', error)
    }

    return () => {
      if (mapInstanceRef.current) {
        console.log('🧹 Removendo mapa')
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Atualizar centro e zoom
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom)
    }
  }, [center, zoom])

  // Atualizar marcadores
  useEffect(() => {
    if (!markersLayerRef.current) {
      console.log('⚠️ Layer de marcadores não existe ainda')
      return
    }

    console.log('📍 Atualizando marcadores:', markers.length)

    // Limpar marcadores anteriores
    markersLayerRef.current.clearLayers()

    // Adicionar novos marcadores
    markers.forEach((marker) => {
      const getMarkerColor = (signalStrength?: number) => {
        if (!signalStrength) return 'gray'
        if (signalStrength >= -70) return 'green'
        if (signalStrength >= -85) return 'orange'
        return 'red'
      }

      const color = marker.color || getMarkerColor(marker.signalStrength)

      // Criar ícone customizado
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${color};
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 4px rgba(0,0,0,0.5);
          "></div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })

      const leafletMarker = L.marker([marker.latitude, marker.longitude], {
        icon: customIcon,
      })

      // Popup
      const popupContent = `
        <div style="min-width: 200px;">
          <strong>${marker.title}</strong><br/>
          ${marker.description || ''}
          ${marker.signalStrength ? `<br/>Sinal: <strong>${marker.signalStrength} dBm</strong>` : ''}
        </div>
      `
      leafletMarker.bindPopup(popupContent)

      // Click event
      if (onMarkerClick) {
        leafletMarker.on('click', () => onMarkerClick(marker))
      }

      leafletMarker.addTo(markersLayerRef.current!)
    })

    // Ajustar bounds se houver marcadores
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.latitude, m.longitude]))
      mapInstanceRef.current?.fitBounds(bounds, { padding: [50, 50] })
      console.log('✅ Bounds ajustados para', markers.length, 'marcadores')
    } else {
      console.log('⚠️ Nenhum marcador para exibir')
    }
  }, [markers, onMarkerClick])

  // Configurar click handler para desenho
  useEffect(() => {
    if (!mapInstanceRef.current) return

    if (drawingMode) {
      mapInstanceRef.current.on('click', handleMapClick)
      mapInstanceRef.current.dragging.disable()
      console.log('🎨 Modo desenho ativo')
    } else {
      mapInstanceRef.current.off('click', handleMapClick)
      mapInstanceRef.current.dragging.enable()
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off('click', handleMapClick)
      }
    }
  }, [drawingMode, onMapClick])

  // Renderizar polígono
  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Remover polígono anterior
    if (polygonLayerRef.current) {
      mapInstanceRef.current.removeLayer(polygonLayerRef.current)
      polygonLayerRef.current = null
    }

    // Renderizar novo polígono
    if (polygonVertices.length > 0) {
      const polylinePoints = polygonVertices.map((v) => [v[0], v[1]] as [number, number])
      
      polygonLayerRef.current = L.polyline(polylinePoints, {
        color: '#2196F3',
        weight: 2,
        opacity: 0.8,
        dashArray: '5, 5',
      }).addTo(mapInstanceRef.current)

      // Marcar vértices
      if (markersLayerRef.current) {
        polylinePoints.forEach((point, idx) => {
          const vertexMarker = L.circleMarker([point[0], point[1]], {
            radius: 5,
            fillColor: '#2196F3',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
          }).addTo(markersLayerRef.current!)
          
          vertexMarker.bindPopup(`Vértice ${idx + 1}`)
        })
      }
    }
  }, [polygonVertices])

  // Renderizar grid de cobertura
  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Remover layer de cobertura anterior
    if (coverageLayerRef.current) {
      mapInstanceRef.current.removeLayer(coverageLayerRef.current)
      coverageLayerRef.current = null
    }

    // Renderizar grid de cobertura
    if (coverageGrid.length > 0) {
      coverageLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current)

      const getQualityColor = (quality: string) => {
        switch (quality) {
          case 'excellent': return { color: '#4CAF50', fillOpacity: 0.7 } // Verde
          case 'good': return { color: '#8BC34A', fillOpacity: 0.6 } // Verde claro
          case 'fair': return { color: '#FFC107', fillOpacity: 0.6 } // Amarelo
          case 'poor': return { color: '#F44336', fillOpacity: 0.5 } // Vermelho
          default: return { color: '#9E9E9E', fillOpacity: 0.4 } // Cinza
        }
      }

      coverageGrid.forEach((point) => {
        const { color, fillOpacity } = getQualityColor(point.quality)
        
        const circle = L.circleMarker([point.lat, point.lng], {
          radius: 3,
          fillColor: color,
          color: color,
          weight: 1,
          opacity: fillOpacity,
          fillOpacity,
        })

        // Popup com informações
        circle.bindPopup(
          `Sinal: ${point.signal_dbm} dBm<br/>Qualidade: ${point.quality}`
        )

        circle.addTo(coverageLayerRef.current!)
      })

      console.log('✅ Grid de cobertura renderizado:', coverageGrid.length, 'pontos')
    }
  }, [coverageGrid])

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (onMapClick && drawingMode) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    }
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: 1,
        overflow: 'hidden',
        '& .leaflet-container': {
          height: '100%',
          width: '100%',
          borderRadius: 1,
          cursor: drawingMode ? 'crosshair' : 'grab',
        },
      }}
    >
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </Box>
  )
}

