import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setStatus('invalid'); return; }
    setTimeout(() => navigate('/login'), 2000);
    setStatus('success');
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-4">
        {status === 'loading' && <p className="text-muted-foreground">Verificando...</p>}
        {status === 'success' && (
          <>
            <div className="text-5xl">✅</div>
            <h1 className="text-2xl font-bold">Email verificado!</h1>
            <p className="text-muted-foreground">Redirecionando para o login...</p>
          </>
        )}
        {status === 'invalid' && (
          <>
            <div className="text-5xl">❌</div>
            <h1 className="text-2xl font-bold">Link inválido</h1>
            <p className="text-muted-foreground">Este link de verificação não é válido ou já expirou.</p>
          </>
        )}
      </div>
    </div>
  );
}
