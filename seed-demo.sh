#!/usr/bin/env bash
set -e
API="http://localhost:3001/api"

extract_id() { python3 -c "import sys,json; print(json.load(sys.stdin)['id'])"; }
extract_token() { python3 -c "import sys,json; print(json.load(sys.stdin)['token'])"; }

echo "=== 1. Registrando usuarios ==="
reg() { curl -s -X POST "$API/auth/register" -H "Content-Type: application/json" -d "$1" > /dev/null 2>&1 || true; }
reg '{"name":"Javiera Rojas","email":"javiera@demo.cl","password":"Demo1234!","role":"estudiante"}'
reg '{"name":"Tomas Silva","email":"tomas@demo.cl","password":"Demo1234!","role":"estudiante"}'
reg '{"name":"Valentina Parra","email":"valentina@demo.cl","password":"Demo1234!","role":"estudiante"}'
reg '{"name":"Diego Morales","email":"diego@demo.cl","password":"Demo1234!","role":"estudiante"}'
reg '{"name":"Dra. Ana Lopez","email":"ana.lopez@demo.cl","password":"Demo1234!","role":"docente"}'
echo "OK"

echo "=== 2. Obteniendo tokens ==="
tok() { curl -sf -X POST "$API/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"$1\",\"password\":\"Demo1234!\"}" | extract_token; }
DOC=$(tok docente@demo.cl)
INST=$(tok institucion@demo.cl)
ANA=$(tok ana.lopez@demo.cl)
EST=$(tok estudiante@demo.cl)
JAV=$(tok javiera@demo.cl)
TOM=$(tok tomas@demo.cl)
VAL=$(tok valentina@demo.cl)
DIE=$(tok diego@demo.cl)
echo "OK"

echo "=== 3. Creando oportunidades ==="
opp() { curl -sf -X POST "$API/opportunities" -H "Content-Type: application/json" -H "Authorization: Bearer $1" -d "$2" | extract_id; }

# DOCENTE: tutoria, investigacion
OPP1=$(opp "$DOC" '{"title":"Tutoria Programacion en Python","description":"Tutoria semanal de apoyo para estudiantes de primer ano en Introduccion a la Programacion. Se requiere paciencia y habilidad para explicar conceptos basicos. Sesiones los Martes y Jueves de 16:00 a 17:30.","type":"tutoria","requirements":"Dominio de Python. Experiencia previa como tutor es un plus.","deadline":"2026-07-20"}')
echo "  Tutoria Python: $OPP1"

OPP2=$(opp "$DOC" '{"title":"Investigacion en Machine Learning Aplicado","description":"Proyecto de investigacion sobre deteccion de anomalias en series temporales usando redes neuronales. Duracion: 6 meses. Posibilidad de publicacion en conferencia internacional.","type":"investigacion","requirements":"Conocimientos en Python, TensorFlow o PyTorch. Estar cursando al menos 4to ano.","deadline":"2026-08-01","formFields":[{"id":"q1","label":"Que experiencia tienes con redes neuronales?","type":"text_long","required":true},{"id":"q2","label":"Nivel de programacion en Python","type":"select_single","options":["Basico","Intermedio","Avanzado"],"required":true},{"id":"q3","label":"Disponibilidad semanal (horas)","type":"number","required":true}]}')
echo "  Investigacion ML (con formulario): $OPP2"

# DRA. ANA: tutoria, investigacion
OPP3=$(opp "$ANA" '{"title":"Tutoria Ecuaciones Diferenciales","description":"Tutoria de reforzamiento para el curso de Ecuaciones Diferenciales. Enfasis en metodos de resolucion y aplicaciones en ingenieria. Sesiones grupales de maximo 8 estudiantes.","type":"tutoria","requirements":"Haber aprobado Calculo II. Interes en matematicas aplicadas.","deadline":"2026-07-18"}')
echo "  Tutoria Ec. Diferenciales: $OPP3"

