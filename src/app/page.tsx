'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Container, Box, Typography, Button } from '@mui/material'
import { useAuthStore } from '@/lib/store'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        px: 4,
        py: 3,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'white'
      }}>
        <Typography 
          variant="h6" 
          sx={{ fontWeight: 700, cursor: 'pointer' }}
          onClick={() => router.push('/')}
        >
          TelecomTools
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="text" 
            onClick={() => router.push('/login')}
            sx={{ textTransform: 'none', color: 'text.primary' }}
          >
            Login
          </Button>
          <Button 
            variant="contained" 
            onClick={() => router.push('/register')}
            sx={{ textTransform: 'none' }}
          >
            Cadastro
          </Button>
        </Box>
      </Box>

      {/* Hero */}
      <Box sx={{ 
        flex: 1,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        px: 2,
        py: 12
      }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
              lineHeight: 1.1
            }}
          >
            Entenda a cobertura celular da sua região
          </Typography>
          
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'text.secondary',
              mb: 6,
              fontWeight: 400,
              lineHeight: 1.6
            }}
          >
            Visualize torres, compare operadoras e meça sinal em tempo real com dados reais do Rio Grande do Norte
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => router.push('/register')}
              sx={{ 
                px: 6,
                textTransform: 'none',
                fontSize: '1.1rem'
              }}
            >
              Começar gratuitamente
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => router.push('/login')}
              sx={{ 
                px: 6,
                textTransform: 'none',
                fontSize: '1.1rem'
              }}
            >
              Já tenho conta
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Grid - Clean & Simple */}
      <Box sx={{ 
        bgcolor: '#f8f9fa',
        px: 2,
        py: 12
      }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            sx={{ 
              textAlign: 'center',
              mb: 12,
              fontWeight: 700,
              fontSize: { xs: '1.8rem', md: '2.5rem' }
            }}
          >
            O que você consegue fazer
          </Typography>

          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 6
          }}>
            {/* Feature 1 */}
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 2,
                  fontSize: '1.3rem'
                }}
              >
                📍 Explorar torres próximas
              </Typography>
              <Typography 
                sx={{ 
                  color: 'text.secondary',
                  lineHeight: 1.7
                }}
              >
                Veja todas as 1.929 torres celulares mapeadas no mapa interativo. Descubra qual operadora cobre sua região e a distância de cada torre.
              </Typography>
            </Box>

            {/* Feature 2 */}
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 2,
                  fontSize: '1.3rem'
                }}
              >
                📊 Comparar operadoras
              </Typography>
              <Typography 
                sx={{ 
                  color: 'text.secondary',
                  lineHeight: 1.7
                }}
              >
                Veja lado a lado quantas torres cada operadora (TIM, Vivo, Claro, OI) possui na sua região. Compare qualidade de cobertura em um tabela intuitiva.
              </Typography>
            </Box>

            {/* Feature 3 */}
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 2,
                  fontSize: '1.3rem'
                }}
              >
                📈 Medir força de sinal
              </Typography>
              <Typography 
                sx={{ 
                  color: 'text.secondary',
                  lineHeight: 1.7
                }}
              >
                Use seu navegador para capturar localização e medir a força do sinal 4G/5G em tempo real. Exporte dados e acompanhe a evolução.
              </Typography>
            </Box>

            {/* Feature 4 */}
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 2,
                  fontSize: '1.3rem'
                }}
              >
                 🧮 Cálculos técnicos
              </Typography>
              <Typography 
                sx={{ 
                  color: 'text.secondary',
                  lineHeight: 1.7
                }}
              >
                Acesso a ferramentas avançadas: calculadora de RF, análise de heatmaps, testes de velocidade e relatórios em PDF.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Data Section */}
      <Box sx={{ 
        px: 2,
        py: 12
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
            gap: 4,
            textAlign: 'center'
          }}>
            <Box>
              <Typography 
                sx={{ 
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 1
                }}
              >
                1.929
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Torres Mapeadas
              </Typography>
            </Box>
            <Box>
              <Typography 
                sx={{ 
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 1
                }}
              >
                4
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Operadoras
              </Typography>
            </Box>
            <Box>
              <Typography 
                sx={{ 
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 1
                }}
              >
                4G/5G
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Tecnologias
              </Typography>
            </Box>
            <Box>
              <Typography 
                sx={{ 
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 1
                }}
              >
                RN
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Região coberta
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* CTA Final */}
      <Box sx={{ 
        bgcolor: 'primary.main',
        color: 'white',
        px: 2,
        py: 12,
        textAlign: 'center'
      }}>
        <Container maxWidth="md">
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: '1.8rem', md: '2.2rem' }
            }}
          >
            Pronto para começar?
          </Typography>
          
          <Typography 
            sx={{ 
              mb: 6,
              fontSize: '1.1rem',
              opacity: 0.9
            }}
          >
            Cadastre-se gratuitamente e comece a explorar a cobertura celular da sua região
          </Typography>

          <Button 
            variant="contained" 
            size="large"
            onClick={() => router.push('/register')}
            sx={{ 
              bgcolor: 'white',
              color: 'primary.main',
              textTransform: 'none',
              fontSize: '1.1rem',
              px: 6,
              '&:hover': {
                bgcolor: 'grey.100'
              }
            }}
          >
            Criar conta gratuita
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ 
        bgcolor: '#f8f9fa',
        px: 2,
        py: 6,
        borderTop: '1px solid',
        borderColor: 'divider'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Typography 
              variant="body2"
              sx={{ color: 'text.secondary' }}
            >
              © 2025 TelecomTools. Todos os direitos reservados.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Typography 
                variant="body2"
                sx={{ color: 'text.secondary', cursor: 'pointer', '&:hover': { color: 'text.primary' } }}
              >
                Privacidade
              </Typography>
              <Typography 
                variant="body2"
                sx={{ color: 'text.secondary', cursor: 'pointer', '&:hover': { color: 'text.primary' } }}
              >
                Termos
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

