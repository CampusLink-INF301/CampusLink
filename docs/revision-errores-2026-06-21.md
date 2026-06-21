# Revisión general y corrección de errores — 2026-06-21

Revisión del estado del repo tras el merge de los tests E2E (Playwright) y dejar el
proyecto en verde para la Entrega 2. A continuación, el detalle de lo encontrado y
corregido.

## Resumen de cambios

| Archivo | Cambio | Motivo |
|---------|--------|--------|
| `.gitignore` | Se ignora `/entrega2.md` (raíz) | El enunciado de la entrega no debe subirse al repo |
| `apps/backend/src/saved/saved.service.ts` | Se eliminaron dos `as any` al construir la entidad `SavedOpportunity` | Violaban la regla de TypeScript strict / `no-unsafe-assignment`; TypeORM `create()` ya acepta `DeepPartial`, no hace falta el cast |
| `apps/frontend/src/pages/opportunities/OpportunityApplicantsPage.test.tsx` | Se mockea también `../../api/opportunities` | El test fallaba al importar el `client.ts` real (`import.meta` no existe en Jest). La página usa `opportunitiesApi.closeApplications`, que no estaba mockeado |
| `apps/frontend/src/pages/profile/ProfilePage.tsx` | Se movió `setApplicationsError('')` dentro del `.then` del fetch | Error de lint `react-hooks/set-state-in-effect`: no se debe llamar `setState` de forma síncrona en el cuerpo de un `useEffect` |

## Verificación (todos los gates de CI en verde)

| Gate | Comando | Resultado |
|------|---------|-----------|
| Backend compila | `npx tsc --noEmit -p tsconfig.build.json` | ✅ OK |
| Backend tests | `npm test` (backend) | ✅ 21 suites / 139 tests |
| Frontend build | `npm run build` (frontend) | ✅ OK |
| Frontend lint | `npm run lint` (frontend) | ✅ Sin errores |
| Frontend tests | `npm test` (frontend) | ✅ 27 suites / 120 tests |

> Nota: los tests E2E de Playwright no se ejecutaron localmente (requieren levantar
> back y front + navegadores). CI los corre en su propio job.

## Pendiente conocido (no bloquea la entrega)

- **`npm run lint` del backend reporta ~1600 errores, todos en archivos `.spec.ts`**
  (reglas type-aware `no-unsafe-call` / `no-unsafe-member-access` sobre los mocks de
  Jest). **CI no ejecuta el lint del backend** (solo `tsc --noEmit`, build y jest), por
  lo que no afecta la entrega. Es un problema de configuración del `eslint.config.mjs` /
  `projectService` que no resuelve los tipos en los specs. Se recomienda abordarlo aparte
  (p. ej. una config de ESLint específica para tests o ajustar el `parserOptions.project`).

## Sobre la Entrega 2 (CI/CD)

El enunciado (`entrega2.md`) pide, además de las mejoras de la app:
- **Jenkins** instalado/configurado, **pipeline** disparado por push/PR (webhook + Ngrok
  si es local) e integración con **Slack**.

A la fecha el repo **no contiene `Jenkinsfile` ni configuración de Jenkins/Slack/Ngrok**.
La automatización existente es **GitHub Actions** (`.github/workflows/ci.yml`), que el
enunciado acepta como alternativa válida, pero si la rúbrica exige Jenkins explícitamente,
ese punto queda pendiente de implementar.
