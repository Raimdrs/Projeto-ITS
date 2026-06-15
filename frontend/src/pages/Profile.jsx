import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api/client';
import { Box, Typography, Grid, Card, CardContent, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { User, Lock } from 'lucide-react';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', bio: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    authAPI.getProfile().then(res => {
      const data = res.data;
      setForm({
        first_name: data.user?.first_name || '',
        last_name: data.user?.last_name || '',
        email: data.user?.email || '',
        bio: data.bio || '',
        phone: data.phone || '',
      });
      setFetching(false);
    }).catch(() => setFetching(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await authAPI.updateProfile(form);
      setMessage('Perfil atualizado com sucesso!');
      const updated = { ...user, first_name: form.first_name, last_name: form.last_name, email: form.email };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    } catch (err) {
      setError('Erro ao salvar. Tente novamente.');
    }
    setLoading(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await authAPI.changePassword(passwordForm);
      setMessage('Senha alterada com sucesso!');
      setPasswordForm({ old_password: '', new_password: '' });
    } catch (err) {
      setError(err.response?.data?.old_password?.[0] || 'Erro ao alterar senha.');
    }
  };

  if (fetching) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out', maxWidth: 800, mx: 'auto', pb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" gutterBottom sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
          Perfil
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Gerencie suas informações pessoais
        </Typography>
      </Box>

      {message && <Alert severity="success" sx={{ mb: 4 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      <Card sx={{ mb: 6 }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <User size={20} color="#3a81f3" /> Dados Pessoais
          </Typography>
          
          <Box component="form" onSubmit={handleSave}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  fullWidth label="Nome" variant="outlined" 
                  value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} 
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  fullWidth label="Sobrenome" variant="outlined" 
                  value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} 
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField 
                  fullWidth label="E-mail" type="email" variant="outlined" 
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} 
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField 
                  fullWidth label="Bio" multiline rows={3} variant="outlined" 
                  value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} 
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField 
                  fullWidth label="Telefone" variant="outlined" 
                  value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} 
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  size="large" 
                  disabled={loading}
                  sx={{ py: 1.5, px: 4 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Salvar Alterações'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Lock size={20} color="#3a81f3" /> Alterar Senha
          </Typography>
          
          <Box component="form" onSubmit={handleChangePassword}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField 
                  fullWidth label="Senha Atual" type="password" variant="outlined" required
                  value={passwordForm.old_password} onChange={e => setPasswordForm({ ...passwordForm, old_password: e.target.value })} 
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField 
                  fullWidth label="Nova Senha" type="password" variant="outlined" required
                  value={passwordForm.new_password} onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })} 
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button 
                  type="submit" 
                  variant="outlined" 
                  color="primary" 
                  size="large" 
                  sx={{ py: 1.5, px: 4 }}
                >
                  Alterar Senha
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
