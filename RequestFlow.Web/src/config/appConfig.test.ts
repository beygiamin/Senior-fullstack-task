import { afterEach, vi } from 'vitest';
import { loadAppConfig } from './appConfig';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('loadAppConfig', () => {
  it('revalidates static configuration assets with the browser cache', async () => {
    const roleLabels = { Employee: 'کارمند' };
    const requestFormSchema = {
      fields: [{ key: 'title', label: 'عنوان', type: 'text', required: true }],
    };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(roleLabels)))
      .mockResolvedValueOnce(new Response(JSON.stringify(requestFormSchema)));
    vi.stubGlobal('fetch', fetchMock);

    await expect(loadAppConfig()).resolves.toEqual({ roleLabels, requestFormSchema });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${import.meta.env.BASE_URL}config/role-labels.json`,
      { cache: 'no-cache' },
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${import.meta.env.BASE_URL}config/request-form-schema.json`,
      { cache: 'no-cache' },
    );
  });

  it('rejects invalid configuration instead of silently falling back', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ Employee: 'کارمند' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ fields: 'invalid' })));
    vi.stubGlobal('fetch', fetchMock);

    await expect(loadAppConfig()).rejects.toThrow('Invalid config/request-form-schema.json');
  });
});
