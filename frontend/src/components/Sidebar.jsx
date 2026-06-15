import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, BookOpen, Calculator, BarChart3, User, LogOut, Wallet } from 'lucide-react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Typography, Avatar, Divider, useTheme, useMediaQuery } from '@mui/material';

export default function Sidebar({ mobileOpen, handleDrawerToggle, drawerWidth }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/concepts', icon: BookOpen, label: 'Conceitos' },
    { to: '/simulations', icon: Calculator, label: 'Simulações' },
    { to: '/reports', icon: BarChart3, label: 'Relatórios' },
    { to: '/profile', icon: User, label: 'Perfil' },
  ];

  const initial = user?.first_name?.[0] || user?.username?.[0] || '?';

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ 
          bgcolor: 'primary.main', color: 'primary.contrastText', 
          p: 1, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
          <Wallet size={24} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
          FinTutor
        </Typography>
      </Box>

      <Typography variant="overline" sx={{ px: 3, pb: 1, color: 'text.secondary', fontWeight: 600 }}>
        Menu Principal
      </Typography>

      <List sx={{ px: 2, flex: 1 }}>
        {links.map((link) => (
          <ListItem key={link.to} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={NavLink}
              to={link.to}
              onClick={isMobile ? handleDrawerToggle : undefined}
              sx={{
                borderRadius: 2,
                color: 'text.secondary',
                '&.active': {
                  bgcolor: 'rgba(58, 129, 243, 0.1)',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  }
                },
                '&:hover': {
                  bgcolor: 'rgba(148, 163, 184, 0.1)',
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                <link.icon size={20} />
              </ListItemIcon>
              <ListItemText primary={link.label} slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.1)' }} />

      <List sx={{ px: 2, py: 2 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: 'error.main' }}>
            <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
              <LogOut size={20} />
            </ListItemIcon>
            <ListItemText primary="Sair" slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
          </ListItemButton>
        </ListItem>
      </List>

      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, borderTop: 1, borderColor: 'rgba(148, 163, 184, 0.1)' }}>
        <Avatar sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', fontWeight: 700 }}>
          {initial.toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {user?.first_name || user?.username}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
            Estudante
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid rgba(148, 163, 184, 0.1)' },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}
