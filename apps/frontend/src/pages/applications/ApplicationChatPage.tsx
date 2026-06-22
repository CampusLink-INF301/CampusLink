import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { messagesApi } from '../../api/messages';
import { applicationsApi } from '../../api/applications';
import type { Message } from '../../api/messages';
import axios from 'axios';

const ROLE_LABELS: Record<string, string> = {
  estudiante: 'Estudiante',
  docente: 'Docente',
  institucion: 'Institución',
  admin: 'Administrador',
};

interface ChatPartner {
  name: string;
  role: string;
  opportunityTitle: string;
}

export function ApplicationChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [partner, setPartner] = useState<ChatPartner | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const storedUser = localStorage.getItem('user');
  const currentUser: { id: string; name: string } | null = storedUser
    ? JSON.parse(storedUser)
    : null;

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    if (!id) return;

    applicationsApi.getOne(id).then((app) => {
      const isApplicant = app.user?.id === currentUser?.id;
      const pub = app.opportunity?.publisher;
      if (isApplicant && pub) {
        setPartner({ name: pub.name, role: pub.role, opportunityTitle: app.opportunity.title });
      } else if (app.user) {
        setPartner({ name: app.user.name, role: 'estudiante', opportunityTitle: app.opportunity.title });
      }
    }).catch(() => {});

    messagesApi
      .getMessages(id)
      .then((msgs) => { setMessages(msgs); setLoading(false); })
      .catch((err: unknown) => {
        if (axios.isAxiosError(err) && err.response?.status === 400) {
          setError('El chat solo está disponible para postulaciones aceptadas.');
        } else if (axios.isAxiosError(err) && err.response?.status === 403) {
          setError('No tienes permiso para ver este chat.');
        } else {
          setError('No se pudo cargar el chat.');
        }
        setLoading(false);
      });
  }, [id, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || !id) return;
    setSending(true);
    try {
      const msg = await messagesApi.sendMessage(id, content);
      setMessages((prev) => [...prev, msg]);
      setText('');
    } catch {
      // keep text so user can retry
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p className="loading-text">Cargando chat…</p>;

  return (
    <main className="page">
      <div className="page-header">
        <Link to="/profile" className="btn btn-secondary btn-sm">
          ← Volver
        </Link>
        {partner && (
          <div className="chat-partner-header">
            <div className="chat-partner-avatar">
              {partner.name.charAt(0).toUpperCase()}
            </div>
            <div className="chat-partner-info">
              <strong className="chat-partner-name">{partner.name}</strong>
              <span className="chat-partner-meta">
                {ROLE_LABELS[partner.role] ?? partner.role} &middot; {partner.opportunityTitle}
              </span>
            </div>
          </div>
        )}
        {!partner && <h1>Chat de postulación</h1>}
      </div>

      {error ? (
        <p className="form-error" role="alert">{error}</p>
      ) : (
        <div className="chat-container">
          <div className="chat-messages" data-testid="chat-messages">
            {messages.length === 0 && (
              <p className="chat-empty">Aún no hay mensajes. ¡Sé el primero en escribir!</p>
            )}
            {messages.map((msg) => {
              const isMe = msg.sender.id === currentUser?.id;
              return (
                <div
                  key={msg.id}
                  className={`chat-bubble${isMe ? ' chat-bubble--me' : ' chat-bubble--them'}`}
                  data-testid="chat-bubble"
                >
                  {!isMe && (
                    <span className="chat-sender">{msg.sender.name}</span>
                  )}
                  <p className="chat-text">{msg.content}</p>
                  <span className="chat-time">
                    {new Date(msg.createdAt).toLocaleTimeString('es-CL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {' '}
                    {new Date(msg.createdAt).toLocaleDateString('es-CL')}
                  </span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <form className="chat-input-row" onSubmit={handleSend}>
            <input
              className="chat-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe un mensaje…"
              maxLength={1000}
              data-testid="chat-input"
              autoFocus
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={sending || !text.trim()}
              data-testid="btn-send"
            >
              {sending ? '…' : (
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                </svg>
              )}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
