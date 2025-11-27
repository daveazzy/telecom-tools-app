'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  IconButton,
} from '@mui/material'
import {
  Add,
  Refresh,
  SignalCellularAlt,
  LocationOn,
  SignalCellular4Bar,
  SignalCellularNull,
  MyLocation,
  NetworkCheck,
  Close,
} from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import api from '@/lib/api'
import { SignalMeasurement, SignalMeasurementCreate } from '@/types'
import { format } from 'date-fns'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useNetworkInfo, getSignalTypeFromNetwork, getTechnologyFromEffectiveType } from '@/hooks/useNetworkInfo'

export default function SignalsPage() {
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(true)
  const [signals, setSignals] = useState<SignalMeasurement[]>([])
  const [filterOperator, setFilterOperator] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState<Partial<SignalMeasurementCreate>>({
    signal_type: '4g',
    measured_at: new Date().toISOString(),
  })

  // Hooks de captura automática
  const { location, error: geoError, loading: geoLoading, getCurrentPosition, isSupported: geoSupported } = useGeolocation()
  const { networkInfo, isSupported: networkSupported } = useNetworkInfo()

  const loadSignals = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await api.get<SignalMeasurement[]>('/signals/')
      setSignals(data)
    } catch (error: any) {
      enqueueSnackbar('Erro ao carregar medições', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [enqueueSnackbar])

  // Função para captura automática (botão "Medir Aqui")
  const handleQuickMeasure = useCallback(() => {
    if (!geoSupported) {
      enqueueSnackbar('Geolocalização não suportada pelo navegador', { variant: 'error' })
      return
    }

    enqueueSnackbar('Capturando localização...', { variant: 'info' })
    getCurrentPosition()
  }, [geoSupported, getCurrentPosition, enqueueSnackbar])

  // Atualizar form quando localização é capturada
  useEffect(() => {
    if (location.latitude && location.longitude) {
      const signalType = getSignalTypeFromNetwork(networkInfo.effectiveType, networkInfo.type)
      const technology = getTechnologyFromEffectiveType(networkInfo.effectiveType)

      setFormData((prev) => ({
        ...prev,
        latitude: location.latitude!,
        longitude: location.longitude!,
        altitude: location.altitude || undefined,
        signal_type: signalType,
        technology: technology || prev.technology,
      }))

      setOpenDialog(true)
      enqueueSnackbar('Localização capturada! Complete os dados.', { variant: 'success' })
    }
  }, [location, networkInfo, enqueueSnackbar])

  // Mostrar erro de geolocalização
  useEffect(() => {
    if (geoError) {
      enqueueSnackbar(`Erro de geolocalização: ${geoError.message}`, { variant: 'error' })
    }
  }, [geoError, enqueueSnackbar])

  useEffect(() => {
    loadSignals()
  }, [loadSignals])

  const handleCreateSignal = async () => {
    try {
      if (!formData.latitude || !formData.longitude || !formData.signal_strength_dbm) {
        enqueueSnackbar('Preencha os campos obrigatórios', { variant: 'warning' })
        return
      }

      await api.post('/signals/', {
        ...formData,
        measured_at: formData.measured_at || new Date().toISOString(),
      })

      enqueueSnackbar('Medição criada com sucesso!', { variant: 'success' })
      setOpenDialog(false)
      setFormData({ signal_type: '4g', measured_at: new Date().toISOString() })
      loadSignals()
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.detail || 'Erro ao criar medição', { variant: 'error' })
    }
  }

  const getSignalQualityColor = (dbm: number) => {
    if (dbm >= -70) return 'success'
    if (dbm >= -85) return 'warning'
    return 'error'
  }

  const getSignalQualityLabel = (dbm: number) => {
    if (dbm >= -70) return 'Excelente'
    if (dbm >= -85) return 'Bom'
    if (dbm >= -100) return 'Regular'
    return 'Fraco'
  }

  const filteredSignals = signals.filter(signal => {
    if (filterOperator !== 'all' && signal.operator !== filterOperator) return false
    if (filterType !== 'all' && signal.signal_type !== filterType) return false
    return true
  })

  const operators = Array.from(new Set(signals.map(s => s.operator).filter(Boolean)))
  const avgSignal = signals.length > 0
    ? (signals.reduce((sum, s) => sum + s.signal_strength_dbm, 0) / signals.length).toFixed(1)
    : 0

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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">
          Medições de Sinal
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadSignals}
          >
            Atualizar
          </Button>
          <Tooltip title={geoSupported ? "Capturar localização e dados de rede automaticamente" : "Geolocalização não suportada"}>
            <span>
              <Button
                variant="contained"
                color="success"
                startIcon={geoLoading ? <CircularProgress size={20} color="inherit" /> : <MyLocation />}
                onClick={handleQuickMeasure}
                disabled={!geoSupported || geoLoading}
              >
                {geoLoading ? 'Capturando...' : 'Medir Aqui'}
              </Button>
            </span>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Manual
          </Button>
        </Box>
      </Box>

      {/* Network Info Card */}
      {networkSupported && networkInfo.isOnline && (
        <Alert 
          severity="info" 
          icon={<NetworkCheck />} 
          sx={{ mb: 3 }}
          action={
            <Chip 
              label={networkInfo.effectiveType?.toUpperCase() || 'N/A'} 
              color="primary" 
              size="small" 
            />
          }
        >
          <strong>Conexão Detectada:</strong> {networkInfo.type || 'Desconhecida'}
          {networkInfo.downlink && ` • Velocidade: ${networkInfo.downlink} Mbps`}
          {networkInfo.rtt && ` • Latência: ${networkInfo.rtt} ms`}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SignalCellularAlt sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography color="text.secondary" variant="caption">
                    Total de Medições
                  </Typography>
                  <Typography variant="h4">
                    {signals.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {parseFloat(String(avgSignal)) >= -70 ? (
                  <SignalCellular4Bar sx={{ fontSize: 40, color: 'success.main' }} />
                ) : (
                  <SignalCellularNull sx={{ fontSize: 40, color: 'error.main' }} />
                )}
                <Box>
                  <Typography color="text.secondary" variant="caption">
                    Sinal Médio
                  </Typography>
                  <Typography variant="h4">
                    {avgSignal} dBm
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="caption">
                Operadoras
              </Typography>
              <Typography variant="h4">
                {operators.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="caption">
                Última Medição
              </Typography>
              <Typography variant="body2">
                {signals.length > 0 ? format(new Date(signals[0].measured_at), 'dd/MM/yyyy HH:mm') : '-'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Operadora"
              value={filterOperator}
              onChange={(e) => setFilterOperator(e.target.value)}
            >
              <MenuItem value="all">Todas</MenuItem>
              {operators.map((op) => (
                <MenuItem key={op} value={op}>
                  {op}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Tipo de Sinal"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="4g">4G</MenuItem>
              <MenuItem value="5g">5G</MenuItem>
              <MenuItem value="wifi">WiFi</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data/Hora</TableCell>
              <TableCell>Localização</TableCell>
              <TableCell>Operadora</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Sinal (dBm)</TableCell>
              <TableCell>Qualidade</TableCell>
              <TableCell>Tecnologia</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSignals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhuma medição encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredSignals.map((signal) => (
                <TableRow key={signal.id}>
                  <TableCell>
                    {format(new Date(signal.measured_at), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOn fontSize="small" color="action" />
                      {signal.latitude.toFixed(4)}, {signal.longitude.toFixed(4)}
                    </Box>
                  </TableCell>
                  <TableCell>{signal.operator || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={signal.signal_type.toUpperCase()}
                      size="small"
                      color={signal.signal_type === '5g' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        color: getSignalQualityColor(signal.signal_strength_dbm) + '.main',
                        fontWeight: 'bold'
                      }}
                    >
                      {signal.signal_strength_dbm} dBm
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getSignalQualityLabel(signal.signal_strength_dbm)}
                      color={getSignalQualityColor(signal.signal_strength_dbm)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{signal.technology || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nova Medição de Sinal</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Latitude *"
                type="number"
                value={formData.latitude || ''}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                inputProps={{ step: 0.000001 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Longitude *"
                type="number"
                value={formData.longitude || ''}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                inputProps={{ step: 0.000001 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Tipo de Sinal *"
                value={formData.signal_type}
                onChange={(e) => setFormData({ ...formData, signal_type: e.target.value as any })}
              >
                <MenuItem value="4g">4G/LTE</MenuItem>
                <MenuItem value="5g">5G</MenuItem>
                <MenuItem value="wifi">WiFi</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Força do Sinal (dBm) *"
                type="number"
                value={formData.signal_strength_dbm || ''}
                onChange={(e) => setFormData({ ...formData, signal_strength_dbm: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Operadora"
                value={formData.operator || ''}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tecnologia"
                value={formData.technology || ''}
                onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
                placeholder="Ex: LTE, 5G NR"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Frequência (MHz)"
                type="number"
                value={formData.frequency_mhz || ''}
                onChange={(e) => setFormData({ ...formData, frequency_mhz: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cell ID"
                value={formData.cell_id || ''}
                onChange={(e) => setFormData({ ...formData, cell_id: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateSignal}>
            Criar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

