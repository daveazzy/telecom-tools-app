'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import api from '@/lib/api'
import { RegisterRequest } from '@/types'

export default function RegisterPage() {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    full_name: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    try {
      const registerData: RegisterRequest = {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        full_name: formData.full_name || undefined,
      }

      await api.post('/auth/register', registerData)

      enqueueSnackbar('Conta criada com sucesso! Faça login para continuar.', { 
        variant: 'success' 
      })
      router.push('/login')
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Erro ao criar conta'
      setError(errorMessage)
      enqueueSnackbar(errorMessage, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'white',
      }}
    >
      {/* Back Button */}
      <Box sx={{ p: 2 }}>
        <IconButton 
          onClick={() => router.push('/')}
          sx={{ 
            color: 'text.secondary',
            '&:hover': { bgcolor: 'action.hover' }
          }}
          aria-label="voltar"
        >
          <ArrowBack />
        </IconButton>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          {/* Header */}
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography 
              variant="h4" 
              component="h1"
              sx={{ 
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: '1.8rem', sm: '2.2rem' }
              }}
            >
              Criar Conta
            </Typography>
            <Typography 
              sx={{ 
                color: 'text.secondary',
                fontSize: '1rem'
              }}
            >
              Preencha seus dados para começar
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nome Completo"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              disabled={loading}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                }
              }}
              slotProps={{
                input: {
                  sx: { py: 1.5 }
                }
              }}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                }
              }}
              slotProps={{
                input: {
                  sx: { py: 1.5 }
                }
              }}
            />
            <TextField
              fullWidth
              label="Nome de Usuário"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                }
              }}
              slotProps={{
                input: {
                  sx: { py: 1.5 }
                }
              }}
            />
            <TextField
              fullWidth
              label="Senha"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                }
              }}
              slotProps={{
                input: {
                  sx: { py: 1.5 }
                }
              }}
            />
            <TextField
              fullWidth
              label="Confirmar Senha"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                }
              }}
              slotProps={{
                input: {
                  sx: { py: 1.5 }
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 1,
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Criar Conta'
              )}
            </Button>
          </form>

          {/* Login Link */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>
              Já tem uma conta?{' '}
              <Link
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/login')
                }}
                sx={{ 
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Faça login
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

