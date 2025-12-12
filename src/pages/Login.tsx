import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AutContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Wrench, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@oficina.com');
  const [password, setPassword] = useState('password'); // Mock password
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email);
      navigate('/');
    } catch (err) {
      setError('Credenciais inválidas. Tente admin@oficina.com');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-orange-600 p-8 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <Wrench className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-white">Oficina Digital</h1>
          <p className="text-orange-100 mt-2">Sistema de Gestão Automotiva</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />

            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Entrar
            </Button>

            <div className="text-center text-sm text-gray-500">
              <p>Credenciais de teste:</p>
              <p>admin@oficina.com / qualquer senha</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
