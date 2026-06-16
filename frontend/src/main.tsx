import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import splashImg from './assets/splash.png';

function Splash({ onFinish }: { onFinish: () => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setExiting(true), 2000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!exiting) return;
    const t = window.setTimeout(onFinish, 400);
    return () => window.clearTimeout(t);
  }, [exiting, onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black splash-root">
      <img src={splashImg} alt="splash" className={`splash-img ${exiting ? 'splash-exit' : ''}`} />
    </div>
  );
}

function Root() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <React.StrictMode>
      {showSplash ? <Splash onFinish={() => setShowSplash(false)} /> : <App />}
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<Root />);
