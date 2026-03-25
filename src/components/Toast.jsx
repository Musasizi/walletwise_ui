/**
 * components/Toast.jsx — WalletWise Toast Notification
 *
 * Props:
 *   toast   – { open, message, severity, title? } — from useToast()
 *   onClose – () => void — pass hideToast from useToast()
 */
import PropTypes from 'prop-types';
import { Snackbar, Alert, AlertTitle, Slide, Typography } from '@mui/material';

function SlideUp(props) {
  return <Slide {...props} direction="up" />;
}

export default function Toast({ toast, onClose }) {
  const { open, message, severity = 'info', title } = toast;

  return (
    <Snackbar
      open={open}
      autoHideDuration={3500}
      onClose={(_, reason) => { if (reason !== 'clickaway') onClose(); }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      slots={{ transition: SlideUp }}
      sx={{ mb: 2, mr: 1 }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{
          minWidth: 300,
          maxWidth: 420,
          borderRadius: 2.5,
          boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
          '& .MuiAlert-message': { width: '100%' },
        }}
      >
        {title && (
          <AlertTitle sx={{ fontWeight: 800, fontSize: 14, mb: 0.25 }}>{title}</AlertTitle>
        )}
        <Typography variant="body2" sx={{ fontSize: 13, lineHeight: 1.5 }}>{message}</Typography>
      </Alert>
    </Snackbar>
  );
}

Toast.propTypes = {
  toast: PropTypes.shape({
    open:     PropTypes.bool,
    message:  PropTypes.string,
    severity: PropTypes.string,
    title:    PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
