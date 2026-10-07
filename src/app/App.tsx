import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';
import { THEME_EVENT, getTheme } from './core/theme';

export default function App() {
  const [theme, setTheme] = useState(getTheme());

  useEffect(() => {
    const onChange = () => setTheme(getTheme());
    window.addEventListener(THEME_EVENT, onChange);
    return () => window.removeEventListener(THEME_EVENT, onChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen bg-background text-foreground`}>
      <RouterProvider router={router} />
      <Toaster theme={theme} position="top-center" richColors closeButton />
    </div>
  );
}
