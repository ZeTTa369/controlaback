export function generarCodigoDepartamento(params: {
  nombreEdificio?: string | null;
  piso?: number | null;
  numeroDepartamento?: string | null;
  bloque?: string | null;
}): string {
  const nombreLimpio = String(params.nombreEdificio || '')
    .trim()
    .replace(/^(EDIFICIO|CONDOMINIO|TORRE)\s+/i, '');
  const inicialEdificio = nombreLimpio.charAt(0).toUpperCase() || 'X';

  const pisoStr =
    params.piso !== null && params.piso !== undefined && String(params.piso).trim() !== ''
      ? String(params.piso).trim()
      : '1';

  const deptoStr = String(params.numeroDepartamento || '0')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');

  const bloqueLimpio = String(params.bloque || '')
    .trim()
    .toUpperCase()
    .replace(/^BLOQUE\s+/i, '');

  let bloqueStr = 'SB';
  if (bloqueLimpio === 'EXTERIOR' || bloqueLimpio === 'E') {
    bloqueStr = 'E';
  } else if (bloqueLimpio === 'INTERIOR' || bloqueLimpio === 'I') {
    bloqueStr = 'I';
  } else if (
    bloqueLimpio &&
    bloqueLimpio !== 'SIN BLOQUE' &&
    bloqueLimpio !== 'S/B' &&
    bloqueLimpio !== 'NINGUNO'
  ) {
    bloqueStr = bloqueLimpio.charAt(0);
  }

  return `${inicialEdificio}${pisoStr}${deptoStr}${bloqueStr}`;
}