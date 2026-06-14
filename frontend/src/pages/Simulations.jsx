import { useState } from 'react';
import { simulationAPI } from '../api/client';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Rocket, BarChart3, ShieldAlert, Diamond, Calculator, TrendingUp } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Simulations() {
  const [activeTab, setActiveTab] = useState('compound');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Compound Interest Form
  const [ciForm, setCiForm] = useState({ principal: 1000, annual_rate: 12, months: 60, monthly_contribution: 200 });
  // Budget Form
  const [budgetForm, setBudgetForm] = useState({ income: 5000, expenses: { moradia: 1500, alimentacao: 800, transporte: 300, lazer: 400, outros: 300 } });
  // Emergency Fund Form
  const [efForm, setEfForm] = useState({ monthly_expenses: 3000, months: 6, current_savings: 0, monthly_contribution: 500 });
  // Investment Comparison
  const [invForm, setInvForm] = useState({ principal: 10000, monthly_contribution: 500, months: 60 });

  const handleSimulate = async () => {
    setLoading(true);
    setResult(null);
    try {
      let res;
      if (activeTab === 'compound') res = await simulationAPI.compoundInterest(ciForm);
      else if (activeTab === 'budget') res = await simulationAPI.budget(budgetForm);
      else if (activeTab === 'emergency') res = await simulationAPI.emergencyFund(efForm);
      else if (activeTab === 'investment') res = await simulationAPI.investment(invForm);
      setResult(res.data);
    } catch (err) {
      alert('Erro na simulação: ' + (err.response?.data?.detail || 'Tente novamente'));
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'compound', label: 'Juros Compostos', icon: Rocket },
    { id: 'budget', label: 'Orçamento', icon: BarChart3 },
    { id: 'emergency', label: 'Reserva', icon: ShieldAlert },
    { id: 'investment', label: 'Investimentos', icon: Diamond },
  ];

  const renderInput = (label, value, onChange, type = 'number') => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input type={type} className="form-input" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );

  const formatBRL = (v) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Simulações</h1>
        <p className="page-subtitle">Experimente cenários financeiros reais</p>
      </div>

      <div className="tabs">
        {tabs.map(t => (
          <button key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => { setActiveTab(t.id); setResult(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-2">
        {/* Form */}
        <div className="sim-widget">
          <h3 className="sim-widget-title">
            {tabs.find(t => t.id === activeTab)?.label} — Parâmetros
          </h3>

          {activeTab === 'compound' && (
            <>
              {renderInput('Capital Inicial (R$)', ciForm.principal, v => setCiForm({ ...ciForm, principal: v }))}
              {renderInput('Taxa Anual (%)', ciForm.annual_rate, v => setCiForm({ ...ciForm, annual_rate: v }))}
              {renderInput('Período (meses)', ciForm.months, v => setCiForm({ ...ciForm, months: v }))}
              {renderInput('Aporte Mensal (R$)', ciForm.monthly_contribution, v => setCiForm({ ...ciForm, monthly_contribution: v }))}
            </>
          )}

          {activeTab === 'budget' && (
            <>
              {renderInput('Renda Mensal (R$)', budgetForm.income, v => setBudgetForm({ ...budgetForm, income: v }))}
              <div className="form-label" style={{ marginTop: 'var(--space-4)', fontWeight: 600 }}>Despesas:</div>
              {Object.entries(budgetForm.expenses).map(([key, val]) => (
                <div key={key} className="form-group" style={{ marginBottom: 'var(--space-2)' }}>
                  <label className="form-label" style={{ textTransform: 'capitalize' }}>{key}</label>
                  <input type="number" className="form-input" value={val}
                    onChange={e => setBudgetForm({ ...budgetForm, expenses: { ...budgetForm.expenses, [key]: Number(e.target.value) } })} />
                </div>
              ))}
            </>
          )}

          {activeTab === 'emergency' && (
            <>
              {renderInput('Despesas Mensais (R$)', efForm.monthly_expenses, v => setEfForm({ ...efForm, monthly_expenses: v }))}
              {renderInput('Meses de Cobertura', efForm.months, v => setEfForm({ ...efForm, months: v }))}
              {renderInput('Economia Atual (R$)', efForm.current_savings, v => setEfForm({ ...efForm, current_savings: v }))}
              {renderInput('Aporte Mensal (R$)', efForm.monthly_contribution, v => setEfForm({ ...efForm, monthly_contribution: v }))}
            </>
          )}

          {activeTab === 'investment' && (
            <>
              {renderInput('Capital Inicial (R$)', invForm.principal, v => setInvForm({ ...invForm, principal: v }))}
              {renderInput('Aporte Mensal (R$)', invForm.monthly_contribution, v => setInvForm({ ...invForm, monthly_contribution: v }))}
              {renderInput('Período (meses)', invForm.months, v => setInvForm({ ...invForm, months: v }))}
            </>
          )}

          <button className="btn btn-primary btn-full btn-lg" onClick={handleSimulate} disabled={loading} style={{ marginTop: 'var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {loading ? 'Calculando...' : <><Calculator size={20} /> Simular</>}
          </button>
        </div>

        {/* Results */}
        <div className="sim-widget">
          <h3 className="sim-widget-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} className="text-accent" /> Resultado
          </h3>

          {!result && (
            <div className="empty-state">
              <div style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}><Calculator size={48} /></div>
              <h3>Configure e clique em Simular</h3>
            </div>
          )}

          {result && activeTab === 'compound' && (
            <>
              <div className="sim-result">
                <div className="sim-result-label">Montante Final</div>
                <div className="sim-result-value">{formatBRL(result.final_amount)}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                <div className="sim-result" style={{ padding: 'var(--space-3)' }}>
                  <div className="sim-result-label">Total Investido</div>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>{formatBRL(result.total_invested)}</div>
                </div>
                <div className="sim-result" style={{ padding: 'var(--space-3)' }}>
                  <div className="sim-result-label">Juros Ganhos</div>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--accent-400)' }}>{formatBRL(result.total_interest)}</div>
                </div>
              </div>
              {result.projection?.length > 0 && (
                <div style={{ height: '250px', marginTop: 'var(--space-6)' }}>
                  <Line
                    data={{
                      labels: result.projection.map(p => `${p.month}m`),
                      datasets: [
                        { label: 'Montante', data: result.projection.map(p => p.total), borderColor: '#3a81f3', backgroundColor: 'rgba(58, 129, 243, 0.1)', fill: true, tension: 0.3 },
                        { label: 'Investido', data: result.projection.map(p => p.invested), borderColor: '#64748b', borderDash: [5, 5], tension: 0.3 },
                      ],
                    }}
                    options={{
                      responsive: true, maintainAspectRatio: false,
                      plugins: { legend: { labels: { color: '#94a3b8' } } },
                      scales: { y: { grid: { color: 'rgba(148,163,184,0.08)' }, ticks: { color: '#64748b' } }, x: { grid: { display: false }, ticks: { color: '#64748b' } } },
                    }}
                  />
                </div>
              )}
            </>
          )}

          {result && activeTab === 'budget' && (
            <>
              <div className="sim-result" style={{ borderColor: result.status === 'positivo' ? 'var(--accent-500)' : 'var(--danger-500)' }}>
                <div className="sim-result-label">Saldo Mensal</div>
                <div className="sim-result-value" style={{ color: result.balance >= 0 ? 'var(--accent-400)' : 'var(--danger-400)' }}>
                  {formatBRL(result.balance)}
                </div>
              </div>
              <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.message}</p>
              </div>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
                  Taxa de economia: <strong style={{ color: 'var(--text-primary)' }}>{result.savings_rate}%</strong>
                </div>
              </div>
            </>
          )}

          {result && activeTab === 'emergency' && (
            <>
              <div className="sim-result">
                <div className="sim-result-label">Meta da Reserva</div>
                <div className="sim-result-value">{formatBRL(result.target)}</div>
              </div>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  {result.months_to_goal ? `Tempo estimado: ${Math.ceil(result.months_to_goal)} meses` : 'Defina um aporte mensal'}
                </div>
              </div>
            </>
          )}

          {result && activeTab === 'investment' && (
            <>
              <h4 style={{ marginBottom: 'var(--space-4)', color: 'var(--text-secondary)' }}>Comparação de Investimentos</h4>
              {result.comparisons?.map((comp, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-2)',
                  background: 'var(--bg-input)', borderRadius: 'var(--radius-md)'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{comp.name}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      {comp.annual_rate}% a.a. • Risco: {comp.risk}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--accent-400)' }}>{formatBRL(comp.final_amount)}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      +{formatBRL(comp.total_interest)}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
