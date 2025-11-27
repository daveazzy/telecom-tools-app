'use client'

import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { SignalMeasurement } from '@/types'

interface OperatorComparisonChartProps {
  data: SignalMeasurement[]
  title?: string
  height?: number
  loading?: boolean
}

export default function OperatorComparisonChart({
  data,
  title = 'Comparação por Operadora',
  height = 300,
  loading = false,
}: OperatorComparisonChartProps) {
  // Calcular média por operadora
  const operatorStats = data.reduce((acc, item) => {
    const op = item.operator || 'Desconhecida'
    if (!acc[op]) {
      acc[op] = { sum: 0, count: 0, signals: [] }
    }
    acc[op].sum += item.signal_strength_dbm
    acc[op].count += 1
    acc[op].signals.push(item.signal_strength_dbm)
    return acc
  }, {} as Record<string, { sum: number; count: number; signals: number[] }>)

  const chartData = Object.entries(operatorStats)
    .map(([operator, stats]) => ({
      operator,
      avgSignal: Math.round((stats.sum / stats.count) * 10) / 10,
      count: stats.count,
      min: Math.min(...stats.signals),
      max: Math.max(...stats.signals),
    }))
    .sort((a, b) => b.avgSignal - a.avgSignal) // Melhor primeiro

  // Cores baseadas na qualidade
  const getColor = (signal: number) => {
    if (signal >= -70) return '#4caf50' // Verde
    if (signal >= -85) return '#ff9800' // Laranja
    return '#f44336' // Vermelho
  }

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

  if (chartData.length === 0) {
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
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="operator" tick={{ fontSize: 12 }} />
            <YAxis 
              domain={[-120, -40]}
              tick={{ fontSize: 12 }}
              label={{ value: 'dBm (média)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 8 }}
              formatter={(value: number, name: string, props: any) => {
                if (name === 'avgSignal') {
                  return [
                    `${value} dBm (Média de ${props.payload.count} medições)`,
                    'Sinal Médio',
                  ]
                }
                return [value, name]
              }}
            />
            <Legend />
            <Bar dataKey="avgSignal" name="Sinal Médio" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.avgSignal)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

