import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from './entities/user.entity';

function buildContext(
  user: { id: string; role: UserRole; suspended: boolean } | null,
): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('allows when no roles metadata is set', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const ctx = buildContext({
      id: 'u1',
      role: UserRole.ESTUDIANTE,
      suspended: false,
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows user with correct role', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.DOCENTE]);
    const ctx = buildContext({
      id: 'u1',
      role: UserRole.DOCENTE,
      suspended: false,
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws ForbiddenException for wrong role', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.DOCENTE, UserRole.INSTITUCION]);
    const ctx = buildContext({
      id: 'u1',
      role: UserRole.ESTUDIANTE,
      suspended: false,
    });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when user is suspended', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.DOCENTE]);
    const ctx = buildContext({
      id: 'u1',
      role: UserRole.DOCENTE,
      suspended: true,
    });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
