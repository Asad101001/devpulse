import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Zap } from 'lucide-react';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      console.log('[Auth] Token detected. Initiating SESSION_ESTABLISHMENT.');
      login(token);
      navigate('/dashboard', { replace: true });
    } else {
      console.warn('[Auth] No token found. Redirecting to ROOT_OS.');
      navigate('/', { replace: true });
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen bg-[#FFD600] flex flex-col items-center justify-center p-10 text-center">
      <div className="bg-black p-12 border-[10px] border-black shadow-[20px_20px_0px_#FF6B00] animate-pulse">
        <Zap className="text-[#FFD600] w-32 h-32 animate-spin duration-[2s]" strokeWidth={4} />
      </div>
      <h2 className="mt-12 text-5xl font-[1000] uppercase italic tracking-tighter">
        SESSION_ESTABLISHMENT...
      </h2>
      <p className="mt-4 font-black uppercase text-xl opacity-60">Synchronizing Authorization Matrix</p>
    </div>
  );
};

export default AuthCallback;
