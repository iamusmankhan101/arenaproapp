import { createTheme } from '@mui/material/styles';

// Brand colors
const brandColors = {
  primary: '#004d43',
  secondary: '#cdec6a',
  primaryLight: '#e8f5f3',
  secondaryLight: '#f7fce8',
  primaryDark: '#003832',
  secondaryDark: '#a8c555',
};

export const adminTheme = createTheme({
  palette: {
    primary: {
      main: brandColors.primary,
      light: brandColors.primaryLight,
      dark: brandColors.primaryDark,
      contrastText: '#ffffff',
    },
    secondary: {
      main: brandColors.secondary,
      light: brandColors.secondaryLight,
      dark: brandColors.secondaryDark,
      contrastText: '#000000',
    },
    success: {
      main: brandColors.primary,
      light: brandColors.primaryLight,
      dark: brandColors.primaryDark,
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#212529',
      secondary: '#6c757d',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      color: brandColors.primary,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      color: brandColors.primary,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      color: brandColors.primary,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: brandColors.primary,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      color: brandColors.primary,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      color: brandColors.primary,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0, 77, 67, 0.2)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 77, 67, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
        colorPrimary: {
          backgroundColor: brandColors.primaryLight,
          color: brandColors.primary,
        },
        colorSecondary: {
          backgroundColor: brandColors.secondaryLight,
          color: brandColors.primaryDark,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: brandColors.primary,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: brandColors.primary,
            },
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${brandColors.primaryLight}`,
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: brandColors.primaryLight,
            color: brandColors.primary,
            fontWeight: 600,
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: brandColors.primaryLight,
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: brandColors.primaryLight,
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
  },
});

export default adminTheme;