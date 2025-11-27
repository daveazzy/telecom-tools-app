'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Divider,
} from '@mui/material'
import {
  SignalCellularAlt,
  CellTower,
  Refresh,
  TrendingUp,
} from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import api from '@/lib/api'
import { SignalMeasurement, Tower } from '@/types'
import dynamic from 'next/dynamic'

const SignalTrendChart = dynamic(() => import('@/components/charts/SignalTrendChart'), { ssr: false })
const OperatorComparisonChart = dynamic(() => import('@/components/charts/OperatorComparisonChart'), { ssr: false })

export default function DashboardPage() {
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(true)
  const [signals, setSignals] = useState<SignalMeasurement[]>([])
  const [towers, setTowers] = useState<Tower[]>([])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [signalsRes, towersRes] = await Promise.all([
        api.get<SignalMeasurement[]>('/signals/').catch(() => ({ data: [] })),
        api.get<Tower[]>('/towers/').catch(() => ({ data: [] })),
      ])

      setSignals(signalsRes.data || [])
      setTowers(towersRes.data || [])
    } catch (error: any) {
      enqueueSnackbar('Erro ao carregar dados', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [enqueueSnackbar])

  const avgSignal = signals.length > 0
    ? (signals.reduce((sum, s) => sum + s.signal_strength_dbm, 0) / signals.length).toFixed(1)
    : 0
  
  const operatorsCount = Array.from(new Set(towers.map(t => t.operator))).length
  const lastMeasurement = signals.length > 0 ? signals[signals.length - 1] : null

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800,
                mb: 1,
                fontSize: { xs: '1.8rem', md: '2.2rem' }
              }}
            >
              Dashboard
            </Typography>
            <Typography 
              sx={{ 
                color: 'text.secondary',
                fontSize: '1rem'
              }}
            >
              Análise de cobertura celular em sua região
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />} 
            onClick={loadData} 
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            Atualizar
          </Button>
        </Box>
        <Divider />
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Box>
            <Typography 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.875rem',
                fontWeight: 600,
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Medições
            </Typography>
            <Typography 
              sx={{ 
                fontSize: '2rem',
                fontWeight: 700,
                mb: 0.5
              }}
            >
              {signals.length}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              Média: {avgSignal} dBm
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Box>
            <Typography 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.875rem',
                fontWeight: 600,
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Torres Mapeadas
            </Typography>
            <Typography 
              sx={{ 
                fontSize: '2rem',
                fontWeight: 700,
                mb: 0.5
              }}
            >
              {towers.length}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              {operatorsCount} operadoras
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Box>
            <Typography 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.875rem',
                fontWeight: 600,
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Última Medição
            </Typography>
            <Typography 
              sx={{ 
                fontSize: '2rem',
                fontWeight: 700,
                mb: 0.5
              }}
            >
              {lastMeasurement?.operator || '-'}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              {lastMeasurement ? `${lastMeasurement.signal_strength_dbm} dBm` : 'Nenhuma medição'}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Box>
            <Typography 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.875rem',
                fontWeight: 600,
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Qualidade Média
            </Typography>
            <Typography 
              sx={{ 
                fontSize: '2rem',
                fontWeight: 700,
                mb: 0.5,
                color: parseFloat(String(avgSignal)) >= -70 ? 'success.main' : 'warning.main'
              }}
            >
              {parseFloat(String(avgSignal)) >= -70 ? 'Ótimo' : 'Bom'}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              Sinal detectado
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={4}>
        {signals.length > 0 && (
          <Grid item xs={12} md={6}>
            <SignalTrendChart data={signals.slice(-20)} loading={loading} />
          </Grid>
        )}
        {signals.length > 0 && (
          <Grid item xs={12} md={6}>
            <OperatorComparisonChart data={signals} loading={loading} />
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

