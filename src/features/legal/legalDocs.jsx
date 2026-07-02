// Contingut dels documents legals de FindYourBet (FYB).
//
// IMPORTANT (per a l'equip de FYB):
// Aquests textos són una base sòlida i adaptada al model de negoci real de FYB
// (marketplace de PRONÒSTICS / informació esportiva — NO és un operador de joc ni
// s'apuesta dins la plataforma). Tot i això NO substitueixen l'assessorament d'un
// advocat. Abans d'obrir al públic seriós, cal:
//   1. Omplir les dades marcades amb ⟦…⟧ (raó social, NIF, adreça fiscal, registre).
//   2. Fer-los revisar per un advocat especialitzat en dret digital / dret del joc.
//
// Estructura data-driven: cada bloc és un objecte que el renderer (LegalPage) pinta.
//   { p: '…' }          → paràgraf
//   { h3: '…' }         → subtítol
//   { ul: ['…', …] }    → llista de punts
//   { note: '…' }       → caixa destacada (avís)

// Dades que l'equip ha d'omplir amb la informació legal real de l'entitat titular.
export const COMPANY = {
  brand: 'FindYourBet',
  legalName: '⟦RAZÓN SOCIAL / NOMBRE Y APELLIDOS DEL TITULAR⟧',
  taxId: '⟦NIF / CIF⟧',
  address: '⟦DIRECCIÓN FISCAL COMPLETA⟧',
  registry: '⟦DATOS REGISTRALES (si es sociedad) — Registro Mercantil, tomo, folio, hoja⟧',
  email: 'fyourbet@gmail.com',
  domain: 'fyourbet.com',
}

export const LAST_UPDATED = '2 de julio de 2026'

// Ordre en què es mostren al footer / índexs.
export const LEGAL_ORDER = ['aviso-legal', 'terminos', 'privacidad', 'cookies', 'juego-responsable']

