function obtenerPrefijoEdificio(nombreEdificio = ''): string {
  const limpio = String(nombreEdificio || '')
    .trim()
    .replace(/^(EDIFICIO|TORRE)\s+/i, '');

  if (!limpio) return 'X';

  const conectores = new Set(['DE', 'DEL', 'LA', 'LAS', 'LOS', 'EL', 'Y']);
  const palabras = limpio
    .split(/\s+/)
    .filter((p) => p && !conectores.has(p.toUpperCase()));

  if (palabras.length === 0) return 'X';

  if (palabras.length === 1) {
    return palabras[0].charAt(0).toUpperCase();
  }

  return palabras.map((p) => p.charAt(0).toUpperCase()).join('');
}

export function generarCodigoDepartamento(params: {
  nombreEdificio?: string | null;
  piso?: number | null;
  numeroDepartamento?: string | null;
  bloque?: string | null;
}): string {
  const prefijoEdificio = obtenerPrefijoEdificio(params.nombreEdificio || '');

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

  return `${prefijoEdificio}${pisoStr}${deptoStr}${bloqueStr}`;
}