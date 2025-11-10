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
import type { RegisterRequest } from '../types/auth.types';

function RegisterPageComponent() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState<RegisterRequest>({
        firstName: '',
        lastName: '',
        password: '',
    });

    const { register, isLoading, registerError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(formData);
            // Redirect to dashboard after successful registration
            navigate({ to: '/dashboard' });
        } catch (error) {
            console.error('Error registering:', error);
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
                        Crie sua conta e comece a gerenciar suas finanças
                    </p>
                </div>

                {/* Register Form */}
                <Card className="w-full">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">Criar Conta</CardTitle>
                        <CardDescription className="text-center">
                            Preencha os dados abaixo para criar sua conta
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {/* Error Alert */}
                            {registerError && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        {registerError.message || 'Erro ao criar conta. Tente novamente.'}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* First Name Field */}
                            <div className="space-y-2">
                                <Label htmlFor="registerFirstName">Nome</Label>
                                <Input
                                    id="registerFirstName"
                                    name="firstName"
                                    type="text"
                                    placeholder="Digite seu nome"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isLoading}
                                    className="h-11"
                                    autoComplete="off"
                                />
                            </div>

                            {/* Last Name Field */}
                            <div className="space-y-2">
                                <Label htmlFor="registerLastName">Sobrenome</Label>
                                <Input
                                    id="registerLastName"
                                    name="lastName"
                                    type="text"
                                    placeholder="Digite seu sobrenome"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isLoading}
                                    className="h-11"
                                    autoComplete="off"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="registerPassword">Senha</Label>
                                <div className="relative">
                                    <Input
                                        id="registerPassword"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Digite sua senha"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        disabled={isLoading}
                                        className="h-11 pr-10"
                                        minLength={6}
                                        autoComplete="new-password"
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
                                <p className="text-xs text-muted-foreground">
                                    A senha deve ter pelo menos 6 caracteres
                                </p>
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-4">
                            {/* Register Button */}
                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-medium"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner className="mr-2 h-4 w-4" />
                                        Criando conta...
                                    </>
                                ) : (
                                    'Criar Conta'
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

                            {/* Login Link */}
                            <div className="text-center text-sm">
                                <span className="text-muted-foreground">
                                    Já tem uma conta?{' '}
                                </span>
                                <Link
                                    to="/login"
                                    className="text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline"
                                >
                                    Fazer login
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

export default memo(RegisterPageComponent);