OPP4=$(opp "$ANA" '{"title":"Investigacion en Quimica Computacional","description":"Simulaciones moleculares para el estudio de catalizadores. Se usara software GAUSSIAN y Python para analisis de datos. Duracion 1 semestre.","type":"investigacion","requirements":"Conocimientos en quimica organica y programacion basica. Manejo de Linux es deseable.","deadline":"2026-07-25","formFields":[{"id":"q1","label":"Que software de simulacion conoces?","type":"text_short","required":true},{"id":"q2","label":"Areas de interes","type":"select_multiple","options":["Catalizadores","Nanotecnologia","Farmacologia","Materiales"],"required":true},{"id":"q3","label":"Fecha de disponibilidad para comenzar","type":"date","required":false}]}')
echo "  Investigacion Quimica (con formulario): $OPP4"

# INSTITUCION: practica, voluntariado, trabajo
OPP5=$(opp "$INST" '{"title":"Practica Profesional - Desarrollo Web","description":"Practica en el Centro de Innovacion USM. Desarrollo de plataforma interna con React y Node.js. Jornada completa por 3 meses. Incluye mentoria senior y certificado oficial.","type":"practica","requirements":"Conocimientos en React, Node.js y SQL. Disponibilidad jornada completa.","deadline":"2026-07-30","formFields":[{"id":"q1","label":"Link a tu portafolio o GitHub","type":"text_short","required":true},{"id":"q2","label":"Por que te interesa esta practica?","type":"text_long","required":true},{"id":"q3","label":"Tecnologias que dominas","type":"select_multiple","options":["React","Node.js","TypeScript","PostgreSQL","Docker","AWS"],"required":true},{"id":"q4","label":"Puedes trabajar jornada completa?","type":"select_single","options":["Si, jornada completa","Solo media jornada","Flexible"],"required":true}]}')
echo "  Practica Desarrollo Web (con formulario): $OPP5"

OPP6=$(opp "$INST" '{"title":"Voluntariado - Taller de Robotica para Ninos","description":"Voluntarios para dictar talleres de robotica basica a ninos de 8-12 anos en colegios de Valparaiso. Todos los sabados de julio y agosto, de 10:00 a 13:00.","type":"voluntariado","requirements":"Conocimientos basicos de electronica y Arduino. Gusto por ensenar a ninos.","deadline":"2026-07-10"}')
echo "  Voluntariado Robotica: $OPP6"

OPP7=$(opp "$INST" '{"title":"Trabajo Part-time - Asistente de Laboratorio","description":"Asistente para el laboratorio de Quimica Analitica. Preparacion de soluciones, mantenimiento de equipos y apoyo en practicas de laboratorio. 20 hrs/semana.","type":"trabajo","requirements":"Estar cursando Quimica o Ingenieria Quimica. Responsabilidad y puntualidad.","deadline":"2026-07-25"}')
echo "  Trabajo Laboratorio: $OPP7"

# ESTUDIANTES: ayudantia, grupo_estudio, tutoria
OPP8=$(opp "$JAV" '{"title":"Ayudantia Calculo III","description":"Se busca ayudante para el curso de Calculo III, semestre 2026-2. Horario: Lunes y Miercoles 14:00-15:30. Incluye preparacion de material y correccion de evaluaciones.","type":"ayudantia","requirements":"Haber aprobado Calculo III con buena nota. Disponibilidad 6 hrs/semana.","deadline":"2026-07-15"}')
echo "  Ayudantia Calculo III: $OPP8"

OPP9=$(opp "$EST" '{"title":"Grupo de Estudio - Preparacion Examen de Grado","description":"Grupo de estudio colaborativo para preparar el examen de grado de Ingenieria Civil Informatica. Sesiones 3 veces por semana en biblioteca central.","type":"grupo_estudio","requirements":"Estar inscrito en examen de grado semestre 2026-2.","deadline":"2026-09-01"}')
echo "  Grupo Estudio Grado: $OPP9"

OPP10=$(opp "$DIE" '{"title":"Ayudantia Fisica General II","description":"Ayudante para el curso de Fisica General II. Resolucion de ejercicios en catedra auxiliar y atencion de consultas en horario de oficina.","type":"ayudantia","requirements":"Buena nota en Fisica General II. Disponibilidad Martes y Jueves 10:00-11:30.","deadline":"2026-07-18"}')
echo "  Ayudantia Fisica II: $OPP10"

