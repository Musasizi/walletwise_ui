/**
 * pages/Expense.jsx — Expense Management
 *
 * Features:
 *  • List expense records (filterable by type + date range)
 *  • Add / Edit / Delete expense entries
 *  • Dialog form with expense-type dropdown
 */
import { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    Box, Typography, Stack, Button, Card, CardContent,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Select, MenuItem, FormControl, InputLabel, CircularProgress,
    Chip, Tooltip, Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import {
    getExpenses, createExpense, updateExpense, deleteExpense, getExpenseTypes,
} from '../utils/api';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

// ── Palette ───────────────────────────────────────────────────────────────────
const WW = { teal: '#0D6E6E', red: '#C62828', amber: '#F0A500' };

const fmt = (n) =>
    Number(n ?? 0).toLocaleString('en-UG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const today = () => new Date().toISOString().slice(0, 10);
const getBtnLabel = (editId) => (editId ? 'Update' : 'Save');

// ── Empty form ────────────────────────────────────────────────────────────────
const EMPTY = {
    name_expense: '',
    amount: '',
    amount_expenditure: '',
    id_expense: '',
    date_created: today(),
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function Expense({ token }) {
    const { toast, showToast, hideToast } = useToast();

    const [rows, setRows] = useState([]);
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [delId, setDelId] = useState(null);

    // Filters
    const [filterType, setFilterType] = useState('');
    const [filterFrom, setFilterFrom] = useState('');
    const [filterTo, setFilterTo] = useState('');

    // ── Load ────────────────────────────────────────────────────────────────────
    const load = useCallback(() => {
        setLoading(true);
        const filters = {};
        if (filterType) filters.type_id = filterType;
        if (filterFrom) filters.from = filterFrom;
        if (filterTo) filters.to = filterTo;
        Promise.all([getExpenses(token, filters), getExpenseTypes()])
            .then(([exp, t]) => {
                setRows(exp.data ?? exp);
                setTypes(t.data ?? t);
            })
            .catch(() => showToast('Failed to load expense data', 'error'))
            .finally(() => setLoading(false));
    }, [token, filterType, filterFrom, filterTo, showToast]);

    useEffect(() => { load(); }, [load]);

    // ── Handlers ────────────────────────────────────────────────────────────────
    const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
    const openEdit = (row) => {
        setEditing(row.id);
        setForm({
            name_expense: row.name_expense,
            amount: row.amount,
            amount_expenditure: row.amount_expenditure,
            id_expense: row.id_expense,
            date_created: row.date_created?.slice(0, 10) ?? today(),
        });
        setOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const body = {
                name_expense: form.name_expense,
                amount: Number(form.amount),
                amount_expenditure: Number(form.amount_expenditure),
                id_expense: Number(form.id_expense),
                date_created: form.date_created,
            };
            if (editing) {
                await updateExpense(editing, body, token);
                showToast('Expense updated', 'success');
            } else {
                await createExpense(body, token);
                showToast('Expense added', 'success');
            }
            setOpen(false);
            load();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteExpense(id, token);
            showToast('Expense deleted', 'success');
            load();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setDelId(null);
        }
    };

    const typeName = (id) => types.find((t) => t.id_expense === id)?.name ?? '—';

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <Box>
            <Toast toast={toast} onClose={hideToast} />

            {/* Header */}
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={3} spacing={2}>
                <Box>
                    <Typography variant="h5" fontWeight={800} color={WW.teal}>Expenses</Typography>
                    <Typography variant="body2" color="text.secondary">Track all expenditures</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}
                    sx={{ bgcolor: WW.red, '&:hover': { bgcolor: '#962020' }, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
                    Add Expense
                </Button>
            </Stack>

            {/* Filters */}
            <Card elevation={1} sx={{ mb: 3, borderRadius: 3 }}>
                <CardContent>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                            <InputLabel>Type</InputLabel>
                            <Select value={filterType} label="Type" onChange={(e) => setFilterType(e.target.value)}>
                                <MenuItem value="">All</MenuItem>
                                {types.map((t) => <MenuItem key={t.id_expense} value={t.id_expense}>{t.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <TextField size="small" type="date" label="From" value={filterFrom}
                            onChange={(e) => setFilterFrom(e.target.value)}
                            slotProps={{ inputLabel: { shrink: true } }} />
                        <TextField size="small" type="date" label="To" value={filterTo}
                            onChange={(e) => setFilterTo(e.target.value)}
                            slotProps={{ inputLabel: { shrink: true } }} />
                        <Button variant="outlined" size="small" onClick={load}
                            sx={{ borderColor: WW.teal, color: WW.teal, textTransform: 'none' }}>
                            Apply
                        </Button>
                        <Button size="small" onClick={() => { setFilterType(''); setFilterFrom(''); setFilterTo(''); }}
                            sx={{ color: 'text.secondary', textTransform: 'none' }}>
                            Clear
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            {/* Table */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress sx={{ color: WW.teal }} /></Box>
            ) : (
                <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 3 }}>
                    <Table size="small">
                        <TableHead sx={{ bgcolor: WW.red }}>
                            <TableRow>
                                {['#', 'Date', 'Description', 'Type', 'Budgeted', 'Spent', 'Actions'].map((h) => (
                                    <TableCell key={h} sx={{ color: '#fff', fontWeight: 700, py: 1.5 }}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>No expense records found</TableCell>
                                </TableRow>
                            ) : rows.map((row, i) => (
                                <TableRow key={row.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                    <TableCell>{i + 1}</TableCell>
                                    <TableCell>{row.date_created?.slice(0, 10)}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{row.name_expense}</TableCell>
                                    <TableCell>
                                        <Chip label={typeName(row.id_expense)} size="small"
                                            icon={<ArrowDownwardIcon sx={{ fontSize: 12 }} />}
                                            sx={{ bgcolor: '#FFEBEE', color: WW.red, fontWeight: 700, fontSize: 11 }} />
                                    </TableCell>
                                    <TableCell>UGX {fmt(row.amount)}</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: WW.red }}>UGX {fmt(row.amount_expenditure)}</TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(row)}><EditIcon fontSize="small" sx={{ color: WW.teal }} /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" onClick={() => setDelId(row.id)}><DeleteIcon fontSize="small" sx={{ color: WW.red }} /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Add / Edit dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 800, color: WW.teal }}>
                    {editing ? 'Edit Expense' : 'Add Expense'}
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ pt: 2 }}>
                    <Stack spacing={2.5} mt={0.5}>
                        <TextField label="Description" size="small" fullWidth
                            value={form.name_expense}
                            onChange={(e) => setForm((f) => ({ ...f, name_expense: e.target.value }))}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                        <TextField label="Budgeted Amount (UGX)" type="number" size="small" fullWidth
                            value={form.amount}
                            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                        <TextField label="Actual Expenditure (UGX)" type="number" size="small" fullWidth
                            value={form.amount_expenditure}
                            onChange={(e) => setForm((f) => ({ ...f, amount_expenditure: e.target.value }))}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                        <FormControl size="small" fullWidth>
                            <InputLabel>Expense Type</InputLabel>
                            <Select value={form.id_expense} label="Expense Type"
                                onChange={(e) => setForm((f) => ({ ...f, id_expense: e.target.value }))}>
                                {types.map((t) => <MenuItem key={t.id_expense} value={t.id_expense}>{t.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <TextField label="Date" type="date" size="small" fullWidth
                            value={form.date_created}
                            onChange={(e) => setForm((f) => ({ ...f, date_created: e.target.value }))}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}
                        sx={{ bgcolor: WW.red, '&:hover': { bgcolor: '#962020' }, textTransform: 'none', fontWeight: 700 }}>
                        {saving ? <CircularProgress size={18} color="inherit" /> : getBtnLabel(editing)}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete confirm */}
            <Dialog open={!!delId} onClose={() => setDelId(null)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 800 }}>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography variant="body2">Are you sure you want to delete this expense entry?</Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDelId(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={() => handleDelete(delId)}
                        sx={{ textTransform: 'none', fontWeight: 700 }}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
Expense.propTypes = { token: PropTypes.string.isRequired };
