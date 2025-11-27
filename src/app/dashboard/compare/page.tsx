'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Divider,
} from '@mui/material'
import {
  Refresh,
  MyLocation,
  TrendingUp,
  SignalCellularAlt,
} from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import api from '@/lib/api'
import { Tower, SignalMeasurement } from '@/types'

interface OperatorStats {
  name: string
  tower_count: number
  coverage_percentage: number
  avg_signal_dbm: number
  signal_quality: string
}

export default function ComparePage() {
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(true)
  const [geolocating, setGeolocating] = useState(false)
  const [towers, setTowers] = useState<Tower[]>([])
  const [signals, setSignals] = useState<SignalMeasurement[]>([])
  const [operatorStats, setOperatorStats] = useState<OperatorStats[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  const calculateStats = useCallback(async () => {
    try {
      setLoading(true)

      // Carregar torres e medições
      const [towersRes, signalsRes] = await Promise.all([
        api.get<Tower[]>('/towers/').catch(() => ({ data: [] })),
        api.get<SignalMeasurement[]>('/signals/').catch(() => ({ data: [] })),
      ])

      const allTowers = towersRes.data || []
      const allSignals = signalsRes.data || []

      // Agrupar torres por operadora
      const operators = new Map<string, Tower[]>()
      allTowers.forEach((tower) => {
        if (!operators.has(tower.operator)) {
          operators.set(tower.operator, [])
        }
        operators.get(tower.operator)!.push(tower)
      })

      // Calcular estatísticas por operadora
      const stats: OperatorStats[] = Array.from(operators.entries()).map(([name, opTowers]) => {
        // Medições dessa operadora
        const opSignals = allSignals.filter((s) => s.operator === name)
        const avgSignal = opSignals.length > 0
          ? opSignals.reduce((sum, s) => sum + s.signal_strength_dbm, 0) / opSignals.length
          : 0

        // Qualidade do sinal
        let quality = 'Não medido'
        if (avgSignal < -120) quality = 'Péssimo'
        else if (avgSignal < -100) quality = 'Fraco'
        else if (avgSignal < -85) quality = 'Bom'
        else if (avgSignal < -70) quality = 'Excelente'
        else quality = 'Excepcional'

        return {
          name,
          tower_count: opTowers.length,
          coverage_percentage: (opTowers.length / allTowers.length) * 100,
          avg_signal_dbm: avgSignal,
          signal_quality: quality,
        }
      })

      // Ordenar por número de torres
      stats.sort((a, b) => b.tower_count - a.tower_count)

      setTowers(allTowers)
      setSignals(allSignals)
      setOperatorStats(stats)
    } catch (error: any) {
      console.error('Erro ao calcular stats:', error)
      enqueueSnackbar('Erro ao carregar dados', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [enqueueSnackbar])

  const handleGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      enqueueSnackbar('Geolocalização não suportada', { variant: 'warning' })
      return
    }

    setGeolocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLocation({ lat: latitude, lng: longitude })
        enqueueSnackbar(`Localização: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, {
          variant: 'success',
        })

        try {
          // Buscar torres próximas
          const res = await api.get<Tower[]>('/towers/nearby', {
            params: {
              latitude,
              longitude,
              radius_km: 10,
            },
          })

          if (res.data && res.data.length > 0) {
            // Recalcular com torres próximas
            const nearbyTowers = res.data
            const operators = new Map<string, Tower[]>()
            nearbyTowers.forEach((tower) => {
              if (!operators.has(tower.operator)) {
                operators.set(tower.operator, [])
              }
              operators.get(tower.operator)!.push(tower)
            })

            const stats: OperatorStats[] = Array.from(operators.entries()).map(([name, opTowers]) => {
              const opSignals = signals.filter((s) => s.operator === name)
              const avgSignal = opSignals.length > 0
                ? opSignals.reduce((sum, s) => sum + s.signal_strength_dbm, 0) / opSignals.length
                : -75 // Default assumindo bom sinal perto da torre

              let quality = 'Não medido'
              if (avgSignal < -120) quality = 'Péssimo'
              else if (avgSignal < -100) quality = 'Fraco'
              else if (avgSignal < -85) quality = 'Bom'
              else if (avgSignal < -70) quality = 'Excelente'
              else quality = 'Excepcional'

              return {
                name,
                tower_count: opTowers.length,
                coverage_percentage: (opTowers.length / nearbyTowers.length) * 100,
                avg_signal_dbm: avgSignal,
                signal_quality: quality,
              }
            })

            stats.sort((a, b) => b.tower_count - a.tower_count)
            setOperatorStats(stats)
            enqueueSnackbar(`${res.data.length} torres próximas encontradas`, {
              variant: 'success',
            })
          }
        } catch (err: any) {
          console.error('Erro ao buscar torres:', err)
        }

        setGeolocating(false)
      },
      () => {
        enqueueSnackbar('Não foi possível obter geolocalização', { variant: 'warning' })
        setGeolocating(false)
      }
    )
  }, [enqueueSnackbar, signals])

  useEffect(() => {
    calculateStats()
  }, [calculateStats])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Excepcional':
        return 'success'
      case 'Excelente':
        return 'success'
      case 'Bom':
        return 'warning'
      case 'Fraco':
        return 'error'
      case 'Péssimo':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800,
                mb: 1,
                fontSize: { xs: '1.8rem', md: '2.2rem' }
              }}
            >
              Comparação de Operadoras
            </Typography>
            <Typography 
              sx={{ 
                color: 'text.secondary',
                fontSize: '1rem'
              }}
            >
              Veja qual operadora oferece melhor cobertura na sua região
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<MyLocation />}
              onClick={handleGeolocation}
              disabled={geolocating}
              sx={{ textTransform: 'none' }}
            >
              {geolocating ? 'Localizando...' : 'Minha Localização'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={calculateStats}
              disabled={loading}
              sx={{ textTransform: 'none' }}
            >
              Atualizar
            </Button>
          </Box>
        </Box>
        <Divider />
      </Box>

      {/* Location Info */}
      {userLocation && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Mostrando dados para a região de <strong>{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</strong>
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="caption">
                Total de Torres
              </Typography>
              <Typography variant="h4">{towers.length}</Typography>
              <Typography variant="caption" color="text.secondary">
                {operatorStats.length} operadoras
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="caption">
                Melhor Cobertura
              </Typography>
              <Typography variant="h5">
                {operatorStats[0]?.name || 'N/A'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {operatorStats[0]?.tower_count} torres
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="caption">
                Melhor Sinal Medido
              </Typography>
              <Typography variant="h5">
                {operatorStats.length > 0
                  ? Math.max(...operatorStats.map((s) => s.avg_signal_dbm)).toFixed(0)
                  : 'N/A'}
                {' '}dBm
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="caption">
                Total de Medições
              </Typography>
              <Typography variant="h4">{signals.length}</Typography>
              <Typography variant="caption" color="text.secondary">
                Localidades
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Comparison Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Análise Detalhada por Operadora
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.light' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Operadora</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Torres
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Cobertura (%)
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Sinal Médio
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Qualidade
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {operatorStats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">
                        Nenhuma operadora encontrada. Use &quot;Minha Localização&quot; para ver dados da sua região.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  operatorStats.map((operator, index) => (
                    <TableRow key={operator.name} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        #{index + 1} {operator.name}
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={operator.tower_count} color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 100 }}>
                            <LinearProgress
                              variant="determinate"
                              value={operator.coverage_percentage}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: 'grey.300',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor:
                                    operator.coverage_percentage > 50
                                      ? 'success.main'
                                      : operator.coverage_percentage > 30
                                      ? 'warning.main'
                                      : 'error.main',
                                },
                              }}
                            />
                          </Box>
                          <Typography variant="caption" sx={{ minWidth: 35 }}>
                            {operator.coverage_percentage.toFixed(1)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          sx={{
                            color: operator.avg_signal_dbm < -100 ? 'error.main' : 'success.main',
                            fontWeight: 600,
                          }}
                        >
                          {operator.avg_signal_dbm.toFixed(1)} dBm
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={operator.signal_quality}
                          color={getQualityColor(operator.signal_quality) as any}
                          size="small"
                          icon={<SignalCellularAlt />}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Nota:</strong> A cobertura é calculada com base no número de torres próximas. A qualidade do sinal
          é baseada em medições reais capturadas no aplicativo. Use &quot;Minha Localização&quot; para ver dados específicos da
          sua região.
        </Typography>
      </Alert>
    </Box>
  )
}