export const LEGAL_DOCS = {
  // ─────────────────────────────────────────────────────────────────────────
  'aviso-legal': {
    slug: 'aviso-legal',
    title: 'Aviso Legal',
    short: 'Aviso Legal',
    desc: 'Datos identificativos del titular y condiciones generales de uso del sitio web.',
    blocks: [
      { h3: '1. Datos identificativos' },
      { p: `En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de que el titular de este sitio web es:` },
      { ul: [
        `Titular: ${COMPANY.legalName}`,
        `NIF/CIF: ${COMPANY.taxId}`,
        `Domicilio: ${COMPANY.address}`,
        `Datos registrales: ${COMPANY.registry}`,
        `Correo electrónico de contacto: ${COMPANY.email}`,
        `Sitio web: ${COMPANY.domain}`,
      ] },
      { h3: '2. Objeto y naturaleza del servicio' },
      { p: `FindYourBet ("FYB", "la Plataforma") es una red social y un marketplace de información y pronósticos deportivos. FYB pone en contacto a usuarios que comparten análisis y pronósticos deportivos ("tipsters") con usuarios interesados en dicho contenido.` },
      { note: `FindYourBet NO es un operador de juego ni una casa de apuestas. En la Plataforma NO se realizan apuestas, no se aceptan ni gestionan cantidades destinadas al juego, y no se paga premio alguno en función de resultados deportivos. FYB únicamente facilita la publicación, difusión y suscripción a contenido informativo de carácter deportivo.` },
      { h3: '3. Condiciones de acceso y uso' },
      { p: `El acceso a la Plataforma es gratuito, salvo el contenido premium ofrecido por los tipsters mediante suscripción o pago puntual. El acceso está reservado a personas mayores de 18 años. El usuario se compromete a hacer un uso lícito y adecuado del sitio y de sus contenidos, de conformidad con la legislación aplicable y con los presentes términos.` },
      { h3: '4. Propiedad intelectual e industrial' },
      { p: `La marca "FindYourBet", su logotipo, el diseño del sitio, el código fuente, las bases de datos y demás elementos de la Plataforma son titularidad del titular o cuenta con licencia para su uso, y están protegidos por la normativa de propiedad intelectual e industrial. El contenido publicado por cada tipster es responsabilidad y, en su caso, propiedad de dicho usuario.` },
      { h3: '5. Exención de responsabilidad' },
      { p: `El titular no se responsabiliza de las decisiones que el usuario adopte a partir de la información o pronósticos publicados en la Plataforma. Los pronósticos son opiniones de sus autores y no constituyen consejo financiero ni garantía de resultado alguno. El titular no garantiza la disponibilidad continua del sitio ni la ausencia de errores.` },
      { h3: '6. Legislación aplicable y jurisdicción' },
      { p: `Las presentes condiciones se rigen por la legislación española. Para la resolución de cualquier controversia, las partes se someten a los juzgados y tribunales que resulten competentes conforme a la normativa vigente en materia de consumidores y usuarios.` },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  'terminos': {
    slug: 'terminos',
    title: 'Términos y Condiciones',
    short: 'Términos y Condiciones',
    desc: 'Condiciones que regulan el uso de FindYourBet, tanto para usuarios como para tipsters.',
    blocks: [
      { p: `Los presentes Términos y Condiciones ("Términos") regulan el acceso y uso de la plataforma FindYourBet ("FYB", "la Plataforma"). Al registrarte y utilizar la Plataforma aceptas estos Términos en su totalidad. Si no estás de acuerdo, no debes utilizar el servicio.` },
      { h3: '1. Descripción del servicio' },
      { p: `FYB es una red social y marketplace de pronósticos deportivos. Permite a los usuarios registrar sus pronósticos ("picks"), seguir a otros usuarios, crear canales (públicos o privados de pago) y suscribirse a contenido premium de tipsters.` },
      { note: `FYB no es un operador de juego. En la Plataforma no se apuesta ni se gestionan cantidades de dinero destinadas al juego. FYB vende y facilita el acceso a información y opiniones deportivas, no apuestas.` },
      { h3: '2. Requisitos de acceso' },
      { ul: [
        `Debes ser mayor de 18 años.`,
        `Debes residir en un país donde el acceso a contenido de pronósticos deportivos sea legal.`,
        `Debes proporcionar información veraz y mantenerla actualizada.`,
        `Eres responsable de la confidencialidad de tus credenciales de acceso.`,
      ] },
      { h3: '3. Cuentas de usuario' },
      { p: `El registro requiere un nombre de usuario, un correo electrónico válido y la aceptación de estos Términos y de la Política de Privacidad. FYB puede suspender o cancelar cuentas que incumplan estos Términos, que suplanten identidades, que publiquen contenido ilícito o que perjudiquen a la comunidad.` },
      { h3: '4. Tipsters y contenido publicado' },
      { p: `Cualquier usuario puede convertirse en tipster y publicar pronósticos, así como crear canales de pago. El tipster es el único responsable del contenido que publica. Al publicar en FYB, el tipster declara y garantiza que:` },
      { ul: [
        `Sus pronósticos son opiniones propias y no garantizan ningún resultado.`,
        `No incluirá enlaces de afiliación ni publicidad de operadores de juego (casas de apuestas), ni promocionará operadores no autorizados. La publicidad de juego está estrictamente regulada y su incumplimiento conllevará la retirada del contenido y, en su caso, la cancelación de la cuenta.`,
        `No publicará contenido falso, engañoso, difamatorio, ni que induzca a comportamientos de juego problemático.`,
        `Cumplirá la normativa fiscal aplicable a los ingresos que obtenga a través de la Plataforma.`,
      ] },
      { h3: '5. Contenido de pago, pagos y comisiones' },
      { p: `Los pagos por suscripciones y accesos premium se procesan a través de Stripe (Stripe Connect). El tipster recibe el importe directamente en su cuenta de Stripe, y FYB retiene una comisión de servicio (con carácter general, entre el 15% y el 20% según el tipo de cuenta). Los precios se muestran antes de cada compra. Al comprar, el usuario acepta el cargo correspondiente.` },
      { h3: '6. Política de reembolsos' },
      { p: `Dada la naturaleza digital e inmediata del contenido (acceso a información y pronósticos que se consumen al momento), y de conformidad con el artículo 103 del Real Decreto Legislativo 1/2007 (Ley General para la Defensa de los Consumidores y Usuarios), el usuario acepta que el derecho de desistimiento no aplica una vez comenzado el acceso al contenido digital. No obstante, FYB podrá gestionar reembolsos en casos de error de cobro, contenido no entregado o fraude, contactando en ${COMPANY.email}.` },
      { h3: '7. Ausencia de garantías sobre resultados' },
      { note: `Los pronósticos deportivos son opiniones y conllevan riesgo. Ningún track record, rentabilidad ("ROI"), racha o estadística mostrada en la Plataforma garantiza resultados futuros. FYB no asegura que seguir a un tipster produzca beneficio alguno. Cualquier decisión de apostar que el usuario tome fuera de la Plataforma es de su exclusiva responsabilidad.` },
      { h3: '8. Conducta prohibida' },
      { ul: [
        `Usar la Plataforma para actividades ilícitas o fraudulentas.`,
        `Acosar, amenazar, suplantar o difamar a otros usuarios.`,
        `Publicar contenido protegido por derechos de terceros sin autorización.`,
        `Manipular estadísticas, crear cuentas falsas o eludir bloqueos.`,
        `Promocionar operadores de juego o incluir enlaces de afiliación a casas de apuestas.`,
      ] },
      { h3: '9. Propiedad intelectual' },
      { p: `El software, diseño y marca de FYB pertenecen a su titular. El contenido publicado por cada usuario sigue siendo suyo, pero concede a FYB una licencia no exclusiva y gratuita para alojarlo, mostrarlo y distribuirlo dentro de la Plataforma con la finalidad de prestar el servicio.` },
      { h3: '10. Suspensión y cancelación' },
      { p: `FYB puede suspender o cancelar el acceso de un usuario que incumpla estos Términos, sin derecho a indemnización. El usuario puede eliminar su cuenta en cualquier momento desde la configuración.` },
      { h3: '11. Modificaciones' },
      { p: `FYB puede modificar estos Términos para adaptarlos a cambios legales o del servicio. Los cambios sustanciales se comunicarán a través de la Plataforma. El uso continuado tras la publicación implica la aceptación de la nueva versión.` },
      { h3: '12. Legislación y contacto' },
      { p: `Estos Términos se rigen por la legislación española. Para cualquier duda puedes escribir a ${COMPANY.email}.` },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  'privacidad': {
    slug: 'privacidad',
    title: 'Política de Privacidad',
    short: 'Privacidad',
    desc: 'Cómo tratamos tus datos personales conforme al RGPD y la LOPDGDD.',
    blocks: [
      { p: `En FindYourBet ("FYB") nos tomamos en serio la protección de tus datos personales. Esta política explica qué datos tratamos, con qué finalidad y qué derechos tienes, conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica 3/2018 (LOPDGDD).` },
      { h3: '1. Responsable del tratamiento' },
      { ul: [
        `Responsable: ${COMPANY.legalName}`,
        `NIF/CIF: ${COMPANY.taxId}`,
        `Domicilio: ${COMPANY.address}`,
        `Contacto: ${COMPANY.email}`,
      ] },
      { h3: '2. Datos que tratamos' },
      { ul: [
        `Datos de registro: nombre, apellidos, nombre de usuario, correo electrónico, fecha de nacimiento y nacionalidad.`,
        `Datos de perfil: biografía, avatar y contenido que publiques voluntariamente.`,
        `Datos de actividad: pronósticos, mensajes, seguimientos, likes y comentarios.`,
        `Datos de pago: gestionados directamente por Stripe. FYB no almacena los datos completos de tu tarjeta.`,
        `Datos técnicos: dirección IP, tipo de dispositivo y datos de uso necesarios para el funcionamiento y la seguridad.`,
      ] },
      { h3: '3. Finalidades y base jurídica' },
      { ul: [
        `Prestar el servicio y gestionar tu cuenta — base: ejecución del contrato (los Términos que aceptas al registrarte).`,
        `Procesar pagos de suscripciones y accesos premium — base: ejecución del contrato.`,
        `Enviar comunicaciones transaccionales (confirmaciones, accesos comprados) — base: ejecución del contrato.`,
        `Garantizar la seguridad y prevenir el fraude o abusos — base: interés legítimo.`,
        `Cumplir obligaciones legales (fiscales, de moderación) — base: obligación legal.`,
      ] },
      { h3: '4. Destinatarios y encargados del tratamiento' },
      { p: `Para prestar el servicio, compartimos datos con proveedores que actúan como encargados del tratamiento, bajo contrato y garantías adecuadas:` },
      { ul: [
        `Supabase — base de datos y autenticación.`,
        `Stripe — procesamiento de pagos.`,
        `Brevo (Sendinblue) — envío de correos transaccionales.`,
        `Vercel — alojamiento e infraestructura web.`,
      ] },
      { p: `No vendemos tus datos personales a terceros.` },
      { h3: '5. Transferencias internacionales' },
      { p: `Algunos de estos proveedores pueden tratar datos fuera del Espacio Económico Europeo. En tales casos, la transferencia se ampara en las garantías previstas por el RGPD (cláusulas contractuales tipo de la Comisión Europea o decisiones de adecuación).` },
      { h3: '6. Conservación' },
      { p: `Conservamos tus datos mientras mantengas tu cuenta activa. Si la eliminas, suprimiremos o anonimizaremos tus datos, salvo aquellos que debamos conservar por obligación legal (por ejemplo, registros de facturación) durante los plazos legalmente exigidos.` },
      { h3: '7. Tus derechos' },
      { p: `Puedes ejercer en cualquier momento tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, escribiendo a ${COMPANY.email}. También tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es) si consideras que no hemos atendido adecuadamente tu solicitud.` },
      { h3: '8. Seguridad' },
      { p: `Aplicamos medidas técnicas y organizativas para proteger tus datos, incluyendo control de acceso a nivel de fila (RLS) en la base de datos, cifrado en tránsito y minimización de datos. Ningún sistema es infalible, pero trabajamos para reducir los riesgos.` },
      { h3: '9. Menores de edad' },
      { p: `FYB está dirigido exclusivamente a mayores de 18 años. No recogemos conscientemente datos de menores. Si detectamos una cuenta de un menor, la eliminaremos.` },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  'cookies': {
    slug: 'cookies',
    title: 'Política de Cookies',
    short: 'Cookies',
    desc: 'Qué cookies y tecnologías de almacenamiento utiliza FindYourBet.',
    blocks: [
      { p: `Esta política explica qué cookies y tecnologías de almacenamiento local utiliza FindYourBet ("FYB") y con qué finalidad, conforme al artículo 22.2 de la LSSI-CE.` },
      { h3: '1. ¿Qué son las cookies?' },
      { p: `Las cookies y tecnologías similares (como el almacenamiento local del navegador) son pequeños archivos de datos que se guardan en tu dispositivo cuando visitas un sitio web, y que permiten recordar información sobre tu sesión y preferencias.` },
      { h3: '2. Cookies que utilizamos' },
      { p: `FYB utiliza únicamente cookies y almacenamiento técnicos y necesarios para el funcionamiento del servicio. No utilizamos cookies publicitarias ni de perfilado con fines comerciales.` },
      { ul: [
        `Autenticación (Supabase): mantienen tu sesión iniciada de forma segura. Son imprescindibles.`,
        `Preferencias (almacenamiento local): recuerdan ajustes como el acceso beta, carpetas de chats, o "no volver a preguntar". Mejoran tu experiencia.`,
      ] },
      { h3: '3. Cookies de terceros' },
      { p: `Al realizar un pago, Stripe puede establecer cookies propias necesarias para procesar la transacción y prevenir el fraude. Estas cookies se rigen por la política de privacidad de Stripe.` },
      { h3: '4. Gestión de cookies' },
      { p: `Puedes bloquear o eliminar las cookies desde la configuración de tu navegador. Ten en cuenta que, al ser cookies técnicas necesarias, si las desactivas es posible que no puedas iniciar sesión ni utilizar determinadas funciones de la Plataforma.` },
      { h3: '5. Actualizaciones' },
      { p: `Podemos actualizar esta política si incorporamos nuevas tecnologías. Cualquier cambio se reflejará en esta misma página.` },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  'juego-responsable': {
    slug: 'juego-responsable',
    title: 'Juego Responsable',
    short: 'Juego Responsable',
    desc: 'Información y recursos de ayuda. Los pronósticos conllevan riesgo.',
    blocks: [
      { note: `FindYourBet es una plataforma de información y pronósticos deportivos. NO es una casa de apuestas y no se apuesta dentro de la Plataforma. La decisión de apostar, si la tomas, la realizas fuera de FYB, en operadores de juego regulados, y bajo tu exclusiva responsabilidad.` },
      { h3: '1. Los pronósticos conllevan riesgo' },
      { p: `Ningún pronóstico garantiza ganancias. Las estadísticas, rachas y rentabilidades ("ROI") mostradas reflejan resultados pasados y no predicen resultados futuros. Apostar puede conllevar la pérdida del dinero apostado. Nunca apuestes dinero que no puedas permitirte perder.` },
      { h3: '2. Consejos de juego responsable' },
      { ul: [
        `Establece límites de tiempo y de dinero antes de empezar, y respétalos.`,
        `No apuestes para recuperar pérdidas ni bajo estados emocionales alterados.`,
        `El juego no es una fuente de ingresos: trátalo como entretenimiento.`,
        `Si sientes que pierdes el control, busca ayuda cuanto antes.`,
      ] },
      { h3: '3. ¿Necesitas ayuda? (España)' },
      { p: `Si crees que tú o alguien cercano puede tener un problema con el juego, existen recursos gratuitos y confidenciales:` },
      { ul: [
        `Línea de atención al jugador — 900 200 225 (gratuita y confidencial).`,
        `FEJAR — Federación Española de Jugadores de Azar Rehabilitados: www.fejar.org`,
        `Registro General de Interdicciones de Acceso al Juego (RGIAJ): permite autoprohibirte el acceso al juego online y presencial regulado en España. Solicítalo en ordenacionjuego.es`,
        `Juego Responsable (DGOJ): www.jugarbien.es`,
      ] },
      { h3: '4. Protección de menores' },
      { p: `El acceso a FYB está reservado a mayores de 18 años. El juego está prohibido a menores de edad. Si eres tutor, existen herramientas de control parental para restringir el acceso a este tipo de contenidos.` },
    ],
  },
}
