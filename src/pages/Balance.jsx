/**
 * pages/Balance.jsx — Balance Overview
 *
 * Shows:
 *  • Live balance KPI
 *  • Balance trend (30 days) area chart
 *  • Snapshot history table
 */
import { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    Box, Typography, Stack, Card, CardContent, CardHeader,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, Divider, Chip,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ReactApexChart from 'react-apexcharts';
import { getLiveBalance, getBalanceTrend } from '../utils/api';

// ── Palette ───────────────────────────────────────────────────────────────────
const WW = { teal: '#0D6E6E', green: '#2E7D32', red: '#C62828' };

const fmt = (n) =>
    Number(n ?? 0).toLocaleString('en-UG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// ── KPI card ──────────────────────────────────────────────────────────────────
function Kpi({ icon, label, value, color }) {
    return (
        <Card elevation={2} sx={{ borderRadius: 3, borderLeft: `5px solid ${color}`, flex: 1 }}>
            <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {icon}
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.8}>{label}</Typography>
                        <Typography variant="h5" fontWeight={800} color={color}>UGX {value}</Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}
Kpi.propTypes = {
    icon: PropTypes.node.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function Balance({ token }) {
    const [live, setLive] = useState(null);
    const [trend, setTrend] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(() => {
        setLoading(true);
        Promise.all([getLiveBalance(token), getBalanceTrend(token, 30)])
            .then(([lb, tr]) => {
                setLive(lb.data ?? lb);
                setTrend(tr.data ?? tr ?? []);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [token]);

    useEffect(() => { load(); }, [load]);

    // ── Chart ──────────────────────────────────────────────────────────────────
    const dates = trend.map((r) => r.date_created?.slice(0, 10) ?? '');
    const values = trend.map((r) => Number(r.amount_balance));

    const chartOptions = {
        chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false } },
        stroke: { curve: 'smooth', width: 2 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 } },
        xaxis: { categories: dates, labels: { rotate: -30, style: { fontSize: '11px' } } },
        yaxis: { labels: { formatter: (v) => `${(v / 1000).toFixed(0)}K` } },
        colors: [WW.teal],
        tooltip: { y: { formatter: (v) => `UGX ${fmt(v)}` } },
        dataLabels: { enabled: false },
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress sx={{ color: WW.teal }} />
            </Box>
        );
    }

    const bal = live ?? {};

    return (
        <Box>
            <Typography variant="h5" fontWeight={800} color={WW.teal} mb={0.5}>Balance</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>Live and historical balance overview</Typography>

            {/* KPI row */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={4}>
                <Kpi icon={<AccountBalanceWalletIcon sx={{ color: WW.teal }} />} label="Live Balance" value={fmt(bal.amount_balance)} color={WW.teal} />
                <Kpi icon={<ArrowUpwardIcon sx={{ color: WW.green }} />} label="Total Income" value={fmt(bal.total_income)} color={WW.green} />
                <Kpi icon={<ArrowDownwardIcon sx={{ color: WW.red }} />} label="Total Expense" value={fmt(bal.total_expense)} color={WW.red} />
            </Stack>

            {/* Trend chart */}
            <Card elevation={2} sx={{ borderRadius: 3, mb: 4 }}>
                <CardHeader title={<Typography variant="subtitle1" fontWeight={700}>Balance Trend (Last 30 Snapshots)</Typography>} />
                <Divider />
                <CardContent>
                    {values.length > 0 ? (
                        <ReactApexChart type="area" series={[{ name: 'Balance', data: values }]} options={chartOptions} height={260} />
                    ) : (
                        <Typography variant="body2" color="text.secondary" textAlign="center" py={6}>
                            No snapshot data yet. Snapshots are recorded daily at midnight.
                        </Typography>
                    )}
                </CardContent>
            </Card>

            {/* Snapshot table */}
            <Card elevation={2} sx={{ borderRadius: 3 }}>
                <CardHeader title={<Typography variant="subtitle1" fontWeight={700}>Snapshot History</Typography>} />
                <Divider />
                <TableContainer>
                    <Table size="small">
                        <TableHead sx={{ bgcolor: WW.teal }}>
                            <TableRow>
                                {['Date', 'Type', 'Balance (UGX)', 'Income (UGX)', 'Expense (UGX)'].map((h) => (
                                    <TableCell key={h} sx={{ color: '#fff', fontWeight: 700 }}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {trend.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 5, color: 'text.secondary' }}>No snapshots yet</TableCell>
                                </TableRow>
                            ) : trend.map((r) => (
                                <TableRow key={r.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                    <TableCell>{r.date_created?.slice(0, 10)}</TableCell>
                                    <TableCell>
                                        <Chip label={r.snapshot_type} size="small"
                                            sx={{ bgcolor: r.snapshot_type === 'live' ? '#E0F2F1' : '#E8EAF6', color: r.snapshot_type === 'live' ? WW.teal : '#3949AB', fontWeight: 700, fontSize: 11 }} />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>UGX {fmt(r.amount_balance)}</TableCell>
                                    <TableCell sx={{ color: WW.green }}>UGX {fmt(r.total_income)}</TableCell>
                                    <TableCell sx={{ color: WW.red }}>UGX {fmt(r.total_expense)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    );
}
Balance.propTypes = { token: PropTypes.string.isRequired };
