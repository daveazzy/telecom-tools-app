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
} from '@mui/material'
import {
  Add,
  Refresh,
  CellTower,
  LocationOn,
  Search,
} from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import api from '@/lib/api'
import { Tower, TowerCreate } from '@/types'
import { format } from 'date-fns'

export default function TowersPage() {
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(true)
  const [towers, setTowers] = useState<Tower[]>([])
  const [filterOperator, setFilterOperator] = useState<string>('all')
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState<Partial<TowerCreate>>({})

  const loadTowers = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await api.get<Tower[]>('/towers/')
      setTowers(data)
    } catch (error: any) {
      enqueueSnackbar('Erro ao carregar torres', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [enqueueSnackbar])

  useEffect(() => {
    loadTowers()
  }, [loadTowers])

  const handleCreateTower = async () => {
    try {
      if (!formData.latitude || !formData.longitude || !formData.operator || !formData.cell_id) {
        enqueueSnackbar('Preencha os campos obrigatórios', { variant: 'warning' })
        return
      }

      await api.post('/towers/', formData)

      enqueueSnackbar('Torre criada com sucesso!', { variant: 'success' })
      setOpenDialog(false)
      setFormData({})
      loadTowers()
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.detail || 'Erro ao criar torre', { variant: 'error' })
    }
  }

  const filteredTowers = towers.filter(tower => {
    if (filterOperator !== 'all' && tower.operator !== filterOperator) return false
    return true
  })

  const operators = Array.from(new Set(towers.map(t => t.operator)))
  const technologiesCount = Array.from(new Set(towers.map(t => t.technology).filter(Boolean))).length

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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          Torres Celulares
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadTowers}
          >
            Atualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Nova Torre
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CellTower sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography color="text.secondary" variant="caption">
                    Total de Torres
                  </Typography>
                  <Typography variant="h4">
                    {towers.length}
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
                Tecnologias
              </Typography>
              <Typography variant="h4">
                {technologiesCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="caption">
                Última Atualização
              </Typography>
              <Typography variant="body2">
                {towers.length > 0 && towers[0].updated_at
                  ? format(new Date(towers[0].updated_at), 'dd/MM/yyyy')
                  : towers.length > 0
                  ? format(new Date(towers[0].created_at), 'dd/MM/yyyy')
                  : '-'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
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
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Search />}
              disabled
            >
              Buscar OpenCellID
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cell ID</TableCell>
              <TableCell>Localização</TableCell>
              <TableCell>Operadora</TableCell>
              <TableCell>Tecnologia</TableCell>
              <TableCell>Frequência (MHz)</TableCell>
              <TableCell>Altitude (m)</TableCell>
              <TableCell>Data Cadastro</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTowers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhuma torre encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredTowers.map((tower) => (
                <TableRow key={tower.id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {tower.cell_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOn fontSize="small" color="action" />
                      {tower.latitude.toFixed(4)}, {tower.longitude.toFixed(4)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={tower.operator} size="small" color="primary" />
                  </TableCell>
                  <TableCell>{tower.technology || '-'}</TableCell>
                  <TableCell>{tower.frequency_mhz || '-'}</TableCell>
                  <TableCell>{tower.altitude || '-'}</TableCell>
                  <TableCell>
                    {format(new Date(tower.created_at), 'dd/MM/yyyy')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nova Torre Celular</DialogTitle>
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
                label="Altitude (m)"
                type="number"
                value={formData.altitude || ''}
                onChange={(e) => setFormData({ ...formData, altitude: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cell ID *"
                value={formData.cell_id || ''}
                onChange={(e) => setFormData({ ...formData, cell_id: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Operadora *"
                value={formData.operator || ''}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                placeholder="Ex: Vivo, Claro, TIM"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tecnologia"
                value={formData.technology || ''}
                onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
                placeholder="Ex: 4G, 5G"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Frequência (MHz)"
                type="number"
                value={formData.frequency_mhz || ''}
                onChange={(e) => setFormData({ ...formData, frequency_mhz: parseFloat(e.target.value) })}
                placeholder="Ex: 2600"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateTower}>
            Criar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