echo "=== 4. Backdating oportunidades ==="
docker exec campuslink-db psql -U postgres -d campuslink -c "
  UPDATE opportunities SET \"createdAt\" = NOW() - INTERVAL '5 days' WHERE id = '$OPP1';
  UPDATE opportunities SET \"createdAt\" = NOW() - INTERVAL '3 days' WHERE id = '$OPP2';
  UPDATE opportunities SET \"createdAt\" = NOW() - INTERVAL '7 days' WHERE id = '$OPP3';
  UPDATE opportunities SET \"createdAt\" = NOW() - INTERVAL '4 days' WHERE id = '$OPP4';
  UPDATE opportunities SET \"createdAt\" = NOW() - INTERVAL '6 days' WHERE id = '$OPP5';
  UPDATE opportunities SET \"createdAt\" = NOW() - INTERVAL '2 days' WHERE id = '$OPP6';
  UPDATE opportunities SET \"createdAt\" = NOW() - INTERVAL '1 day'  WHERE id = '$OPP7';
  UPDATE opportunities SET \"createdAt\" = NOW() - INTERVAL '8 days' WHERE id = '$OPP8';
  UPDATE opportunities SET \"createdAt\" = NOW() - INTERVAL '10 days' WHERE id = '$OPP9';
  UPDATE opportunities SET \"createdAt\" = NOW() - INTERVAL '4 days' WHERE id = '$OPP10';
" > /dev/null
echo "OK"

echo "=== 5. Creando postulaciones ==="
app() { curl -s -X POST "$API/applications" -H "Content-Type: application/json" -H "Authorization: Bearer $1" -d "$2" > /dev/null 2>&1 || true; }

# Maria postula a 4 (incluyendo una con formulario)
app "$EST" "{\"opportunityId\":\"$OPP1\"}"
app "$EST" "{\"opportunityId\":\"$OPP5\",\"formResponses\":{\"q1\":\"github.com/maria-dev\",\"q2\":\"Me apasiona el desarrollo web y quiero ganar experiencia profesional en un equipo real.\",\"q3\":[\"React\",\"Node.js\",\"TypeScript\",\"PostgreSQL\"],\"q4\":\"Si, jornada completa\"}}"
app "$EST" "{\"opportunityId\":\"$OPP6\"}"
app "$EST" "{\"opportunityId\":\"$OPP8\"}"
echo "  Maria: 4 postulaciones"

# Javiera postula a 3
app "$JAV" "{\"opportunityId\":\"$OPP1\"}"
app "$JAV" "{\"opportunityId\":\"$OPP2\",\"formResponses\":{\"q1\":\"Implemente un autoencoder para deteccion de fraudes en mi proyecto de titulo.\",\"q2\":\"Avanzado\",\"q3\":\"15\"}}"
app "$JAV" "{\"opportunityId\":\"$OPP5\",\"formResponses\":{\"q1\":\"github.com/javiera-r\",\"q2\":\"Busco aplicar lo aprendido en clases en un proyecto real con impacto.\",\"q3\":[\"React\",\"TypeScript\",\"Docker\"],\"q4\":\"Si, jornada completa\"}}"
echo "  Javiera: 3 postulaciones"

# Tomas postula a 4
app "$TOM" "{\"opportunityId\":\"$OPP1\"}"
app "$TOM" "{\"opportunityId\":\"$OPP6\"}"
app "$TOM" "{\"opportunityId\":\"$OPP7\"}"
app "$TOM" "{\"opportunityId\":\"$OPP10\"}"
echo "  Tomas: 4 postulaciones"

# Valentina postula a 3 (incluyendo formularios)
app "$VAL" "{\"opportunityId\":\"$OPP2\",\"formResponses\":{\"q1\":\"Trabaje con CNNs en un proyecto de vision computacional para clasificar imagenes medicas.\",\"q2\":\"Intermedio\",\"q3\":\"10\"}}"
app "$VAL" "{\"opportunityId\":\"$OPP4\",\"formResponses\":{\"q1\":\"GAUSSIAN y ORCA\",\"q2\":[\"Catalizadores\",\"Materiales\"],\"q3\":\"2026-07-15\"}}"
app "$VAL" "{\"opportunityId\":\"$OPP8\"}"
echo "  Valentina: 3 postulaciones"

