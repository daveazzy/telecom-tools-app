'use client'

import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import { SignalMeasurement } from '@/types'

interface SignalTrendChartProps {
  data: SignalMeasurement[]
  title?: string
  height?: number
  loading?: boolean
}

export default function SignalTrendChart({
  data,
  title = 'Evolução do Sinal',
  height = 300,
  loading = false,
}: SignalTrendChartProps) {
  // Preparar dados para o gráfico
  const chartData = data
    .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime())
    .map((item) => ({
      date: format(new Date(item.measured_at), 'dd/MM HH:mm'),
      signal: item.signal_strength_dbm,
      operator: item.operator || 'N/A',
    }))

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

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              domain={[-120, -40]}
              tick={{ fontSize: 12 }}
              label={{ value: 'dBm', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 8 }}
              formatter={(value: number) => [`${value} dBm`, 'Sinal']}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="signal" 
              stroke="#1976d2" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Força do Sinal"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

