// Genera el documento de la Entrega 3 de CampusLink (.docx)
const path = require('path');
const { execSync } = require('child_process');
const GROOT = execSync('npm root -g').toString().trim();
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle,
  WidthType, ShadingType, VerticalAlign, PageNumber, PageBreak, TableOfContents,
  ExternalHyperlink, TabStopType, TabStopPosition,
} = require(path.join(GROOT, 'docx'));

const NAVY = '1E3A5F', TEAL = '1A9A8E', SLATE = '64748B', LIGHT = 'EAF2F8';
const CONTENT_W = 9360; // US Letter, 1" margins

// ---------- helpers ----------
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const P = (t, opts = {}) => new Paragraph({
  spacing: { after: 120, line: 276 },
  children: Array.isArray(t) ? t : [new TextRun({ text: t, ...opts })],
});
const B = (t) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 }, spacing: { after: 60 },
  children: Array.isArray(t) ? t : [new TextRun(t)],
});
const run = (t, o = {}) => new TextRun({ text: t, ...o });

function cell(text, { w, bold = false, fill = null, color = '1F2A37', align = AlignmentType.LEFT, size = 20 } = {}) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' };
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: { top: border, bottom: border, left: border, right: border },
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 70, bottom: 70, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: align,
      children: (Array.isArray(text) ? text : [text]).map((s) =>
        new TextRun({ text: s, bold, color, size })),
    })],
  });
}

function table(cols, headers, rows, headFill = NAVY) {
  const headRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => cell(h, { w: cols[i], bold: true, fill: headFill, color: 'FFFFFF' })),
  });
  const bodyRows = rows.map((r, ri) => new TableRow({
    children: r.map((c, i) => cell(c, {
      w: cols[i], fill: ri % 2 ? LIGHT : 'FFFFFF',
      bold: i === 1 && String(c).length <= 3,
      color: (i === 1 && String(c).length <= 3) ? TEAL : '1F2A37',
      align: (i === 1 && String(c).length <= 3) ? AlignmentType.CENTER : AlignmentType.LEFT,
    })),
  }));
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: cols,
    rows: [headRow, ...bodyRows],
  });
}

function code(lines) {
  return new Paragraph({
    spacing: { before: 60, after: 120 },
    shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
    border: { left: { style: BorderStyle.SINGLE, size: 18, color: TEAL, space: 8 } },
    children: lines.flatMap((l, i) => [
      ...(i ? [new TextRun({ break: 1 })] : []),
      new TextRun({ text: l, font: 'Consolas', size: 19, color: '0F2440' }),
    ]),
  });
}

// ---------- contenido ----------
const children = [];

// PORTADA
children.push(
  new Paragraph({ spacing: { before: 2600, after: 0 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'CampusLink', bold: true, size: 72, color: NAVY })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
    children: [new TextRun({ text: 'Plataforma de Oportunidades Universitarias', size: 28, color: TEAL })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 240, after: 80 },
    children: [new TextRun({ text: 'Entrega 3 — Pruebas de interfaz E2E con Playwright', bold: true, size: 32, color: '1F2A37' })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
    children: [new TextRun({ text: 'INF331 – Pruebas de Software', size: 24, color: SLATE })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1200, after: 40 },
    children: [new TextRun({ text: 'José Meza · Matías Barraza · Leonardo Chacón · Aarón Vargas', size: 22, color: '1F2A37' })] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Repositorio: github.com/CampusLink-INF301/CampusLink', size: 20, color: SLATE })] }),
  new Paragraph({ children: [new PageBreak()] }),
);

// TOC
children.push(
  new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: 'Índice', bold: true, size: 32, color: NAVY })] }),
  new TableOfContents('Tabla de contenidos', { hyperlink: true, headingStyleRange: '1-2' }),
  new Paragraph({ children: [new PageBreak()] }),
);

