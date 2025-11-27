'use client'

import { useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Collapse,
  ListSubheader,
  Chip,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  SignalCellularAlt,
  CellTower,
  Calculate,
  Assessment,
  Speed,
  AccountCircle,
  Logout,
  Map as MapIcon,
  ExpandLess,
  ExpandMore,
  CompareArrows,
  MoreHoriz,
} from '@mui/icons-material'
import { useAuthStore } from '@/lib/store'

const drawerWidth = 260

interface DashboardLayoutProps {
  children: ReactNode
}

interface MenuItem {
  text: string
  icon: React.ReactNode
  path: string
  section?: 'core' | 'advanced'
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const coreMenuItems: MenuItem[] = [
    { text: 'Overview', icon: <DashboardIcon />, path: '/dashboard', section: 'core' },
    { text: 'Mapa', icon: <MapIcon />, path: '/dashboard/map', section: 'core' },
    { text: 'Comparação', icon: <CompareArrows />, path: '/dashboard/compare', section: 'core' },
    { text: 'Medições', icon: <SignalCellularAlt />, path: '/dashboard/signals', section: 'core' },
  ]

  const advancedMenuItems: MenuItem[] = [
    { text: 'Torres', icon: <CellTower />, path: '/dashboard/towers', section: 'advanced' },
    { text: 'Calculadora RF', icon: <Calculate />, path: '/dashboard/calculator', section: 'advanced' },
    { text: 'Testes de Velocidade', icon: <Speed />, path: '/dashboard/speed-tests', section: 'advanced' },
    { text: 'Relatórios', icon: <Assessment />, path: '/dashboard/reports', section: 'advanced' },
  ]

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ px: 3, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            fontSize: '1.1rem',
            color: 'primary.main'
          }}
        >
          TelecomTools
        </Typography>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 2 }}>
        {/* Core Features Section */}
        <Box>
          <Typography
            variant="overline"
            sx={{
              px: 3,
              py: 1.5,
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'text.secondary',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Navegação
          </Typography>
          <List sx={{ py: 0 }}>
            {coreMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton 
                  onClick={() => router.push(item.path)}
                  sx={{
                    px: 3,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: 500
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Advanced Features Section */}
        <Box>
          <Typography
            variant="overline"
            sx={{
              px: 3,
              py: 1.5,
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'text.secondary',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Ferramentas
          </Typography>
          <List sx={{ py: 0 }}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => setAdvancedOpen(!advancedOpen)}
                sx={{
                  px: 3,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                  <MoreHoriz />
                </ListItemIcon>
                <ListItemText 
                  primary="Avançadas"
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: 500
                  }}
                />
                {advancedOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={advancedOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {advancedMenuItems.map((item) => (
                  <ListItem key={item.text} disablePadding>
                    <ListItemButton
                      onClick={() => router.push(item.path)}
                      sx={{ 
                        pl: 7,
                        '&:hover': {
                          bgcolor: 'action.hover',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: 400
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </List>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Análise de Cobertura Celular
          </Typography>
          <IconButton onClick={handleMenuOpen} size="small" sx={{ ml: 2 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem disabled>
              <AccountCircle sx={{ mr: 1 }} />
              {user?.username}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Sair
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}