# Diego postula a 2
app "$DIE" "{\"opportunityId\":\"$OPP1\"}"
app "$DIE" "{\"opportunityId\":\"$OPP9\"}"
echo "  Diego: 2 postulaciones"

echo "=== 6. Finalizando Tutoria Python (aceptar Maria) ==="
# Close applications first
curl -sf -X PATCH "$API/opportunities/$OPP1/close" -H "Authorization: Bearer $DOC" > /dev/null

# Get Maria's application ID
MARIA_APP=$(curl -s "$API/applications/by-opportunity/$OPP1" -H "Authorization: Bearer $DOC" | python3 -c "
import sys, json
for a in json.load(sys.stdin):
    if a['user']['email'] == 'estudiante@demo.cl':
        print(a['id']); break
")

# Finalize accepting Maria
curl -sf -X POST "$API/applications/finalize/$OPP1" -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DOC" \
  -d "{\"acceptedApplicationIds\":[\"$MARIA_APP\"]}" > /dev/null
echo "  Maria aceptada"

# Feedback for Maria
curl -sf -X PUT "$API/applications/$MARIA_APP/feedback" -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DOC" \
  -d '{"feedback":"Excelente desempeno como tutora. Muy buena disposicion y claridad al explicar conceptos. Recomendada para futuras tutorias."}' > /dev/null
echo "  Feedback enviado"

echo "=== 7. Cerrando postulaciones de Voluntariado ==="
curl -sf -X PATCH "$API/opportunities/$OPP6/close" -H "Authorization: Bearer $INST" > /dev/null
echo "  Voluntariado en evaluacion"

echo "=== 8. Backdating postulaciones y notificaciones ==="
docker exec campuslink-db psql -U postgres -d campuslink -c "
  UPDATE applications SET \"createdAt\" = NOW() - INTERVAL '3 days' WHERE \"createdAt\" > NOW() - INTERVAL '1 minute';
  UPDATE notifications SET \"createdAt\" = NOW() - INTERVAL '2 days' WHERE \"createdAt\" > NOW() - INTERVAL '1 minute';
" > /dev/null
echo "OK"

echo ""
echo "========================================="
echo "  SEED COMPLETO"
echo "========================================="
echo ""
echo "Usuarios (password: Demo1234!):"
echo "  estudiante@demo.cl  - Maria Gonzalez     [Estudiante]"
echo "  javiera@demo.cl     - Javiera Rojas      [Estudiante]"
echo "  tomas@demo.cl       - Tomas Silva        [Estudiante]"
echo "  valentina@demo.cl   - Valentina Parra    [Estudiante]"
echo "  diego@demo.cl       - Diego Morales      [Estudiante]"
echo "  docente@demo.cl     - Prof. Carlos Munoz [Docente]"
echo "  ana.lopez@demo.cl   - Dra. Ana Lopez     [Docente]"
echo "  institucion@demo.cl - Centro Innovacion  [Institucion]"
echo "  admin@demo.cl       - Administrador      [Admin]"
echo ""
echo "10 oportunidades (3 con formulario de preguntas)"
echo "16 postulaciones (varias con respuestas de formulario)"
echo ""
echo "Estados:"
echo "  - Tutoria Python:         FINALIZADO (Maria aceptada + feedback)"
echo "  - Voluntariado Robotica:  EN_EVALUACION"
echo "  - Resto:                  DISPONIBLE"
echo ""
echo "Formularios:"
echo "  - Investigacion ML:       3 preguntas (texto largo, seleccion, numero)"
echo "  - Investigacion Quimica:  3 preguntas (texto corto, seleccion multiple, fecha)"
echo "  - Practica Desarrollo Web: 4 preguntas (texto, seleccion multiple, seleccion unica)"
echo "========================================="
