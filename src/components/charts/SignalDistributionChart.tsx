'use client'

import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { SignalMeasurement } from '@/types'

interface SignalDistributionChartProps {
  data: SignalMeasurement[]
  title?: string
  height?: number
  loading?: boolean
}

export default function SignalDistributionChart({
  data,
  title = 'Distribuição de Qualidade',
  height = 300,
  loading = false,
}: SignalDistributionChartProps) {
  // Classificar sinais por qualidade
  const distribution = data.reduce(
    (acc, item) => {
      const signal = item.signal_strength_dbm
      if (signal >= -70) acc.excelente++
      else if (signal >= -85) acc.bom++
      else if (signal >= -100) acc.regular++
      else acc.fraco++
      return acc
    },
    { excelente: 0, bom: 0, regular: 0, fraco: 0 }
  )

  const chartData = [
    { name: 'Excelente (≥ -70 dBm)', value: distribution.excelente, color: '#4caf50' },
    { name: 'Bom (-70 a -85 dBm)', value: distribution.bom, color: '#8bc34a' },
    { name: 'Regular (-85 a -100 dBm)', value: distribution.regular, color: '#ff9800' },
    { name: 'Fraco (< -100 dBm)', value: distribution.fraco, color: '#f44336' },
  ].filter((item) => item.value > 0) // Remover vazios

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
            <Typography color="text.secondary">Sem dados disponíveis</Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  const renderLabel = (entry: any) => {
    const percent = ((entry.value / data.length) * 100).toFixed(0)
    return `${percent}%`
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 8 }}
              formatter={(value: number) => [`${value} medições`, 'Quantidade']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