// 1. OBJETIVO
children.push(H1('1. Objetivo de la Entrega 3'));
children.push(P('El objetivo de esta entrega es incorporar pruebas de interfaz de extremo a extremo (E2E/UI) a CampusLink e integrarlas a nuestro pipeline de Integración Continua, de modo que cada cambio en el repositorio sea validado automáticamente no solo a nivel de lógica (pruebas unitarias), sino también a nivel de los flujos reales que ejecuta un usuario en el navegador.'));
children.push(P('Concretamente, buscamos:'));
children.push(B('Contar con un set de pruebas E2E sobre los flujos críticos de la aplicación.'));
children.push(B('Ejecutarlas automáticamente en el pipeline, de forma headless y reproducible.'));
children.push(B('Que el pipeline falle si falla una prueba E2E, evitando regresiones.'));
children.push(B('Generar evidencia clara (reportes, screenshots) y notificar el resultado al equipo.'));

// 2. RESUMEN
children.push(H1('2. Resumen de lo implementado'));
children.push(table([3120, 6240], ['Aspecto', 'Implementación'], [
  ['Herramienta E2E', 'Playwright (Chromium, headless)'],
  ['Pruebas E2E', '17 pruebas sobre 9 flujos críticos'],
  ['Pruebas totales del proyecto', '276 (139 backend + 120 frontend + 17 E2E), 100% en verde'],
  ['Pipeline CI/CD', 'GitHub Actions — 5 jobs encadenados'],
  ['Disparadores', 'push a develop/main y Pull Requests a main'],
  ['Evidencia', 'Reporte HTML de Playwright (artefacto) + screenshots en fallos'],
  ['Notificaciones', 'Discord (webhook) con el estado del pipeline'],
]));

// 3. HERRAMIENTA
children.push(H1('3. Herramienta E2E elegida: Playwright'));
children.push(P('El enunciado propone Selenium por defecto, pero permite explícitamente usar una alternativa equivalente. Elegimos Playwright, que automatiza un navegador real (Chromium) y permite simular al usuario de punta a punta: clics, formularios, navegación y verificación de resultados en pantalla.'));
children.push(H2('3.1 ¿Por qué Playwright y no Selenium?'));
children.push(B([run('Mismo ecosistema. ', { bold: true }), run('El proyecto es JavaScript/TypeScript; Playwright se integra sin cambiar de lenguaje ni de herramienta de build.')]));
children.push(B([run('Headless nativo. ', { bold: true }), run('Corre sin interfaz gráfica, ideal para CI, sin configuración extra de drivers.')]));
children.push(B([run('Auto-waiting. ', { bold: true }), run('Espera automáticamente a que los elementos estén listos, lo que reduce drásticamente los tests intermitentes (flaky).')]));
children.push(B([run('Evidencia integrada. ', { bold: true }), run('Reporte HTML, trazas (trace) y screenshots vienen incluidos, sin plugins adicionales.')]));
children.push(B([run('Selectores estables. ', { bold: true }), run('Usamos atributos data-testid en los componentes, evitando selectores frágiles.')]));

// 4. SET DE PRUEBAS
children.push(H1('4. Set de pruebas E2E'));
children.push(P('Definimos 17 pruebas que cubren los flujos críticos de usuario final. El enunciado recomienda un mínimo de 10, por lo que la cobertura es holgada y centrada en lo que el usuario realmente hace.'));
children.push(table([2900, 1000, 5460], ['Flujo', 'Casos', 'Qué valida'], [
  ['Autenticación', '3', 'Login válido, login con contraseña incorrecta, registro de usuario nuevo'],
  ['Navegación / guards', '1', 'Acceder a /profile sin sesión redirige a /login'],
  ['Crear oportunidad', '2', 'Creación con redirección al detalle; validación de campos obligatorios'],
  ['Editar / Eliminar', '3', 'Carga de datos en el formulario, guardado de cambios y eliminación'],
  ['Listar / Detalle', '4', 'Listado principal, oportunidad recién creada, detalle y badge de estado'],
  ['Búsqueda y filtro', '3', 'Búsqueda por texto, filtro por tipo y botón de limpiar filtros'],
  ['Postular', '1', 'Un estudiante postula a una oportunidad con éxito'],
]));
children.push(P([run('Escenarios críticos cubiertos: ', { bold: true }), run('CRUD completo (crear → listar → ver detalle → editar → eliminar), validaciones y mensajes de error, búsqueda y filtrado, autenticación y control de acceso, y el flujo de postulación.')]));
children.push(P([run('Ubicación: ', { bold: true }), run('apps/frontend/tests/ (archivos *.spec.ts).', { font: 'Consolas', size: 19 })]));

