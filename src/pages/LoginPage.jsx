// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Lock } from 'lucide-react'; // Ícone do Lucide

// Nossos componentes customizados
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Label } from '../components/common/Label';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Falha no login. Verifique seu e-mail e senha.');
            console.error(err);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-100">
            <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-md">
                {/* Cabeçalho do Formulário */}
                <div className="flex flex-col items-center">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                        <Lock className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold">
                        Entrar
                    </h1>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-center text-sm text-red-700">
                            {error}
                        </div>
                    )}
                    <div className="space-y-1">
                        <Label htmlFor="email">Endereço de E-mail</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        Entrar
                    </Button>
                </form>

                {/* Links Inferiores */}
                <div className="flex items-center justify-between text-sm">
                    <RouterLink to="#" className="font-medium text-primary hover:underline">
                        Esqueci minha senha
                    </RouterLink>
                    <RouterLink to="/cadastro" className="font-medium text-primary hover:underline">
                        Não tem uma conta? Cadastre-se
                    </RouterLink>
                </div>
            </div>
        </div>
    );
}