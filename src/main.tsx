import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import App from './App';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';

// In dev, a service worker can interfere with HMR by caching old assets.
// Only register SW in production; proactively unregister any existing SW in dev.
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW register failed', err);
      });
    });
  } else {
    // Dev: ensure no stale SW controls the page
    navigator.serviceWorker.getRegistrations?.().then((regs) => {
      regs.forEach((r) => r.unregister().catch(() => {}));
    });
  }
}

// Dense-soft theme: IBM Plex Sans, micro-radius corners, Apple-level refinement
const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 3,
  fontFamily:
    '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Arial, sans-serif',
  fontFamilyMonospace:
    '"IBM Plex Mono", "SF Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace',
  colors: {
    brand: [
      '#EAF2FF',
      '#C7D7FE',
      '#A3C0FF',
      '#7FAAFF',
      '#5B94FF',
      '#0A84FF',
      '#0066CC',
      '#004999',
      '#003366',
      '#001A33',
    ],
  },
  spacing: {
    xs: '6px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px'
  },
  components: {
    Container: {
      defaultProps: {
        style: {
          fontFamily:
            '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Arial, sans-serif',
        },
      },
    },
    Text: {
      defaultProps: {
        style: {
          fontFamily:
            '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Arial, sans-serif',
        },
      },
    },
    Title: {
      defaultProps: {
        style: {
          fontFamily:
            '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Arial, sans-serif',
        },
      },
    },
    Button: {
      defaultProps: { 
        radius: 3,
        size: 'sm'
      },
    },
    Paper: {
      defaultProps: { 
        radius: 3,
        shadow: 'xs'
      },
    },
    SegmentedControl: {
      defaultProps: { 
        radius: 'xl',
        size: 'sm'
      },
    },
    ActionIcon: {
      defaultProps: { 
        radius: 3,
        variant: 'subtle',
        size: 'sm'
      },
    },
    TextInput: {
      defaultProps: { 
        radius: 3,
        size: 'sm'
      },
    },
    Textarea: {
      defaultProps: { 
        radius: 3,
        size: 'sm'
      },
    },
  },
});

const container = document.getElementById('root')!;
createRoot(container).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

function Root() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(() => {
    const saved = (typeof localStorage !== 'undefined' && localStorage.getItem('rt_theme')) as
      | 'light'
      | 'dark'
      | null;
    return saved ?? 'light';
  });

  const toggleTheme = useMemo(
    () =>
      () => {
        setColorScheme((prev) => {
          const next = prev === 'dark' ? 'light' : 'dark';
          try {
            localStorage.setItem('rt_theme', next);
          } catch {}
          return next;
        });
      },
    []
  );

  return (
    <MantineProvider defaultColorScheme={colorScheme} forceColorScheme={colorScheme} theme={theme}>
      <Notifications position="top-right" />
      <App colorScheme={colorScheme} onToggleColorScheme={toggleTheme} />
    </MantineProvider>
  );
}
