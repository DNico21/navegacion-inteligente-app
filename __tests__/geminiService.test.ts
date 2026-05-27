/**
 * Unit tests for geminiService.
 * fetch is mocked — no real API calls.
 * process.env.EXPO_PUBLIC_GEMINI_API_KEY is set in jest.setup.js ('test-gemini-key-123').
 */

import { sendMessageToGemini, GeminiMessage } from '../utils/geminiService';

global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

beforeEach(() => mockFetch.mockClear());

describe('sendMessageToGemini', () => {
  it('returns config message when API key is empty', async () => {
    const saved = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    process.env.EXPO_PUBLIC_GEMINI_API_KEY = '';

    const result = await sendMessageToGemini([], 'hola');
    expect(result).toContain('Configura tu clave');
    expect(mockFetch).not.toHaveBeenCalled();

    process.env.EXPO_PUBLIC_GEMINI_API_KEY = saved;
  });

  it('returns AI text on successful response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'Respira profundo, todo estará bien.' }] } }],
      }),
    });

    const result = await sendMessageToGemini([], 'Tips de calma');
    expect(result).toBe('Respira profundo, todo estará bien.');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('includes the API key in the request URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: 'ok' }] } }] }),
    });

    await sendMessageToGemini([], 'hola');
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('key=test-gemini-key-123');
    expect(url).toContain('gemini-2.0-flash');
  });

  it('throws on non-ok HTTP response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => 'INVALID_ARGUMENT',
    });

    await expect(sendMessageToGemini([], 'hola')).rejects.toThrow('Gemini 400');
  });

  it('throws on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network request failed'));
    await expect(sendMessageToGemini([], 'hola')).rejects.toThrow('Network request failed');
  });

  it('returns fallback text when candidates array is empty', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ candidates: [] }),
    });

    const result = await sendMessageToGemini([], 'hola');
    expect(result).toBe('No pude generar una respuesta, intenta de nuevo.');
  });

  it('sends full conversation history in request body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: 'respuesta' }] } }] }),
    });

    const history: GeminiMessage[] = [
      { role: 'model', text: 'Hola' },
      { role: 'user', text: 'Afirmación del día' },
    ];

    await sendMessageToGemini(history, 'nuevo mensaje');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    // 2 history messages + 1 new user message
    expect(body.contents).toHaveLength(3);
    expect(body.contents[0]).toEqual({ role: 'model', parts: [{ text: 'Hola' }] });
    expect(body.contents[2].role).toBe('user');
    expect(body.contents[2].parts[0].text).toBe('nuevo mensaje');
  });

  it('trims whitespace from the AI response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '  Bienvenido.  \n' }] } }],
      }),
    });

    const result = await sendMessageToGemini([], 'hola');
    expect(result).toBe('Bienvenido.');
  });
});