// 5. CÓMO EJECUTAR
children.push(H1('5. Cómo ejecutar localmente'));
children.push(H2('5.1 Prerequisitos'));
children.push(B('Node.js 22 y dependencias instaladas (npm ci en la raíz del monorepo).'));
children.push(B('PostgreSQL disponible y variable DATABASE_URL configurada para el backend.'));
children.push(B('Navegador de Playwright instalado (una sola vez).'));
children.push(H2('5.2 Comandos'));
children.push(code([
  '# 1) Instalar el navegador de Playwright (una vez)',
  'cd apps/frontend && npx playwright install chromium',
  '',
  '# 2) Levantar el backend (en otra terminal)',
  'npm run start:dev --workspace=apps/backend',
  '',
  '# 3) Ejecutar las pruebas E2E (Playwright levanta el frontend)',
  'cd apps/frontend && npx playwright test',
  '',
  '# 4) Ver el reporte HTML',
  'npx playwright show-report',
]));
children.push(P([run('La URL base se configura por variable de entorno ', {}), run('BASE_URL', { font: 'Consolas', size: 19 }), run(' (por defecto http://localhost:5173) y la del API con ', {}), run('API_URL', { font: 'Consolas', size: 19 }), run('; no hay URLs hardcodeadas.')]));

// 6. CI/CD
children.push(H1('6. Integración con CI/CD'));
children.push(P('El pipeline está definido en GitHub Actions (.github/workflows/ci.yml) y se dispara en cada push a develop/main y en cada Pull Request a main. Se compone de cinco jobs encadenados:'));
children.push(table([1700, 3200, 4460], ['Job', 'Nombre', 'Qué hace'], [
  ['1', 'Backend build', 'Verificación de tipos del backend (tsc)'],
  ['2', 'Frontend build', 'Verificación de tipos y build del frontend'],
  ['3', 'Jest', 'Pruebas unitarias de backend y frontend con PostgreSQL real'],
  ['4', 'Playwright E2E', 'Levanta app + base de datos y corre las 17 pruebas E2E headless'],
  ['5', 'Discord', 'Notifica el resultado del pipeline al equipo'],
]));
children.push(P([run('Política de fallo: ', { bold: true }), run('si falla cualquier prueba E2E, el job 4 falla y el pipeline completo se marca en rojo. Así una regresión en un flujo de usuario impide avanzar.')]));
children.push(P([run('Variables clave del job E2E: ', { bold: true }), run('BASE_URL, API_URL, DATABASE_URL, JWT_SECRET y E2E_RUN_ID', { font: 'Consolas', size: 19 }), run(' (este último genera datos de prueba aislados por ejecución).')]));

// 7. EVIDENCIAS
children.push(H1('7. Evidencias'));
children.push(B([run('Reporte HTML de Playwright', { bold: true }), run(': se sube como artefacto del pipeline (retención 14 días) y se puede descargar desde la pestaña Actions de GitHub.')]));
children.push(B([run('Screenshots en fallos', { bold: true }), run(': la configuración captura una imagen automáticamente solo cuando un test falla (screenshot: only-on-failure), además de la traza en el primer reintento.')]));
children.push(B([run('Estado del build', { bold: true }), run(': cada commit queda marcado verde/rojo en GitHub según el resultado del pipeline.')]));
children.push(B([run('Notificación a Discord', { bold: true }), run(': el job de notificación informa éxito/fallo con la rama y el autor del cambio.')]));
children.push(P([run('Sugerencia para la entrega: ', { bold: true }), run('adjuntar capturas del run en verde en GitHub Actions, del reporte de Playwright y del mensaje en Discord.')]));

