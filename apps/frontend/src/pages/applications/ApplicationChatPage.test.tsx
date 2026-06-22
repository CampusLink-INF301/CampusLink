import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ApplicationChatPage } from './ApplicationChatPage';
import { messagesApi } from '../../api/messages';
import { applicationsApi } from '../../api/applications';
import type { Message } from '../../api/messages';
import axios from 'axios';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'app-123' }),
  };
});

jest.mock('../../api/client');
jest.mock('../../api/messages');
jest.mock('../../api/applications');
jest.mock('axios');

const mockedMessagesApi = messagesApi as jest.Mocked<typeof messagesApi>;
const mockedAppsApi = applicationsApi as jest.Mocked<typeof applicationsApi>;
const mockedAxios = axios as jest.Mocked<typeof axios>;

const myMessage: Message = {
  id: 'm1',
  content: 'Hola',
  createdAt: '2024-01-01T10:00:00Z',
  sender: { id: 'u1', name: 'Yo', role: 'estudiante' },
};

const theirMessage: Message = {
  id: 'm2',
  content: 'Bienvenido',
  createdAt: '2024-01-01T10:01:00Z',
  sender: { id: 'u2', name: 'Docente', role: 'docente' },
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  localStorage.setItem('user', JSON.stringify({ id: 'u1', name: 'Yo' }));
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  mockedAppsApi.getOne.mockResolvedValue({
    id: 'app-123',
    status: 'aceptado',
    user: { id: 'u1', name: 'Yo', email: 'yo@test.cl' },
    opportunity: { id: 'opp-1', title: 'Tutoria Python', publisher: { id: 'u2', name: 'Docente', role: 'docente' } },
    createdAt: '2024-01-01T00:00:00Z',
  } as never);
});

function renderPage() {
  return render(
    <MemoryRouter>
      <ApplicationChatPage />
    </MemoryRouter>,
  );
}

describe('ApplicationChatPage', () => {
  it('redirects to /login when no token', () => {
    mockedMessagesApi.getMessages.mockResolvedValue([] as never);

    renderPage();

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('shows loading state while fetching', () => {
    localStorage.setItem('token', 'fake-token');
    mockedMessagesApi.getMessages.mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByText('Cargando chat…')).toBeInTheDocument();
  });

  it('shows error when status is not ACEPTADO (400 error)', async () => {
    localStorage.setItem('token', 'fake-token');
    const axiosError = { isAxiosError: true, response: { status: 400 } };
    mockedAxios.isAxiosError.mockReturnValue(true);
    mockedMessagesApi.getMessages.mockRejectedValue(axiosError as never);

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText('El chat solo está disponible para postulaciones aceptadas.'),
      ).toBeInTheDocument();
    });
  });

  it('shows empty chat state when no messages', async () => {
    localStorage.setItem('token', 'fake-token');
    mockedAxios.isAxiosError.mockReturnValue(false);
    mockedMessagesApi.getMessages.mockResolvedValue([] as never);

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText('Aún no hay mensajes. ¡Sé el primero en escribir!'),
      ).toBeInTheDocument();
    });
  });

  it('renders messages with correct alignment for mine vs theirs', async () => {
    localStorage.setItem('token', 'fake-token');
    mockedAxios.isAxiosError.mockReturnValue(false);
    mockedMessagesApi.getMessages.mockResolvedValue([myMessage, theirMessage] as never);

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByTestId('chat-bubble')).toHaveLength(2);
    });

    const bubbles = screen.getAllByTestId('chat-bubble');
    expect(bubbles[0]).toHaveClass('chat-bubble--me');
    expect(bubbles[1]).toHaveClass('chat-bubble--them');
    expect(bubbles[1]).toHaveTextContent('Docente');
  });

  it('sends a message on form submit', async () => {
    localStorage.setItem('token', 'fake-token');
    mockedAxios.isAxiosError.mockReturnValue(false);
    mockedMessagesApi.getMessages.mockResolvedValue([] as never);

    const newMessage: Message = {
      id: 'm3',
      content: 'Nuevo mensaje',
      createdAt: '2024-01-01T10:02:00Z',
      sender: { id: 'u1', name: 'Yo', role: 'estudiante' },
    };
    mockedMessagesApi.sendMessage.mockResolvedValue(newMessage as never);

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('chat-input')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('chat-input'), {
      target: { value: 'Nuevo mensaje' },
    });
    fireEvent.click(screen.getByTestId('btn-send'));

    await waitFor(() => {
      expect(mockedMessagesApi.sendMessage).toHaveBeenCalledWith(
        'app-123',
        'Nuevo mensaje',
      );
      expect(screen.getByText('Nuevo mensaje')).toBeInTheDocument();
    });
  });
});
