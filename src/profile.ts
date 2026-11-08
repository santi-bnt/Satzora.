export function profileText(value: unknown, language = 'es') {
  const name = typeof value === 'string' ? value.trim() : '';
  const english = language.toLowerCase().split(/[-_]/)[0] === 'en';
  return {
    name,
    greeting: name ? (english ? `Hello, ${name}!` : `¡Hola, ${name}!`) : (english ? 'Hello!' : '¡Hola!'),
    label: name || (english ? 'My profile' : 'Mi perfil'),
    initial: name ? Array.from(name)[0].toLocaleUpperCase(english ? 'en' : 'es') : '',
  };
}

// The page language is authoritative; browser language is only a fallback.
export function profileLanguage(pageLanguage?: string, browserLanguage?: string) {
  return pageLanguage?.trim() || browserLanguage?.trim() || 'es';
}
