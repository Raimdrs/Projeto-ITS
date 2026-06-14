import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Wallet } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', password_confirm: '',
    first_name: '', last_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password_confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const messages = Object.values(data).flat().join(' ');
        setError(messages || 'Erro ao cadastrar. Tente novamente.');
      } else {
        setError('Erro ao cadastrar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-fade-in">
        <div className="auth-card">
          <div className="auth-logo">
            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center', color: 'var(--accent-400)' }}><Wallet size={48} /></div>
            <h1>FinTutor</h1>
            <p>Crie sua conta e comece a aprender</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-firstname">Nome</label>
                <input id="reg-firstname" type="text" name="first_name" className="form-input"
                  placeholder="Seu nome" value={form.first_name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-lastname">Sobrenome</label>
                <input id="reg-lastname" type="text" name="last_name" className="form-input"
                  placeholder="Seu sobrenome" value={form.last_name} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-username">Usuário</label>
              <input id="reg-username" type="text" name="username" className="form-input"
                placeholder="Escolha um nome de usuário" value={form.username} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">E-mail</label>
              <input id="reg-email" type="email" name="email" className="form-input"
                placeholder="seu@email.com" value={form.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Senha</label>
              <input id="reg-password" type="password" name="password" className="form-input"
                placeholder="Mínimo 6 caracteres" value={form.password} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirmar Senha</label>
              <input id="reg-confirm" type="password" name="password_confirm" className="form-input"
                placeholder="Repita a senha" value={form.password_confirm} onChange={handleChange} required />
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Criar Conta'}
            </button>
          </form>

          <div className="auth-footer">
            Já tem conta? <Link to="/login">Entrar</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
