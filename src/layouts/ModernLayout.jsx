/**
 * layouts/ModernLayout.jsx — WalletWise App Shell
 *
 * STRUCTURE:
 *   ┌──────────────────────────────────────────────┐
 *   │  Sidebar (permanent, 240 px, deep teal)      │
 *   │    WalletWise brand                          │
 *   │    Navigation: Dashboard · Income · Expense  │
 *   │                Balance · Reports · Users     │
 *   │    User avatar + logout at bottom            │
 *   ├──────────────────────────────────────────────┤
 *   │  AppBar – breadcrumb + user chip             │
 *   ├──────────────────────────────────────────────┤
 *   │  Page content – {children}                   │
 *   └──────────────────────────────────────────────┘
 */

import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, List, ListItemButton, ListItemIcon,
  ListItemText, Typography, Avatar, Divider, Stack, Tooltip,
  IconButton, Breadcrumbs, Link, Chip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// ── Constants ─────────────────────────────────────────────────────────────────
const DRAWER_WIDTH = 240;

const WW = {
  teal: '#0D6E6E',
  tealDark: '#094F4F',
  accent: '#F0A500',
  accentLight: '#FFF3CD',
  white: '#FFFFFF',
  offWhite: '#F4F6F8',
};

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/income', label: 'Income', icon: <ArrowUpwardIcon /> },
  { path: '/expense', label: 'Expense', icon: <ArrowDownwardIcon /> },
  { path: '/balance', label: 'Balance', icon: <AccountBalanceWalletIcon /> },
  { path: '/reports', label: 'Reports', icon: <BarChartIcon /> },
  { path: '/users', label: 'Users', icon: <PeopleIcon /> },
];

const PAGE_LABELS = {
  '/dashboard': 'Dashboard',
  '/income': 'Income',
  '/expense': 'Expense',
  '/balance': 'Balance',
  '/reports': 'Reports',
  '/users': 'Users',
};

const AVATAR_COLORS = [WW.teal, '#7B3F00', '#1A4A7B', '#1A5C2E', '#4A1A7B'];
const avatarBg = (name = '') =>
  AVATAR_COLORS[(name.codePointAt(0) ?? 0) % AVATAR_COLORS.length];

// ── Component ─────────────────────────────────────────────────────────────────
export default function ModernLayout({ children, user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const username = user?.username ?? 'User';
  const pageLabel = PAGE_LABELS[location.pathname] ?? 'Page';

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onLogout) onLogout();
    navigate('/login');
  };

  // ── Sidebar contents ────────────────────────────────────────────────────────
  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: WW.teal, color: WW.white }}>

      {/* Brand header */}
      <Box sx={{ px: 2.5, pt: 3, pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
          <AccountBalanceWalletIcon sx={{ fontSize: 32, color: WW.accent }} />
          <Box>
            <Typography variant="subtitle1" sx={{ color: WW.white, fontWeight: 800, lineHeight: 1.1, letterSpacing: 0.5 }}>
              WalletWise
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, letterSpacing: 0.6, lineHeight: 1, display: 'block' }}>
              PERSONAL FINANCE TRACKER
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />

      {/* Navigation list */}
      <List sx={{ px: 1.5, pt: 1.5, flexGrow: 1 }}>
        {NAV_ITEMS.map(({ path, label, icon }) => {
          const active = location.pathname === path;
          return (
            <ListItemButton
              key={path}
              onClick={() => navigate(path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                px: 1.5,
                py: 1,
                color: active ? WW.accent : 'rgba(255,255,255,0.75)',
                bgcolor: active ? 'rgba(240,165,0,0.15)' : 'transparent',
                borderLeft: active ? `3px solid ${WW.accent}` : '3px solid transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: WW.white },
                transition: 'all 0.18s ease',
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>{icon}</ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: active ? 700 : 500, fontSize: 14, color: 'inherit' }}>
                    {label}
                  </Typography>
                }
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />

      {/* User info + logout */}
      <Box sx={{ px: 2, py: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: avatarBg(username), border: `2px solid ${WW.accent}`, fontWeight: 700, fontSize: 15 }}>
            {username[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Typography variant="body2" sx={{ color: WW.white, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {username}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: 10 }}>
              Account Holder
            </Typography>
          </Box>
          <Tooltip title="Logout">
            <IconButton size="small" onClick={handleLogout} sx={{ color: 'rgba(255,255,255,0.55)', '&:hover': { color: WW.accent } }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );

  // ── Full layout shell ───────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: WW.offWhite }}>

      {/* Permanent sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none', boxShadow: '4px 0 20px rgba(0,0,0,0.12)' },
        }}
      >
        {drawer}
      </Drawer>

      {/* Right side: AppBar + content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top AppBar */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: WW.white, borderBottom: `3px solid ${WW.teal}`, color: 'text.primary' }}>
          <Toolbar sx={{ minHeight: 56 }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color: WW.teal }} />} sx={{ flexGrow: 1 }}>
              <Link underline="hover" onClick={() => navigate('/dashboard')} sx={{ cursor: 'pointer', fontSize: 13, color: WW.teal, fontWeight: 600 }}>
                Home
              </Link>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: WW.teal }}>
                {pageLabel}
              </Typography>
            </Breadcrumbs>

            <Chip
              avatar={<Avatar sx={{ bgcolor: `${avatarBg(username)} !important`, fontSize: 12 }}>{username[0]?.toUpperCase()}</Avatar>}
              label={username}
              size="small"
              variant="outlined"
              sx={{ borderColor: WW.teal, color: WW.teal, fontWeight: 600, fontSize: 12 }}
            />
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
          {children}
        </Box>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', py: 1.5, borderTop: '1px solid rgba(13,110,110,0.12)', color: WW.teal, fontSize: 11, fontWeight: 500, opacity: 0.7 }}>
          © {new Date().getFullYear()} WalletWise — Personal Finance Tracker
        </Box>
      </Box>
    </Box>
  );
}

import PropTypes from 'prop-types';
ModernLayout.propTypes = {
  children: PropTypes.node.isRequired,
  user: PropTypes.shape({ username: PropTypes.string }),
  onLogout: PropTypes.func,
};
ModernLayout.defaultProps = { user: null, onLogout: null };
