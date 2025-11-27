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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material'
import {
  Add,
  Refresh,
  Assessment as AssessmentIcon,
  Download,
  PictureAsPdf,
  Close,
} from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import api from '@/lib/api'
import { Report, ReportCreate } from '@/types'
import { format } from 'date-fns'

export default function ReportsPage() {
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<Report[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [formData, setFormData] = useState<Partial<ReportCreate>>({
    report_type: 'signal_analysis',
  })

  const loadReports = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await api.get<Report[]>('/reports/')
      setReports(data)
    } catch (error: any) {
      enqueueSnackbar('Erro ao carregar relatórios', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [enqueueSnackbar])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const handleCreateReport = async () => {
    if (!formData.title || !formData.report_type) {
      enqueueSnackbar('Preencha todos os campos obrigatórios', { variant: 'warning' })
      return
    }

    try {
      setGenerating(true)
      await api.post('/reports/', {
        ...formData,
        report_data: {}, // Dados do relatório (backend processará)
      })
      enqueueSnackbar('Relatório criado com sucesso!', { variant: 'success' })
      setOpenDialog(false)
      setFormData({ report_type: 'signal_analysis' })
      loadReports()
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.detail || 'Erro ao criar relatório', { variant: 'error' })
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadPDF = async (reportId: number, title: string) => {
    try {
      enqueueSnackbar('Baixando relatório...', { variant: 'info' })
      
      const response = await api.get(`/reports/${reportId}/pdf`, {
        responseType: 'blob',
      })

      // Criar blob e link de download
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `relatorio_${title.replace(/\s/g, '_')}_${reportId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      enqueueSnackbar('Download concluído!', { variant: 'success' })
    } catch (error: any) {
      enqueueSnackbar('Erro ao fazer download do PDF', { variant: 'error' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'processing':
        return 'warning'
      case 'failed':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído'
      case 'processing':
        return 'Processando'
      case 'failed':
        return 'Falhou'
      default:
        return status
    }
  }

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'signal_analysis':
        return 'Análise de Sinal'
      case 'coverage_map':
        return 'Mapa de Cobertura'
      case 'operator_comparison':
        return 'Comparação de Operadoras'
      case 'speed_test':
        return 'Testes de Velocidade'
      default:
        return type
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
          Relatórios
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadReports}>
            Atualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Novo Relatório
          </Button>
        </Box>
      </Box>

      {/* Info */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Relatórios PDF profissionais com análises, gráficos e mapas. Após criar, aguarde o processamento antes de baixar.
      </Alert>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="caption">
                Total de Relatórios
              </Typography>
              <Typography variant="h4">{reports.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="caption">
                Concluídos
              </Typography>
              <Typography variant="h4">
                {reports.filter((r) => r.status === 'completed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="caption">
                Em Processamento
              </Typography>
              <Typography variant="h4">
                {reports.filter((r) => r.status === 'processing').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reports Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Meus Relatórios
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Título</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell>Criado em</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary" sx={{ py: 3 }}>
                        Nenhum relatório criado. Clique em &quot;Novo Relatório&quot; para começar.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {report.title}
                          </Typography>
                          {report.description && (
                            <Typography variant="caption" color="text.secondary">
                              {report.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{getReportTypeLabel(report.report_type)}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={getStatusLabel(report.status)}
                          color={getStatusColor(report.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{format(new Date(report.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Baixar PDF">
                          <span>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleDownloadPDF(report.id, report.title)}
                              disabled={report.status !== 'completed'}
                            >
                              <PictureAsPdf />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Report Dialog */}
      <Dialog open={openDialog} onClose={() => !generating && setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Novo Relatório</Typography>
            <IconButton onClick={() => setOpenDialog(false)} disabled={generating}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Título"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <TextField
              fullWidth
              select
              label="Tipo de Relatório"
              value={formData.report_type || ''}
              onChange={(e) => setFormData({ ...formData, report_type: e.target.value })}
              required
            >
              <MenuItem value="signal_analysis">Análise de Sinal</MenuItem>
              <MenuItem value="coverage_map">Mapa de Cobertura</MenuItem>
              <MenuItem value="operator_comparison">Comparação de Operadoras</MenuItem>
              <MenuItem value="speed_test">Testes de Velocidade</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Descrição"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={generating}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateReport}
            disabled={generating}
            startIcon={generating ? <CircularProgress size={20} /> : <AssessmentIcon />}
          >
            {generating ? 'Gerando...' : 'Criar Relatório'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
