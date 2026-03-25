/**
 * pages/Reports.jsx — WalletWise Finance Analytics
 *
 * Shows:
 *  • Income vs Expense grouped bar chart (monthly)
 *  • Income breakdown by type (donut)
 *  • Expense breakdown by type (donut)
 *  • Summary stats table
 */
import { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Typography, Stack, Card, CardContent, CardHeader,
  Grid, CircularProgress, Divider, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { getDashboard } from '../utils/api';

// ── Palette ───────────────────────────────────────────────────────────────────
const WW = { teal: '#0D6E6E', green: '#2E7D32', red: '#C62828' };

const fmt = (n) =>
  Number(n ?? 0).toLocaleString('en-UG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const isoMonthStart = () => {
  const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10);
};
const isoToday = () => new Date().toISOString().slice(0, 10);

// ── Component ─────────────────────────────────────────────────────────────────
export default function Reports({ token }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [from,    setFrom]    = useState(isoMonthStart());
  const [to,      setTo]      = useState(isoToday());

  const load = useCallback(() => {
    setLoading(true);
    getDashboard(token, { from, to })
      .then((res) => setData(res.data ?? res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, from, to]);

  useEffect(() => { load(); }, [load]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const incomeBreakdown  = data?.incomeBreakdown  ?? [];
  const expenseBreakdown = data?.expenseBreakdown ?? [];
  const balance          = data?.balance          ?? {};

  const totalIncome  = incomeBreakdown.reduce((s, r)  => s + Number(r.total), 0);
  const totalExpense = expenseBreakdown.reduce((s, r) => s + Number(r.total), 0);
  const netBalance   = totalIncome - totalExpense;

  // Bar chart: income vs expense per type side-by-side
  const barCategories = [
    ...new Set([
      ...incomeBreakdown.map((r)  => r.name ?? r.type_name ?? '?'),
      ...expenseBreakdown.map((r) => r.name ?? r.type_name ?? '?'),
    ]),
  ];
  const incomeBar  = barCategories.map((cat) => {
    const row = incomeBreakdown.find((r) => (r.name ?? r.type_name) === cat);
    return row ? Number(row.total) : 0;
  });
  const expenseBar = barCategories.map((cat) => {
    const row = expenseBreakdown.find((r) => (r.name ?? r.type_name) === cat);
    return row ? Number(row.total) : 0;
  });

  const barOptions = {
    chart:   { type: 'bar', toolbar: { show: false } },
    colors:  [WW.green, WW.red],
    xaxis:   { categories: barCategories },
    yaxis:   { labels: { formatter: (v) => `${(v / 1000).toFixed(0)}K` } },
    tooltip: { y: { formatter: (v) => `UGX ${fmt(v)}` } },
    dataLabels: { enabled: false },
    legend:  { position: 'top' },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
  };

  // Income donut
  const iSeries = incomeBreakdown.map((r)  => Number(r.total));
  const iLabels = incomeBreakdown.map((r)  => r.name ?? r.type_name ?? '?');
  const eSeries = expenseBreakdown.map((r) => Number(r.total));
  const eLabels = expenseBreakdown.map((r) => r.name ?? r.type_name ?? '?');

  const donutOpts = (labels, colors) => ({
    chart:      { type: 'donut', toolbar: { show: false } },
    labels,
    colors,
    legend:     { position: 'bottom', fontSize: '12px' },
    dataLabels: { enabled: true, formatter: (v) => `${v.toFixed(1)}%` },
    plotOptions: { pie: { donut: { size: '62%' } } },
    tooltip:    { y: { formatter: (v) => `UGX ${fmt(v)}` } },
  });

  return (
    <Box>
      {/* Header + Date Filter */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={3} spacing={2}>
        <Box>
          <Typography variant="h5" fontWeight={800} color={WW.teal}>Reports</Typography>
          <Typography variant="body2" color="text.secondary">Finance analytics overview</Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField type="date" size="small" label="From" value={from}
            onChange={(e) => setFrom(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 150 }} />
          <TextField type="date" size="small" label="To" value={to}
            onChange={(e) => setTo(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 150 }} />
          <Button variant="outlined" size="small" onClick={load}
            sx={{ borderColor: WW.teal, color: WW.teal, textTransform: 'none' }}>Apply</Button>
        </Stack>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress sx={{ color: WW.teal }} /></Box>
      ) : (
        <Grid container spacing={3}>

          {/* Summary stats */}
          <Grid item xs={12}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardHeader title={<Typography variant="subtitle1" fontWeight={700}>Summary</Typography>} />
              <Divider />
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: WW.teal }}>
                    <TableRow>
                      {['Metric', 'Value'].map((h) => (
                        <TableCell key={h} sx={{ color: '#fff', fontWeight: 700 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      ['Total Income',   fmt(totalIncome),  WW.green],
                      ['Total Expense',  fmt(totalExpense), WW.red],
                      ['Net Balance',    fmt(netBalance),   netBalance >= 0 ? WW.green : WW.red],
                      ['Live Balance',   fmt(balance.amount_balance), WW.teal],
                    ].map(([label, value, color]) => (
                      <TableRow key={label} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{label}</TableCell>
                        <TableCell sx={{ fontWeight: 800, color }}>UGX {value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>

          {/* Bar chart */}
          <Grid item xs={12}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardHeader title={<Typography variant="subtitle1" fontWeight={700}>Income vs Expense by Type</Typography>} />
              <Divider />
              <CardContent>
                {barCategories.length > 0 ? (
                  <ReactApexChart
                    type="bar"
                    series={[{ name: 'Income', data: incomeBar }, { name: 'Expense', data: expenseBar }]}
                    options={barOptions}
                    height={300}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={5}>No data for selected period</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Donut charts */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardHeader title={<Typography variant="subtitle1" fontWeight={700}>Income Breakdown</Typography>} />
              <Divider />
              <CardContent>
                {iSeries.length > 0 ? (
                  <ReactApexChart type="donut" series={iSeries}
                    options={donutOpts(iLabels, ['#0D6E6E', '#2E7D32', '#1A4A7B', '#6A1B9A', '#E65100'])}
                    height={260} />
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={5}>No data</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardHeader title={<Typography variant="subtitle1" fontWeight={700}>Expense Breakdown</Typography>} />
              <Divider />
              <CardContent>
                {eSeries.length > 0 ? (
                  <ReactApexChart type="donut" series={eSeries}
                    options={donutOpts(eLabels, ['#C62828', '#F0A500', '#4A148C', '#880E4F', '#BF360C'])}
                    height={260} />
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={5}>No data</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      )}
    </Box>
  );
}
Reports.propTypes = { token: PropTypes.string.isRequired };
