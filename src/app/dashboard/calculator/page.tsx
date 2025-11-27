'use client'

import { useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Tabs,
  Tab,
  Alert,
  Chip,
} from '@mui/material'
import {
  Calculate,
  CheckCircle,
  Error,
} from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import api from '@/lib/api'
import { LinkBudgetRequest, LinkBudgetResponse, PathLossRequest, PathLossResponse } from '@/types'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

export default function CalculatorPage() {
  const { enqueueSnackbar } = useSnackbar()
  const [tabValue, setTabValue] = useState(0)

  // Link Budget State
  const [linkBudget, setLinkBudget] = useState<Partial<LinkBudgetRequest>>({
    tx_power_dbm: 43,
    tx_gain_dbi: 18,
    rx_gain_dbi: 2,
    frequency_mhz: 2600,
    distance_km: 5,
    rx_sensitivity_dbm: -110,
  })
  const [linkBudgetResult, setLinkBudgetResult] = useState<LinkBudgetResponse | null>(null)

  // Path Loss State
  const [pathLoss, setPathLoss] = useState<Partial<PathLossRequest>>({
    frequency_mhz: 2600,
    distance_km: 5,
    tx_height_m: 30,
    rx_height_m: 1.5,
    environment: 'urban',
  })
  const [pathLossResult, setPathLossResult] = useState<PathLossResponse | null>(null)

  const calculateLinkBudget = async () => {
    try {
      const { data } = await api.post<LinkBudgetResponse>('/calculations/link-budget', linkBudget)
      setLinkBudgetResult(data)
      enqueueSnackbar('Cálculo realizado com sucesso!', { variant: 'success' })
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.detail || 'Erro ao calcular', { variant: 'error' })
    }
  }

  const calculatePathLoss = async () => {
    try {
      const { data } = await api.post<PathLossResponse>('/calculations/path-loss', pathLoss)
      setPathLossResult(data)
      enqueueSnackbar('Cálculo realizado com sucesso!', { variant: 'success' })
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.detail || 'Erro ao calcular', { variant: 'error' })
    }
  }

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        Calculadora de RF
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Realize cálculos de Link Budget, Path Loss e outros parâmetros de RF
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Link Budget" />
          <Tab label="Path Loss" />
        </Tabs>

        {/* Link Budget Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Input */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Parâmetros de Entrada
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Potência TX (dBm)"
                        type="number"
                        value={linkBudget.tx_power_dbm || ''}
                        onChange={(e) => setLinkBudget({ ...linkBudget, tx_power_dbm: parseFloat(e.target.value) })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Ganho Antena TX (dBi)"
                        type="number"
                        value={linkBudget.tx_gain_dbi || ''}
                        onChange={(e) => setLinkBudget({ ...linkBudget, tx_gain_dbi: parseFloat(e.target.value) })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Ganho Antena RX (dBi)"
                        type="number"
                        value={linkBudget.rx_gain_dbi || ''}
                        onChange={(e) => setLinkBudget({ ...linkBudget, rx_gain_dbi: parseFloat(e.target.value) })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Frequência (MHz)"
                        type="number"
                        value={linkBudget.frequency_mhz || ''}
                        onChange={(e) => setLinkBudget({ ...linkBudget, frequency_mhz: parseFloat(e.target.value) })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Distância (km)"
                        type="number"
                        value={linkBudget.distance_km || ''}
                        onChange={(e) => setLinkBudget({ ...linkBudget, distance_km: parseFloat(e.target.value) })}
                        inputProps={{ step: 0.1 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Sensibilidade RX (dBm)"
                        type="number"
                        value={linkBudget.rx_sensitivity_dbm || ''}
                        onChange={(e) => setLinkBudget({ ...linkBudget, rx_sensitivity_dbm: parseFloat(e.target.value) })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Perdas Adicionais (dB)"
                        type="number"
                        value={linkBudget.additional_losses_db || ''}
                        onChange={(e) => setLinkBudget({ ...linkBudget, additional_losses_db: parseFloat(e.target.value) })}
                        placeholder="Cabos, conectores, etc."
                      />
                    </Grid>
                  </Grid>

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Calculate />}
                    onClick={calculateLinkBudget}
                    sx={{ mt: 3 }}
                  >
                    Calcular Link Budget
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Results */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resultados
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {!linkBudgetResult ? (
                    <Alert severity="info">
                      Preencha os parâmetros e clique em &quot;Calcular&quot; para ver os resultados
                    </Alert>
                  ) : (
                    <Box>
                      {/* Status */}
                      <Box sx={{ mb: 3, textAlign: 'center' }}>
                        {linkBudgetResult.is_viable ? (
                          <Chip
                            icon={<CheckCircle />}
                            label="Link VIÁVEL"
                            color="success"
                            sx={{ fontSize: '1rem', py: 2, px: 1 }}
                          />
                        ) : (
                          <Chip
                            icon={<Error />}
                            label="Link INVIÁVEL"
                            color="error"
                            sx={{ fontSize: '1rem', py: 2, px: 1 }}
                          />
                        )}
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                            <Typography variant="caption" color="text.secondary">
                              Potência Recebida
                            </Typography>
                            <Typography variant="h5">
                              {linkBudgetResult.received_power_dbm.toFixed(2)} dBm
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Path Loss
                            </Typography>
                            <Typography variant="h6">
                              {linkBudgetResult.path_loss_db.toFixed(2)} dB
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Free Space Loss
                            </Typography>
                            <Typography variant="h6">
                              {linkBudgetResult.free_space_loss_db.toFixed(2)} dB
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              EIRP
                            </Typography>
                            <Typography variant="h6">
                              {linkBudgetResult.eirp_dbm.toFixed(2)} dBm
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Link Margin
                            </Typography>
                            <Typography 
                              variant="h6"
                              color={linkBudgetResult.link_margin_db > 0 ? 'success.main' : 'error.main'}
                            >
                              {linkBudgetResult.link_margin_db.toFixed(2)} dB
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Fade Margin
                            </Typography>
                            <Typography variant="h6">
                              {linkBudgetResult.fade_margin_db.toFixed(2)} dB
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Path Loss Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {/* Input */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Parâmetros de Entrada
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Frequência (MHz)"
                        type="number"
                        value={pathLoss.frequency_mhz || ''}
                        onChange={(e) => setPathLoss({ ...pathLoss, frequency_mhz: parseFloat(e.target.value) })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Distância (km)"
                        type="number"
                        value={pathLoss.distance_km || ''}
                        onChange={(e) => setPathLoss({ ...pathLoss, distance_km: parseFloat(e.target.value) })}
                        inputProps={{ step: 0.1 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Altura TX (m)"
                        type="number"
                        value={pathLoss.tx_height_m || ''}
                        onChange={(e) => setPathLoss({ ...pathLoss, tx_height_m: parseFloat(e.target.value) })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Altura RX (m)"
                        type="number"
                        value={pathLoss.rx_height_m || ''}
                        onChange={(e) => setPathLoss({ ...pathLoss, rx_height_m: parseFloat(e.target.value) })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        select
                        label="Ambiente"
                        value={pathLoss.environment || 'urban'}
                        onChange={(e) => setPathLoss({ ...pathLoss, environment: e.target.value as any })}
                        SelectProps={{ native: true }}
                      >
                        <option value="urban">Urbano</option>
                        <option value="suburban">Suburbano</option>
                        <option value="rural">Rural</option>
                      </TextField>
                    </Grid>
                  </Grid>

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Calculate />}
                    onClick={calculatePathLoss}
                    sx={{ mt: 3 }}
                  >
                    Calcular Path Loss
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Results */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resultados
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {!pathLossResult ? (
                    <Alert severity="info">
                      Preencha os parâmetros e clique em &quot;Calcular&quot; para ver os resultados
                    </Alert>
                  ) : (
                    <Box>
                      <Paper sx={{ p: 3, bgcolor: 'primary.50', mb: 3, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Path Loss Total
                        </Typography>
                        <Typography variant="h3" color="primary.main">
                          {pathLossResult.path_loss_db.toFixed(2)} dB
                        </Typography>
                      </Paper>

                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Modelo Utilizado
                            </Typography>
                            <Typography variant="h6">
                              {pathLossResult.model_used}
                            </Typography>
                          </Paper>
                        </Grid>
                        {Object.entries(pathLossResult.parameters).map(([key, value]) => (
                          <Grid item xs={12} sm={6} key={key}>
                            <Paper sx={{ p: 2 }}>
                              <Typography variant="caption" color="text.secondary">
                                {key.replace(/_/g, ' ').toUpperCase()}
                              </Typography>
                              <Typography variant="body1">
                                {typeof value === 'number' ? value.toFixed(2) : String(value)}
                              </Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>

                      <Alert severity="info" sx={{ mt: 3 }}>
                        <Typography variant="caption">
                          <strong>Nota:</strong> Os modelos de propagação são aproximações.
                          Em ambientes reais, considere fatores como obstáculos, clima e interferências.
                        </Typography>
                      </Alert>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  )
}

