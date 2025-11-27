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
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Alert,
} from '@mui/material'
import {
  Refresh,
  Speed as SpeedIcon,
  PlayArrow,
  Close,
} from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import api from '@/lib/api'
import { SpeedTest, SpeedTestCreate } from '@/types'
import { format } from 'date-fns'
import SpeedTestRunner, { SpeedTestResult } from '@/components/speedtest/SpeedTestRunner'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useNetworkInfo } from '@/hooks/useNetworkInfo'

export default function SpeedTestsPage() {
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(true)
  const [tests, setTests] = useState<SpeedTest[]>([])
  const [openTestDialog, setOpenTestDialog] = useState(false)

  // Hooks de geolocalização
  const { location, getCurrentPosition, isSupported: geoSupported } = useGeolocation()
  const { networkInfo } = useNetworkInfo()

  const loadTests = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await api.get<SpeedTest[]>('/speed-tests/')
      setTests(data)
    } catch (error: any) {
      enqueueSnackbar('Erro ao carregar testes', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [enqueueSnackbar])

  useEffect(() => {
    loadTests()
  }, [loadTests])

  // Callback quando teste de velocidade termina
  const handleSpeedTestComplete = async (result: SpeedTestResult) => {
    enqueueSnackbar('Teste concluído! Salvando resultado...', { variant: 'info' })

    // Capturar localização se disponível
    if (geoSupported && !location.latitude) {
      getCurrentPosition()
    }

    const testData: SpeedTestCreate = {
      download_mbps: result.download_mbps,
      upload_mbps: result.upload_mbps,
      ping_ms: result.ping_ms,
      jitter_ms: result.jitter_ms,
      connection_type: networkInfo.type || undefined,
      isp: undefined, // Não detectável pelo navegador
      latitude: location.latitude || undefined,
      longitude: location.longitude || undefined,
      tested_at: new Date().toISOString(),
    }

    try {
      await api.post('/speed-tests/', testData)
      enqueueSnackbar('Resultado salvo com sucesso!', { variant: 'success' })
      setOpenTestDialog(false)
      loadTests()
    } catch (error: any) {
      enqueueSnackbar('Erro ao salvar resultado', { variant: 'error' })
    }
  }

  const handleSpeedTestError = (error: string) => {
    enqueueSnackbar(`Erro no teste: ${error}`, { variant: 'error' })
  }

  // Estatísticas
  const avgDownload = tests.length > 0
    ? (tests.reduce((sum, t) => sum + t.download_mbps, 0) / tests.length).toFixed(1)
    : 0
  const avgUpload = tests.length > 0
    ? (tests.reduce((sum, t) => sum + t.upload_mbps, 0) / tests.length).toFixed(1)
    : 0
  const avgPing = tests.length > 0
    ? (tests.reduce((sum, t) => sum + t.ping_ms, 0) / tests.length).toFixed(0)
    : 0

  const getQualityChip = (value: number, type: 'download' | 'upload' | 'ping') => {
    if (type === 'ping') {
      if (value <= 50) return <Chip label="Excelente" color="success" size="small" />
      if (value <= 100) return <Chip label="Bom" color="warning" size="small" />
      return <Chip label="Alto" color="error" size="small" />
    } else {
      // download/upload
      if (value >= 50) return <Chip label="Excelente" color="success" size="small" />
      if (value >= 10) return <Chip label="Bom" color="warning" size="small" />
      return <Chip label="Fraco" color="error" size="small" />
    }
  }

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
          Testes de Velocidade
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadTests}>
            Atualizar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrow />}
            onClick={() => setOpenTestDialog(true)}
          >
            Iniciar Teste de Velocidade
          </Button>
        </Box>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Teste de Velocidade:</strong> Mede a velocidade de download, upload, latência e jitter usando servidores públicos.
        O teste leva aproximadamente 30-60 segundos para ser concluído.
      </Alert>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="caption">
                Download Médio
              </Typography>
              <Typography variant="h4">{avgDownload} Mbps</Typography>
              <Typography variant="caption" color="text.secondary">
                {tests.length} testes realizados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="caption">
                Upload Médio
              </Typography>
              <Typography variant="h4">{avgUpload} Mbps</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="caption">
                Ping Médio
              </Typography>
              <Typography variant="h4">{avgPing} ms</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tests Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Histórico de Testes
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data/Hora</TableCell>
                  <TableCell align="center">Download</TableCell>
                  <TableCell align="center">Upload</TableCell>
                  <TableCell align="center">Ping</TableCell>
                  <TableCell align="center">Jitter</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary" sx={{ py: 3 }}>
                        Nenhum teste foi realizado ainda. Clique em &quot;Iniciar Teste de Velocidade&quot; para começar.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  tests.map((test) => (
                    <TableRow key={test.id} hover>
                      <TableCell>{format(new Date(test.tested_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                      <TableCell align="center">
                        <Box>
                          <Typography variant="body2">{test.download_mbps} Mbps</Typography>
                          {getQualityChip(test.download_mbps, 'download')}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box>
                          <Typography variant="body2">{test.upload_mbps} Mbps</Typography>
                          {getQualityChip(test.upload_mbps, 'upload')}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box>
                          <Typography variant="body2">{test.ping_ms} ms</Typography>
                          {getQualityChip(test.ping_ms, 'ping')}
                        </Box>
                      </TableCell>
                      <TableCell align="center">{test.jitter_ms} ms</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Speed Test Dialog */}
      <Dialog open={openTestDialog} onClose={() => setOpenTestDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Teste de Velocidade</Typography>
            <IconButton onClick={() => setOpenTestDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <SpeedTestRunner onComplete={handleSpeedTestComplete} onError={handleSpeedTestError} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}
