import { memo, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Spinner } from '../components/ui/spinner';
import { Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.png';
import type { LoginRequest } from '../types/auth.types';

function LoginPageComponent() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState<LoginRequest>({
        username: '',
        password: '',
    });

    const { login, isLoading, loginError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(formData);
            // Redirect to dashboard after successful login
            navigate({ to: '/dashboard' });
        } catch (error) {
            console.error('Error logging in:', error);
            // Error is handled by the hook
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img src={logo} alt="houseXpense" className="w-24 h-24 rounded-full bg-card p-2 border border-border" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        houseXpense
                    </h1>
                    <p className="text-muted-foreground">
                        Gerencie suas finanças de forma inteligente
                    </p>
                </div>

                {/* Login Form */}
                <Card className="w-full">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">Entrar</CardTitle>
                        <CardDescription className="text-center">
                            Digite suas credenciais para acessar sua conta
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-5">
                            {/* Error Alert */}
                            {loginError && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        {loginError.message || 'Erro ao fazer login. Verifique suas credenciais.'}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Username Field */}
                            <div className="space-y-2">
                                <Label htmlFor="username">Nome de usuário</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    placeholder="Digite seu nome de usuário"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isLoading}
                                    className="h-11"
                                    autoComplete="username"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Digite sua senha"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        disabled={isLoading}
                                        className="h-11 pr-10"
                                        autoComplete="current-password"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span className="sr-only">
                                            {showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-6 mt-2">
                            {/* Login Button */}
                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-medium"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner className="mr-2 h-4 w-4" />
                                        Entrando...
                                    </>
                                ) : (
                                    'Entrar'
                                )}
                            </Button>

                            {/* Divider */}
                            <div className="relative w-full">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        ou
                                    </span>
                                </div>
                            </div>

                            {/* Create Account Link */}
                            <div className="text-center text-sm">
                                <span className="text-muted-foreground">
                                    Não tem uma conta?{' '}
                                </span>
                                <Link
                                    to="/register"
                                    className="text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline"
                                >
                                    Criar conta
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>

                {/* Footer */}
                <div className="text-center mt-8 text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} JulidoriDev. Todos os direitos reservados.</p>
                </div>
            </div>
        </div>
    );
}

export default memo(LoginPageComponent);
