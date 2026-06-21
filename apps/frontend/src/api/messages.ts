import client from './client';

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; role: string };
}

export const messagesApi = {
  getMessages: (applicationId: string) =>
    client.get<Message[]>(`/applications/${applicationId}/messages`).then((r) => r.data),
  sendMessage: (applicationId: string, content: string) =>
    client
      .post<Message>(`/applications/${applicationId}/messages`, { content })
      .then((r) => r.data),
};
