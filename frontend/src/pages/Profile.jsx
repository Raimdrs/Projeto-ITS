import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api/client';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', bio: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    }).catch(() => {});
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

  return (
    <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Perfil</h1>
        <p className="page-subtitle">Gerencie suas informações pessoais</p>
      </div>

      {message && (
        <div style={{ background: 'rgba(0,209,119,0.1)', border: '1px solid rgba(0,209,119,0.3)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-5)', color: 'var(--accent-400)', fontSize: 'var(--font-size-sm)' }}>
          ✅ {message}
        </div>
      )}
      {error && <div className="auth-error">{error}</div>}

      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-5)', fontWeight: 700 }}>👤 Dados Pessoais</h3>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Nome</label>
              <input type="text" className="form-input" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Sobrenome</label>
              <input type="text" className="form-input" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea className="form-input" rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Telefone</label>
            <input type="text" className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-5)', fontWeight: 700 }}>🔒 Alterar Senha</h3>
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label">Senha Atual</label>
            <input type="password" className="form-input" value={passwordForm.old_password} onChange={e => setPasswordForm({ ...passwordForm, old_password: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Nova Senha</label>
            <input type="password" className="form-input" value={passwordForm.new_password} onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-outline">Alterar Senha</button>
        </form>
      </div>
    </div>
  );
}
