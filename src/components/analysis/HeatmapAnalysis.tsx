import React, { useState, useRef } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Slider,
  TextField,
  Typography,
  Chip,
  Alert,
} from '@mui/material'
import { useSnackbar } from 'notistack'
import api from '@/lib/api'
import { Draw as DrawIcon, Cancel as CancelIcon } from '@mui/icons-material'

interface CoverageGridPoint {
  lat: number
  lng: number
  signal_dbm: number
  quality: 'excellent' | 'good' | 'fair' | 'poor'
}

interface CoverageStats {
  coverage_pct: number
  gap_area_km2: number
  total_area_km2: number
  avg_signal_dbm: number | null
  grid_points_analyzed: number
}

interface CoverageAnalysisResult {
  grid: CoverageGridPoint[]
  stats: CoverageStats
}

interface HeatmapAnalysisDialogProps {
  open: boolean
  onClose: () => void
  onAnalysisComplete: (result: CoverageAnalysisResult, polygon: [number, number][]) => void
  mapCenter: [number, number]
}

/**
 * Heatmap Analysis Dialog Component
 * - User clicks on map to draw polygon vertices
 * - Backend analyzes coverage with grid-based approach
 * - Results show as heatmap with statistics
 */
export function HeatmapAnalysisDialog({
  open,
  onClose,
  onAnalysisComplete,
  mapCenter,
}: HeatmapAnalysisDialogProps) {
  const { enqueueSnackbar } = useSnackbar()
  
  const [drawingMode, setDrawingMode] = useState(false)
  const [polygonVertices, setPolygonVertices] = useState<[number, number][]>([])
  const [operator, setOperator] = useState<string>('all')
  const [thresholdDbm, setThresholdDbm] = useState<number>(-85)
  const [analyzing, setAnalyzing] = useState(false)
  const [gridStep, setGridStep] = useState<number>(0.1) // 100m in km

  // Handle polygon drawing instructions
  const handleStartDrawing = () => {
    setPolygonVertices([])
    setDrawingMode(true)
    enqueueSnackbar('Modo desenho ativo. Clique no mapa para adicionar vértices. Clique 3+ vezes e feche o polígono.', {
      variant: 'info',
      persist: true,
    })
  }

  const handleAddVertex = (lat: number, lng: number) => {
    if (!drawingMode) return
    
    const newVertices = [...polygonVertices, [lat, lng] as [number, number]]
    setPolygonVertices(newVertices)
    
    enqueueSnackbar(`Vértice ${newVertices.length} adicionado`, { variant: 'success' })
  }

  const handleClearPolygon = () => {
    setPolygonVertices([])
    setDrawingMode(false)
    enqueueSnackbar('Polígono limpo', { variant: 'info' })
  }

  const handleAnalyzeCoverage = async () => {
    // Validate polygon
    if (polygonVertices.length < 3) {
      enqueueSnackbar('Polígono deve ter pelo menos 3 vértices', { variant: 'error' })
      return
    }

    try {
      setAnalyzing(true)
      
      // Close polygon if not already closed
      let closedPolygon = polygonVertices
      if (polygonVertices[0][0] !== polygonVertices[polygonVertices.length - 1][0] ||
          polygonVertices[0][1] !== polygonVertices[polygonVertices.length - 1][1]) {
        closedPolygon = [...polygonVertices, polygonVertices[0]]
      }

      console.log('📊 Enviando análise de cobertura:', {
        polygon: closedPolygon,
        operator: operator === 'all' ? undefined : operator,
        threshold_dbm: thresholdDbm,
      })

      const response = await api.post<CoverageAnalysisResult>(
        '/analysis/coverage-heatmap',
        {
          polygon: closedPolygon,
          operator: operator === 'all' ? undefined : operator,
          threshold_dbm: thresholdDbm,
        }
      )

      console.log('✅ Análise concluída:', {
        gridPoints: response.data.grid.length,
        coverage: response.data.stats.coverage_pct,
      })

      enqueueSnackbar(
        `Análise completa: ${response.data.stats.coverage_pct.toFixed(1)}% cobertura`,
        { variant: 'success' }
      )

      onAnalysisComplete(response.data, closedPolygon)
      setDrawingMode(false)
      onClose()
    } catch (error: any) {
      console.error('❌ Erro na análise:', error)
      enqueueSnackbar(
        error.response?.data?.detail || 'Erro ao analisar cobertura',
        { variant: 'error' }
      )
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        📊 Análise de Cobertura
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        {/* Instructions */}
        <Alert severity="info">
          Desenhe um polígono no mapa clicando para adicionar vértices. A análise usará a grade de 100m com modelo Okumura-Hata.
        </Alert>

        {/* Drawing Mode */}
        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <Button
              variant={drawingMode ? 'contained' : 'outlined'}
              startIcon={<DrawIcon />}
              onClick={handleStartDrawing}
              disabled={analyzing}
            >
              {drawingMode ? 'Desenho Ativo' : 'Iniciar Desenho'}
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={handleClearPolygon}
              disabled={polygonVertices.length === 0}
            >
              Limpar
            </Button>
          </Box>
          
          {drawingMode && (
            <Typography variant="caption" sx={{ display: 'block', color: 'success.main' }}>
              ✓ Modo ativo - Clique no mapa para adicionar vértices
            </Typography>
          )}
        </Box>

        {/* Polygon Vertices Display */}
        {polygonVertices.length > 0 && (
          <Box>
            <Typography variant="subtitle2">
              Vértices ({polygonVertices.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {polygonVertices.map((vertex, i) => (
                <Chip
                  key={i}
                  label={`${i + 1}: ${vertex[0].toFixed(4)}, ${vertex[1].toFixed(4)}`}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Analysis Parameters */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Parâmetros
          </Typography>

          <TextField
            label="Operadora"
            select
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          >
            <MenuItem value="all">Todas</MenuItem>
            <MenuItem value="Vivo">Vivo</MenuItem>
            <MenuItem value="Claro">Claro</MenuItem>
            <MenuItem value="TIM">TIM</MenuItem>
            <MenuItem value="Oi">Oi</MenuItem>
          </TextField>

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption">
              Limite de Sinal: {thresholdDbm} dBm
            </Typography>
            <Slider
              value={thresholdDbm}
              onChange={(e, newValue) => setThresholdDbm(newValue as number)}
              min={-120}
              max={0}
              step={5}
              marks
              disabled={analyzing}
            />
          </Box>

          <Box>
            <Typography variant="caption">
              Espaçamento da Grade: {gridStep} km ({(gridStep * 1000).toFixed(0)}m)
            </Typography>
            <Slider
              value={gridStep}
              onChange={(e, newValue) => setGridStep(newValue as number)}
              min={0.05}
              max={0.5}
              step={0.05}
              marks
              disabled={analyzing}
              valueLabelFormat={(v) => `${(v * 1000).toFixed(0)}m`}
              valueLabelDisplay="auto"
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={analyzing}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleAnalyzeCoverage}
          disabled={polygonVertices.length < 3 || analyzing}
          startIcon={analyzing ? <CircularProgress size={20} /> : undefined}
        >
          {analyzing ? 'Analisando...' : 'Analisar Cobertura'}
        </Button>
      </DialogActions>

      {/* Hidden ref for map integration - will be used by parent to inject handleAddVertex */}
      <input
        type="hidden"
        ref={(el) => {
          if (el && drawingMode) {
            (window as any).__mapClickHandler = handleAddVertex
          }
        }}
      />
    </Dialog>
  )
}

/**
 * Coverage Statistics Display
 */
export function CoverageStats({ stats }: { stats: CoverageStats }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" variant="caption">
              Cobertura
            </Typography>
            <Typography variant="h5" sx={{ color: stats.coverage_pct >= 70 ? 'success.main' : 'warning.main' }}>
              {stats.coverage_pct.toFixed(1)}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" variant="caption">
              Área Sem Cobertura
            </Typography>
            <Typography variant="h6">
              {stats.gap_area_km2.toFixed(2)} km²
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" variant="caption">
              Área Total
            </Typography>
            <Typography variant="h6">
              {stats.total_area_km2.toFixed(2)} km²
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" variant="caption">
              Sinal Médio
            </Typography>
            <Typography variant="h6">
              {stats.avg_signal_dbm !== null ? `${stats.avg_signal_dbm.toFixed(1)} dBm` : 'N/A'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="caption" color="text.secondary">
          Pontos analisados: {stats.grid_points_analyzed} | Grade: 100m
        </Typography>
      </Grid>
    </Grid>
  )
}
