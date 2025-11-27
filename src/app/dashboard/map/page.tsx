'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  FormControlLabel,
  Switch,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
} from '@mui/material'
import {
  Refresh,
  Map as MapIcon,
  Layers,
  CellTower,
} from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import api from '@/lib/api'
import { SignalMeasurement, Tower } from '@/types'
import dynamic from 'next/dynamic'
import { MapMarker, HeatmapPoint, CoverageGridPoint } from '@/components/maps/SignalMap'
import { HeatmapAnalysisDialog, CoverageStats } from '@/components/analysis/HeatmapAnalysis'
import { RecommendationsList, RecommendationsDialog } from '@/components/analysis/RecommendationsList'
import { RecommendationMarkers } from '@/components/analysis/RecommendationMarkers'

// Importação dinâmica do mapa para evitar SSR issues
const SignalMap = dynamic(() => import('@/components/maps/SignalMap'), {
  ssr: false,
  loading: () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '600px' }}>
      <CircularProgress />
    </Box>
  ),
})

export default function MapPage() {
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(true)
  const [signals, setSignals] = useState<SignalMeasurement[]>([])
  const [towers, setTowers] = useState<Tower[]>([])
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [showTowers, setShowTowers] = useState(false)
  const [filterOperator, setFilterOperator] = useState<string>('all')
  const [filterSignalType, setFilterSignalType] = useState<string>('all')
  const [mapCenter, setMapCenter] = useState<[number, number]>([-23.5505, -46.6333])
  const [mapZoom, setMapZoom] = useState(13)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importRadius, setImportRadius] = useState<number>(5)
  const [importOperator, setImportOperator] = useState<string>('all')
  const [importing, setImporting] = useState(false)
  const [geolocating, setGeolocating] = useState(false)
  const [heatmapAnalysisOpen, setHeatmapAnalysisOpen] = useState(false)
  const [drawingMode, setDrawingMode] = useState(false)
  const [polygonVertices, setPolygonVertices] = useState<[number, number][]>([])
  const [coverageGrid, setCoverageGrid] = useState<CoverageGridPoint[]>([])
  const [coverageStats, setCoverageStats] = useState<any | null>(null)
  const [recommendationsOpen, setRecommendationsOpen] = useState(false)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)
  const [selectedRecommendationIds, setSelectedRecommendationIds] = useState<Set<string>>(new Set())

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando dados do mapa...')
      
      const [signalsRes, towersRes] = await Promise.all([
        api.get<SignalMeasurement[]>('/signals/').catch(() => ({ data: [] })),
        api.get<Tower[]>('/towers/').catch(() => ({ data: [] })),
      ])

      console.log('📊 Dados carregados:', {
        signals: signalsRes.data.length,
        towers: towersRes.data.length,
      })

      setSignals(signalsRes.data || [])
      setTowers(towersRes.data || [])

      // Centralizar mapa na primeira medição se houver
      if (signalsRes.data && signalsRes.data.length > 0) {
        const first = signalsRes.data[0]
        console.log('🎯 Centralizando mapa em medição:', [first.latitude, first.longitude])
        setMapCenter([first.latitude, first.longitude])
      } else if (towersRes.data && towersRes.data.length > 0) {
        // Se não houver medições mas houver torres, centralizar na primeira torre
        const first = towersRes.data[0]
        console.log('🎯 Centralizando mapa em torre:', [first.latitude, first.longitude])
        setMapCenter([first.latitude, first.longitude])
      } else {
        console.log('⚠️ Nenhuma medição ou torre encontrada')
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados do mapa:', error)
      enqueueSnackbar('Erro ao carregar dados', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [enqueueSnackbar])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filtrar medições
  const filteredSignals = signals.filter((signal) => {
    if (filterOperator !== 'all' && signal.operator !== filterOperator) return false
    if (filterSignalType !== 'all' && signal.signal_type !== filterSignalType) return false
    return true
  })

  // Converter medições para marcadores
  const markers: MapMarker[] = filteredSignals.map((signal) => ({
    id: signal.id,
    latitude: signal.latitude,
    longitude: signal.longitude,
    title: `${signal.operator || 'N/A'} - ${signal.signal_type.toUpperCase()}`,
    description: `${signal.signal_strength_dbm} dBm`,
    signalStrength: signal.signal_strength_dbm,
  }))

  // Adicionar torres como marcadores
  if (showTowers) {
    towers.forEach((tower) => {
      markers.push({
        id: tower.id + 10000, // Offset para não conflitar com signals
        latitude: tower.latitude,
        longitude: tower.longitude,
        title: `Torre ${tower.operator}`,
        description: `Cell ID: ${tower.cell_id}`,
        color: 'purple',
      })
    })
  }

  // Converter para heatmap
  const heatmapPoints: HeatmapPoint[] = filteredSignals.map((signal) => {
    // Normalizar dBm para intensidade 0-1
    // -40 dBm (excelente) = 1.0
    // -120 dBm (péssimo) = 0.0
    const normalized = (signal.signal_strength_dbm + 120) / 80
    const intensity = Math.max(0, Math.min(1, normalized))

    return {
      latitude: signal.latitude,
      longitude: signal.longitude,
      intensity,
    }
  })

  const operators = Array.from(new Set(signals.map((s) => s.operator).filter(Boolean)))

  const handleMarkerClick = (marker: MapMarker) => {
    enqueueSnackbar(`Clicou em: ${marker.title}`, { variant: 'info' })
  }

  if (loading && signals.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">
          Mapa de Cobertura
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button 
            variant={coverageGrid.length > 0 ? "contained" : "outlined"}
            size="small"
            onClick={() => setHeatmapAnalysisOpen(true)}
          >
            📊 Análise de Cobertura
          </Button>
          {coverageGrid.length > 0 && (
            <Button
              variant="contained"
              color="warning"
              size="small"
              onClick={async () => {
                try {
                  setRecommendationsLoading(true)
                  // Convert grid points with poor signal to gaps
                  const gaps = coverageGrid
                    .filter((p) => p.signal_dbm < -95) // Poor signal
                    .map((p, idx) => ({
                      latitude: p.lat,
                      longitude: p.lng,
                      area_km2: 0.01 // 100m x 100m = 0.01 km²
                    }))
                  
                  if (gaps.length === 0) {
                    enqueueSnackbar('Nenhum gap encontrado nesta análise', { variant: 'info' })
                    return
                  }

                  const res = await api.post('/recommendations/towers', {
                    gaps,
                    max_recommendations: 5,
                    operator: filterOperator !== 'all' ? filterOperator : 'all'
                  })

                  console.log('✅ Recomendações geradas:', res.data)
                  setRecommendations(res.data.recommendations)
                  setRecommendationsOpen(true)
                  enqueueSnackbar(`${res.data.recommendations.length} recomendações geradas`, {
                    variant: 'success'
                  })
                } catch (err: any) {
                  console.error('Erro gerando recomendações:', err)
                  enqueueSnackbar('Erro ao gerar recomendações', { variant: 'error' })
                } finally {
                  setRecommendationsLoading(false)
                }
              }}
              disabled={recommendationsLoading || coverageGrid.length === 0}
            >
              📍 Recomendar Localização para Torres
            </Button>
          )}
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => {
              setGeolocating(true)
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  async (pos) => {
                    const { latitude, longitude } = pos.coords
                    console.log('📍 Geolocalização obtida:', [latitude, longitude])
                    setMapCenter([latitude, longitude])
                    setMapZoom(14)
                    enqueueSnackbar(`Localização: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, { variant: 'success' })
                    
                    // Buscar torres próximas automaticamente
                    try {
                      console.log('🔍 Buscando torres próximas...')
                      const res = await api.get<Tower[]>('/towers/nearby', {
                        params: {
                          latitude,
                          longitude,
                          radius_km: 5
                        }
                      })
                      console.log(`✅ ${res.data.length} torres próximas encontradas`)
                      setTowers(res.data || [])
                      setShowTowers(true)
                      enqueueSnackbar(`${res.data.length} torres próximas encontradas!`, { variant: 'success' })
                    } catch (err: any) {
                      console.error('❌ Erro ao buscar torres:', err)
                      enqueueSnackbar('Erro ao buscar torres próximas', { variant: 'error' })
                    }
                    
                    setGeolocating(false)
                  },
                  () => {
                    enqueueSnackbar('Não foi possível obter geolocalização', { variant: 'warning' })
                    setGeolocating(false)
                  }
                )
              }
            }}
            disabled={geolocating}
          >
            📍 Usar Localização
          </Button>
          <Button variant="contained" color="primary" startIcon={<MapIcon />} onClick={() => setImportModalOpen(true)}>
            Importar Torres Reais
          </Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadData}>
            Atualizar
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MapIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography color="text.secondary" variant="caption">
                    Pontos no Mapa
                  </Typography>
                  <Typography variant="h5">
                    {markers.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="caption">
                Operadoras
              </Typography>
              <Typography variant="h5">{operators.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="caption">
                Torres
              </Typography>
              <Typography variant="h5">{towers.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              label="Operadora"
              value={filterOperator}
              onChange={(e) => setFilterOperator(e.target.value)}
              size="small"
            >
              <MenuItem value="all">Todas</MenuItem>
              {operators.map((op) => (
                <MenuItem key={op} value={op}>
                  {op}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              label="Tipo de Sinal"
              value={filterSignalType}
              onChange={(e) => setFilterSignalType(e.target.value)}
              size="small"
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="4g">4G</MenuItem>
              <MenuItem value="5g">5G</MenuItem>
              <MenuItem value="wifi">WiFi</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControlLabel
              control={
                <Switch checked={showHeatmap} onChange={(e) => setShowHeatmap(e.target.checked)} />
              }
              label="Heatmap"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControlLabel
              control={
                <Switch checked={showTowers} onChange={(e) => setShowTowers(e.target.checked)} />
              }
              label="Torres"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Import Modal */}
      <Dialog open={importModalOpen} onClose={() => setImportModalOpen(false)}>
        <DialogTitle>Importar Torres Reais (OpenCellID)</DialogTitle>
        <DialogContent>
          <Box sx={{ width: 400, pt: 1 }}>
            <Typography variant="caption">Raio (km): {importRadius}</Typography>
            <Slider
              value={importRadius}
              min={1}
              max={50}
              onChange={(_, v) => setImportRadius(Array.isArray(v) ? v[0] : v)}
              valueLabelDisplay="auto"
            />

            <TextField
              fullWidth
              select
              label="Operadora (opcional)"
              value={importOperator}
              onChange={(e) => setImportOperator(e.target.value)}
              size="small"
              sx={{ mt: 2 }}
            >
              <MenuItem value="all">Nenhuma / Detectar</MenuItem>
              {operators.map((op) => (
                <MenuItem key={op} value={op}>{op}</MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportModalOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={importing}
            onClick={async () => {
              try {
                setImporting(true)
                const params: any = {
                  lat: mapCenter[0],
                  lng: mapCenter[1],
                  radius_km: importRadius,
                }
                if (importOperator !== 'all') params.operator = importOperator

                const res = await api.get('/integration/opencellid/import', { params })
                const data = res.data
                
                const message = `${data.imported_count} torres carregadas com sucesso`
                enqueueSnackbar(message, { variant: 'success' })
                
                // Ensure towers are shown and reload
                setShowTowers(true)
                await loadData()
                setImportModalOpen(false)
              } catch (err: any) {
                console.error('Erro importando torres:', err)
                enqueueSnackbar('Erro ao importar torres', { variant: 'error' })
              } finally {
                setImporting(false)
              }
            }}
          >
            {importing ? <CircularProgress size={20} /> : 'Importar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Legend */}
      <Alert severity="info" sx={{ mb: 3 }} icon={<Layers />}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'green', border: '2px solid white' }} />
            <Typography variant="caption">Excelente (&ge; -70 dBm)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'orange', border: '2px solid white' }} />
            <Typography variant="caption">Bom (-70 a -85 dBm)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'red', border: '2px solid white' }} />
            <Typography variant="caption">Fraco (&lt; -85 dBm)</Typography>
          </Box>
          {showTowers && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'purple', border: '2px solid white' }} />
              <Typography variant="caption">Torres</Typography>
            </Box>
          )}
        </Box>
      </Alert>

      {/* Coverage Statistics */}
      {coverageStats && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            📊 Resultado da Análise
          </Typography>
          <CoverageStats stats={coverageStats} />
        </Box>
      )}

      {/* Map */}
      {signals.length === 0 && towers.length === 0 ? (
        <Alert severity="info">
          ℹ️ Nenhuma medição ou torre. Clique em &quot;Importar Torres Reais&quot; para começar ou adicione medições.
        </Alert>
      ) : (
        <>
          <SignalMap
            markers={markers}
            heatmapPoints={heatmapPoints}
            center={mapCenter}
            zoom={mapZoom}
            height="600px"
            showHeatmap={showHeatmap}
            onMarkerClick={handleMarkerClick}
            drawingMode={drawingMode}
            onMapClick={(lat, lng) => {
              if (drawingMode) {
                setPolygonVertices([...polygonVertices, [lat, lng]])
              }
            }}
            polygonVertices={polygonVertices}
            coverageGrid={coverageGrid}
          />
          {/* Render recommendation markers */}
          <RecommendationMarkers
            recommendations={recommendations.map((r, i) => ({
              id: `rec-${i}`,
              location: {
                latitude: r.location.latitude,
                longitude: r.location.longitude
              },
              score: r.score,
              priority: r.priority,
              population_reached: r.population_reached,
              reason: r.reason,
              gap_count: r.gap_count
            }))}
            map={null}
            selectedRecommendationId={Array.from(selectedRecommendationIds)[0]}
            onMarkerClick={(rec, marker) => {
              console.log('Recommendation marker clicked:', rec)
            }}
          />
        </>
      )}

      {/* Heatmap Analysis Dialog */}
      <HeatmapAnalysisDialog
        open={heatmapAnalysisOpen}
        onClose={() => setHeatmapAnalysisOpen(false)}
        onAnalysisComplete={(result, polygon) => {
          console.log('✅ Análise concluída:', result)
          setCoverageGrid(result.grid)
          setCoverageStats(result.stats)
          setPolygonVertices(polygon)
          setDrawingMode(false)
        }}
        mapCenter={mapCenter}
      />

      {/* Recommendations Dialog */}
      <RecommendationsDialog
        open={recommendationsOpen}
        recommendations={recommendations}
        loading={recommendationsLoading}
        totalGapsAnalyzed={coverageGrid.length}
        clusterCount={recommendations.length}
        onClose={() => {
          setRecommendationsOpen(false)
          setSelectedRecommendationIds(new Set())
        }}
        onSelectRecommendation={(rec) => {
          console.log('Selected recommendation:', rec)
        }}
      />
    </Box>
  )
}

