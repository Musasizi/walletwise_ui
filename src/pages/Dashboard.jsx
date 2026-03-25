/**
 * pages/Dashboard.jsx — WalletWise Finance Dashboard
 *
 * Shows:
 *  • Live balance KPI card
 *  • Total income / total expense KPI cards
 *  • Income by type – donut chart
 *  • Expense by type – donut chart
 *  • Balance trend – area chart
 *  • Date-range filter (This Week / This Month / Custom)
 */
import { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Card, CardContent, CardHeader, CircularProgress,
  Grid, Stack, Typography, ToggleButton, ToggleButtonGroup,
  TextField, Divider,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReactApexChart from 'react-apexcharts';
import { getDashboard, getBalanceTrend } from '../utils/api';

// ── Theme palette ─────────────────────────────────────────────────────────────
const WW = {
  teal: '#0D6E6E',
  green: '#2E7D32',
  red: '#C62828',
  accent: '#F0A500',
  offWhite: '#F4F6F8',
  card: '#FFFFFF',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
  Number(n ?? 0).toLocaleString('en-UG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const isoToday = () => new Date().toISOString().slice(0, 10);

const isoWeekStart = () => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
};

const isoMonthStart = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
};

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, color, subtitle }) {
  return (
    <Card elevation={2} sx={{ borderRadius: 3, borderLeft: `5px solid ${color}` }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.8}>
              {label}
            </Typography>
            <Typography variant="h5" fontWeight={800} color={color}>
              UGX {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
KpiCard.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
};
KpiCard.defaultProps = { subtitle: '' };

// ── Donut chart ───────────────────────────────────────────────────────────────
function DonutChart({ title, series, labels, colors }) {
  const options = {
    chart: { type: 'donut', toolbar: { show: false } },
    labels,
    colors,
    legend: { position: 'bottom', fontSize: '12px' },
    dataLabels: { enabled: true, formatter: (v) => `${v.toFixed(1)}%` },
    plotOptions: { pie: { donut: { size: '62%' } } },
    tooltip: { y: { formatter: (v) => `UGX ${fmt(v)}` } },
  };
  return (
    <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
      <CardHeader title={<Typography variant="subtitle1" fontWeight={700}>{title}</Typography>} />
      <Divider />
      <CardContent>
        {series.length > 0 ? (
          <ReactApexChart type="donut" series={series} options={options} height={260} />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
            <Typography color="text.secondary" variant="body2">No data</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
DonutChart.propTypes = {
  title: PropTypes.string.isRequired,
  series: PropTypes.arrayOf(PropTypes.number).isRequired,
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

// ── Trend chart ───────────────────────────────────────────────────────────────
function TrendChart({ trend }) {
  const dates = trend.map((r) => r.date_created?.slice(0, 10) ?? '');
  const values = trend.map((r) => Number(r.amount_balance));

  const options = {
    chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 } },
    xaxis: { categories: dates, labels: { rotate: -30, style: { fontSize: '11px' } } },
    yaxis: { labels: { formatter: (v) => `${(v / 1000).toFixed(0)}K` } },
    colors: [WW.teal],
    tooltip: { y: { formatter: (v) => `UGX ${fmt(v)}` } },
    dataLabels: { enabled: false },
  };

  return (
    <Card elevation={2} sx={{ borderRadius: 3 }}>
      <CardHeader
        title={<Typography variant="subtitle1" fontWeight={700}>Balance Trend</Typography>}
        avatar={<TrendingUpIcon sx={{ color: WW.teal }} />}
      />
      <Divider />
      <CardContent>
        {values.length > 0 ? (
          <ReactApexChart
            type="area"
            series={[{ name: 'Balance', data: values }]}
            options={options}
            height={240}
          />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
            <Typography color="text.secondary" variant="body2">No trend data yet</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
TrendChart.propTypes = {
  trend: PropTypes.arrayOf(PropTypes.shape({
    date_created: PropTypes.string,
    amount_balance: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  })).isRequired,
};

// ── Dashboard ──────────────────────────────────────────────────────────────────
export default function Dashboard({ token }) {
  const [data, setData] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [from, setFrom] = useState(isoMonthStart());
  const [to, setTo] = useState(isoToday());

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      getDashboard(token, { from, to }),
      getBalanceTrend(token, 30),
    ])
      .then(([dash, trendRes]) => {
        setData(dash.data ?? dash);
        setTrend(trendRes.data ?? trendRes ?? []);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [token, from, to]);

  useEffect(() => { load(); }, [load]);

  const handlePeriod = (_, val) => {
    if (!val) return;
    setPeriod(val);
    if (val === 'week') { setFrom(isoWeekStart()); setTo(isoToday()); }
    if (val === 'month') { setFrom(isoMonthStart()); setTo(isoToday()); }
  };

  // ── Derived data ────────────────────────────────────────────────────────────
  const balance = data?.balance ?? {};
  const incomeSeries = (data?.incomeBreakdown ?? []).map((r) => Number(r.total));
  const incomeLabels = (data?.incomeBreakdown ?? []).map((r) => r.name ?? r.type_name ?? '?');
  const expSeries = (data?.expenseBreakdown ?? []).map((r) => Number(r.total));
  const expLabels = (data?.expenseBreakdown ?? []).map((r) => r.name ?? r.type_name ?? '?');

  const INCOME_COLORS = ['#0D6E6E', '#2E7D32', '#1A4A7B', '#6A1B9A', '#E65100'];
  const EXPENSE_COLORS = ['#C62828', '#F0A500', '#4A148C', '#880E4F', '#BF360C'];

  return (
    <Box>
      {/* Page header + filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" mb={3} spacing={2}>
        <Box>
          <Typography variant="h5" fontWeight={800} color={WW.teal}>Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">Your financial overview</Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <ToggleButtonGroup value={period} exclusive onChange={handlePeriod} size="small">
            <ToggleButton value="week" sx={{ textTransform: 'none', fontSize: 12 }}>This Week</ToggleButton>
            <ToggleButton value="month" sx={{ textTransform: 'none', fontSize: 12 }}>This Month</ToggleButton>
            <ToggleButton value="custom" sx={{ textTransform: 'none', fontSize: 12 }}>Custom</ToggleButton>
          </ToggleButtonGroup>
          {period === 'custom' && (
            <>
              <TextField type="date" size="small" label="From" value={from} onChange={(e) => setFrom(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 150 }} />
              <TextField type="date" size="small" label="To" value={to} onChange={(e) => setTo(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 150 }} />
            </>
          )}
        </Stack>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress sx={{ color: WW.teal }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* KPI cards */}
          <Grid item xs={12} sm={4}>
            <KpiCard
              icon={<AccountBalanceWalletIcon sx={{ color: WW.teal }} />}
              label="Live Balance"
              value={fmt(balance.amount_balance)}
              color={WW.teal}
              subtitle="income − expenditure"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <KpiCard
              icon={<ArrowUpwardIcon sx={{ color: WW.green }} />}
              label="Total Income"
              value={fmt(data?.totalIncome ?? balance.total_income)}
              color={WW.green}
              subtitle={`${from} → ${to}`}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <KpiCard
              icon={<ArrowDownwardIcon sx={{ color: WW.red }} />}
              label="Total Expenditure"
              value={fmt(data?.totalExpense ?? balance.total_expense)}
              color={WW.red}
              subtitle={`${from} → ${to}`}
            />
          </Grid>

          {/* Donut charts */}
          <Grid item xs={12} md={6}>
            <DonutChart
              title="Income by Type"
              series={incomeSeries}
              labels={incomeLabels}
              colors={INCOME_COLORS}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <DonutChart
              title="Expense by Type"
              series={expSeries}
              labels={expLabels}
              colors={EXPENSE_COLORS}
            />
          </Grid>

          {/* Trend */}
          <Grid item xs={12}>
            <TrendChart trend={trend} />
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
Dashboard.propTypes = {
  token: PropTypes.string.isRequired,
};

