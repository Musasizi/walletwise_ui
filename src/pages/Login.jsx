/**
 * pages/Login.jsx — WalletWise Login Page
 *
 * Split-screen:
 *   Left  → WalletWise branding (teal gradient, tagline, feature bullets)
 *   Right → Login form (username, password)
 */
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Box, Typography, TextField, Button, Stack, Alert,
  CircularProgress, Paper, Divider,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { login } from '../utils/api';

// ── WalletWise palette ────────────────────────────────────────────────────────
const WW = {
  teal:      '#0D6E6E',
  tealDark:  '#094E4E',
  tealLight: '#E0F2F1',
  accent:    '#F0A500',
  white:     '#FFFFFF',
};

const FEATURES = [
  'Track income from multiple sources',
  'Monitor daily & monthly expenses',
  'Live balance updated in real time',
  'Detailed analytics & reports',
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ username: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await login(form.username, form.password);
      onLogin(res.user ?? res.data?.user, res.token ?? res.data?.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Left branding panel ── */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '42%',
        background: `linear-gradient(160deg, ${WW.teal} 0%, ${WW.tealDark} 100%)`,
        p: 6,
      }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
          <AccountBalanceWalletIcon sx={{ color: WW.accent, fontSize: 52 }} />
          <Typography variant="h3" fontWeight={900} sx={{ color: WW.white, letterSpacing: -1 }}>
            WalletWise
          </Typography>
        </Box>

        <Box sx={{ width: 60, height: 3, bgcolor: WW.accent, borderRadius: 2, mb: 3 }} />

        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', textAlign: 'center', mb: 4, lineHeight: 1.6 }}>
          Your personal finance companion.<br />Smart. Simple. Insightful.
        </Typography>

        <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 300 }}>
          {FEATURES.map((f) => (
            <Stack key={f} direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: WW.accent, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>{f}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* ── Right login form ── */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#F5F7FA',
        p: { xs: 3, sm: 6 },
      }}>
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 420, borderRadius: 3, p: { xs: 3, sm: 4 } }}>

          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 3 }}>
            <AccountBalanceWalletIcon sx={{ color: WW.teal, fontSize: 30 }} />
            <Typography variant="h6" fontWeight={800} color={WW.teal}>WalletWise</Typography>
          </Box>

          {/* Header */}
          <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
            <Box sx={{ p: 1, bgcolor: WW.tealLight, borderRadius: 2 }}>
              <LockIcon sx={{ color: WW.teal, fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} color={WW.teal}>Sign In</Typography>
              <Typography variant="caption" color="text.secondary">Access your finance dashboard</Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                name="username" label="Username" fullWidth size="small"
                value={form.username} onChange={handleChange} required autoFocus
                slotProps={{ input: { startAdornment: <PersonIcon sx={{ mr: 1, color: WW.teal, fontSize: 20 }} /> } }}
                sx={{ '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: WW.teal } }}
              />
              <TextField
                name="password" label="Password" type="password" fullWidth size="small"
                value={form.password} onChange={handleChange} required
                slotProps={{ input: { startAdornment: <LockIcon sx={{ mr: 1, color: WW.teal, fontSize: 20 }} /> } }}
                sx={{ '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: WW.teal } }}
              />
              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
                sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', bgcolor: WW.teal, '&:hover': { bgcolor: WW.tealDark } }}>
                {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Sign In'}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" textAlign="center" mt={3} color="text.secondary">
            No account?{' '}
            <RouterLink to="/register"
              style={{ color: WW.teal, fontWeight: 700, textDecoration: 'none' }}>
              Register here
            </RouterLink>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
Login.propTypes = { onLogin: PropTypes.func.isRequired };
