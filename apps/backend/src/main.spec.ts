const mockEnableCors = jest.fn();
const mockUseGlobalPipes = jest.fn();
const mockSetGlobalPrefix = jest.fn();
const mockListen = jest.fn().mockResolvedValue(undefined);

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockResolvedValue({
      enableCors: mockEnableCors,
      useGlobalPipes: mockUseGlobalPipes,
      setGlobalPrefix: mockSetGlobalPrefix,
      listen: mockListen,
    }),
  },
}));

describe('bootstrap', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    process.env.FRONTEND_URL = 'http://localhost:5173';
    process.env.PORT = '3000';
  });

  it('configures the Nest app and starts listening', async () => {
    await import('./main');

    expect(mockEnableCors).toHaveBeenCalled();
    expect(mockUseGlobalPipes).toHaveBeenCalledWith(
      expect.objectContaining({
        isTransformEnabled: true,
        validatorOptions: expect.objectContaining({ whitelist: true }),
      }),
    );
    expect(mockSetGlobalPrefix).toHaveBeenCalledWith('api');
    expect(mockListen).toHaveBeenCalledWith('3000');
  });
});