// 8. PROBLEMAS Y SOLUCIONES
children.push(H1('8. Problemas encontrados y soluciones'));
children.push(H2('8.1 El pipeline E2E fallaba aunque los tests pasaban en local'));
children.push(P([run('Síntoma: ', { bold: true }), run('el job de Playwright fallaba en CI en el paso «esperar al backend», pese a que las 17 pruebas pasaban al ejecutarlas localmente.')]));
children.push(P([run('Causa: ', { bold: true }), run('el chequeo de disponibilidad esperaba una respuesta de GET /api, ruta que devuelve 404 porque no existe un endpoint raíz. La herramienta de espera (wait-on) solo da por «listo» un estado 2xx/3xx, así que expiraba y mataba el job — aunque el backend estaba perfectamente sano.')]));
children.push(P([run('Solución: ', { bold: true }), run('apuntar la espera a GET /api/opportunities, un endpoint real que responde 200 sin autenticación. Con eso el pipeline quedó en verde y las E2E corren de punta a punta.')]));
children.push(P([run('Aprendizaje: ', { bold: true }), run('la propia infraestructura de pruebas también se prueba y se depura; un health-check mal apuntado puede simular un fallo inexistente.')]));
children.push(H2('8.2 Un test de frontend rompía por import.meta en Jest'));
children.push(P([run('Síntoma: ', { bold: true }), run('un test de componente fallaba al importar el cliente HTTP real, que usa import.meta.env (no soportado por el entorno de Jest).')]));
children.push(P([run('Solución: ', { bold: true }), run('mockear el módulo de API correspondiente en el test, aislando el componente de la capa de red, como ya se hace en el resto de la suite.')]));

// 9. PENDIENTES
children.push(H1('9. Pendientes y mejoras futuras'));
children.push(B('Ampliar la cobertura E2E a los flujos de administración, notificaciones y chat.'));
children.push(B('Ejecutar las E2E en múltiples navegadores (Firefox y WebKit).'));
children.push(B('Incorporar regresión visual de las vistas principales.'));
children.push(B('Automatizar el despliegue tras un pipeline en verde.'));
children.push(B('Publicar métricas de cobertura combinada (unitarias + E2E) en CI.'));

// ---------- documento ----------
const doc = new Document({
  creator: 'Equipo CampusLink',
  title: 'CampusLink — Entrega 3',
  styles: {
    default: { document: { run: { font: 'Calibri', size: 22, color: '1F2A37' } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 30, bold: true, color: NAVY, font: 'Calibri' },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: TEAL, space: 4 } } } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 25, bold: true, color: '1F2A37', font: 'Calibri' },
        paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [{
      reference: 'bullets',
      levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 540, hanging: 260 } } } }],
    }],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    headers: {
      default: new Header({ children: [new Paragraph({
        alignment: AlignmentType.RIGHT, spacing: { after: 0 },
        children: [new TextRun({ text: 'CampusLink · Entrega 3 · INF331', size: 16, color: SLATE })],
      })] }),
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        children: [
          new TextRun({ text: 'Pruebas de Software', size: 16, color: SLATE }),
          new TextRun({ text: '\tPágina ', size: 16, color: SLATE }),
          new TextRun({ children: [PageNumber.CURRENT], size: 16, color: SLATE }),
          new TextRun({ text: ' de ', size: 16, color: SLATE }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: SLATE }),
        ],
      })] }),
    },
    children,
  }],
});

const out = path.join(__dirname, '..', 'docs', 'Entrega-3.docx');
Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(out, buf); console.log('Guardado:', out); });
