import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { conceptsAPI } from '../api/client';
import AITutorChat from '../components/AITutorChat';
import * as LucideIcons from 'lucide-react';
import { BookOpen, Lightbulb, Key, FileEdit, Dumbbell } from 'lucide-react';

export default function Lesson() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [concept, setConcept] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeTab, setActiveTab] = useState('theory');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      conceptsAPI.detail(slug),
      conceptsAPI.lessons(slug),
    ]).then(([conceptRes, lessonsRes]) => {
      setConcept(conceptRes.data);
      setLessons(lessonsRes.data?.results || lessonsRes.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!concept) return <div className="empty-state"><h3>Conceito não encontrado</h3></div>;

  const lesson = lessons[0] || {};

  // Simple markdown renderer (handles ##, **, >, -, tables)
  const renderContent = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements = [];
    let inTable = false;
    let tableRows = [];

    const processLine = (line, idx) => {
      // Headers
      if (line.startsWith('### ')) return <h3 key={idx}>{line.slice(4)}</h3>;
      if (line.startsWith('## ')) return <h2 key={idx}>{line.slice(3)}</h2>;
      if (line.startsWith('# ')) return <h1 key={idx}>{line.slice(2)}</h1>;
      // Blockquote
      if (line.startsWith('> ')) return <blockquote key={idx}>{processBold(line.slice(2))}</blockquote>;
      // List item
      if (line.startsWith('- ') || line.startsWith('* ')) return <li key={idx}>{processBold(line.slice(2))}</li>;
      if (/^\d+\.\s/.test(line)) return <li key={idx}>{processBold(line.replace(/^\d+\.\s/, ''))}</li>;
      // Empty line
      if (line.trim() === '') return <br key={idx} />;
      // Regular paragraph
      return <p key={idx}>{processBold(line)}</p>;
    };

    const processBold = (text) => {
      const parts = text.split(/\*\*(.*?)\*\*/g);
      return parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part);
    };

    // Handle table detection
    lines.forEach((line, idx) => {
      if (line.includes('|') && line.trim().startsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        if (!line.match(/^[\s|:-]+$/)) { // Skip separator rows
          const cells = line.split('|').filter(c => c.trim());
          tableRows.push(cells.map(c => c.trim()));
        }
      } else {
        if (inTable) {
          elements.push(
            <table key={`table-${idx}`}>
              <thead><tr>{tableRows[0]?.map((c, i) => <th key={i}>{c}</th>)}</tr></thead>
              <tbody>{tableRows.slice(1).map((row, ri) => (
                <tr key={ri}>{row.map((c, ci) => <td key={ci}>{c}</td>)}</tr>
              ))}</tbody>
            </table>
          );
          inTable = false;
          tableRows = [];
        }
        elements.push(processLine(line, idx));
      }
    });

    // Flush remaining table
    if (inTable && tableRows.length > 0) {
      elements.push(
        <table key="table-final">
          <thead><tr>{tableRows[0]?.map((c, i) => <th key={i}>{c}</th>)}</tr></thead>
          <tbody>{tableRows.slice(1).map((row, ri) => (
            <tr key={ri}>{row.map((c, ci) => <td key={ci}>{c}</td>)}</tr>
          ))}</tbody>
        </table>
      );
    }

    return elements;
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/concepts')}>
          ← Voltar aos Conceitos
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <span style={{ display: 'flex', alignItems: 'center', color: 'var(--accent-500)' }}>
          {(() => {
            const Icon = LucideIcons[concept.icon] || LucideIcons.BookOpen;
            return <Icon size={40} />;
          })()}
        </span>
        <div>
          <h1 className="page-title">{concept.name}</h1>
          <p className="page-subtitle">{concept.description}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'theory' ? 'active' : ''}`} onClick={() => setActiveTab('theory')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={18} /> Aula Teórica
        </button>
        <button className={`tab ${activeTab === 'examples' ? 'active' : ''}`} onClick={() => setActiveTab('examples')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lightbulb size={18} /> Exemplos Práticos
        </button>
        <button className={`tab ${activeTab === 'keypoints' ? 'active' : ''}`} onClick={() => setActiveTab('keypoints')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Key size={18} /> Pontos-Chave
        </button>
      </div>

      {/* Content */}
      <div className="lesson-content card" style={{ padding: 'var(--space-8)' }}>
        {activeTab === 'theory' && renderContent(lesson.content)}
        {activeTab === 'examples' && renderContent(lesson.practical_examples)}
        {activeTab === 'keypoints' && (
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Key size={24} className="text-accent" /> Pontos-Chave</h2>
            <ul>
              {lesson.key_points?.split(';').map((point, i) => (
                <li key={i} style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--font-size-lg)' }}>
                  {point.trim()}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-6)', justifyContent: 'center' }}>
        <button className="btn btn-primary btn-lg" onClick={() => navigate(`/quiz/${slug}`)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileEdit size={20} /> Fazer Quiz
        </button>
        <button className="btn btn-outline btn-lg" onClick={() => navigate(`/exercises/${slug}`)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Dumbbell size={20} /> Exercícios
        </button>
      </div>

      <AITutorChat conceptSlug={slug} />
    </div>
  );
}
