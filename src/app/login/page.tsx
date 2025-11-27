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
import { useAuthStore } from '@/lib/store'
import { User, Token } from '@/types'

export default function LoginPage() {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const { setUser, setToken } = useAuthStore()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    password: '',
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

    try {
      const params = new URLSearchParams()
      params.append('username', formData.username)
      params.append('password', formData.password)

      const { data: tokenData } = await api.post<Token>(
        '/auth/login',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )

      localStorage.setItem('token', tokenData.access_token)
      setToken(tokenData.access_token)

      const { data: userData } = await api.get<User>('/users/me')

      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))

      enqueueSnackbar('Login realizado com sucesso!', { variant: 'success' })
      router.push('/dashboard')
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Erro ao fazer login'
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
              Bem-vindo
            </Typography>
            <Typography 
              sx={{ 
                color: 'text.secondary',
                fontSize: '1rem'
              }}
            >
              Faça login para acessar sua conta
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
              label="Usuário ou Email"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              autoFocus
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
                'Entrar'
              )}
            </Button>
          </form>

          {/* Signup Link */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>
              Não tem uma conta?{' '}
              <Link
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/register')
                }}
                sx={{ 
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Registre-se aqui
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

