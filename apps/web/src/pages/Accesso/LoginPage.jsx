import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { LogIn, Loader2, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ''
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Ruoli disponibili in fase pre-backend.
  // "Cliente" verrà aggiunto quando avremo la mini-dashboard di tracking richiesta.
  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'admin_visione', label: 'Admin solo visione' },
    { value: 'manager', label: 'Manager' },
    { value: 'avvocato', label: 'Avvocato' },
    { value: 'locatore', label: 'locatore' },
    { value: 'inquilino', label: 'Inquilino' },
    { value: 'commerciale', label: 'Commerciale' },
  ];

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = 'L\'email è obbligatoria';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Inserisci un indirizzo email valido';
    }

    if (!formData.password) {
      newErrors.password = 'La password è obbligatoria';
    }

    if (!formData.role) {
      newErrors.role = 'Seleziona un ruolo per accedere';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    setGeneralError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      try {
        if (formData.email === 'error@cria.it') {
          throw new Error('Email o password non corretti');
        }

        login(formData.email, formData.password, formData.role);
        toast.success('Accesso effettuato con successo');

        // Redirect basato su ruolo — path allineati alle route in App.jsx
        // NOTE: Manager non ha ancora una dashboard dedicata, va su admin (con permessi limitati)
        const redirectMap = {
          admin: '/dashboard/admin',
          admin_visione: '/dashboard/admin',
          manager: '/dashboard/admin',
          avvocato: '/dashboard/avvocato',
          locatore: '/dashboard/locatore',
          inquilino: '/dashboard/inquilino',
          commerciale: '/dashboard/commerciale',
        };

        const destination = redirectMap[formData.role] || '/';
        navigate(destination);
      } catch (err) {
        setGeneralError(err.message || 'Si è verificato un errore durante l\'accesso');
        toast.error('Errore di autenticazione');
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <>
      <Helmet>
        <title>CRIA - Accedi</title>
        <meta name="description" content="Accedi alla piattaforma CRIA per gestire i tuoi contratti di locazione" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <header className="bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-end h-16">
              <Link to="/">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Torna alla home
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <Card className="w-full max-w-md shadow-xl border-border/50">
            <CardHeader className="text-center space-y-2 pb-8">
              <div className="flex justify-center mb-2">
                <img src="/logo.png" alt="CRIA" className="h-20 w-auto" />
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight">Bentornato</CardTitle>
              <CardDescription className="text-base">
                Inserisci le tue credenziali per accedere
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generalError && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3 text-destructive">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{generalError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nome@esempio.it"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`text-foreground bg-background ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive font-medium mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className={errors.password ? "text-destructive" : ""}>
                      Password
                    </Label>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
                    >
                      Password dimenticata?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`text-foreground bg-background ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive font-medium mt-1">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className={errors.role ? "text-destructive" : ""}>
                    Tipo di account
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleChange('role', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger
                      id="role"
                      className={`bg-background ${errors.role ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    >
                      <SelectValue placeholder="Seleziona il tuo ruolo" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-destructive font-medium mt-1">{errors.role}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Accesso in corso...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Accedi
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>
                  Non hai un account?{' '}
                  <Link to="/signup" className="font-semibold text-primary hover:text-primary/80 hover:underline transition-colors">
                    Registrati
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default LoginPage;