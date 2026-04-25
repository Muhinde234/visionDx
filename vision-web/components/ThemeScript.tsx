/**
 * Injected as a blocking script in <head> before React hydration.
 * Reads localStorage and sets .dark on <html> to prevent white flash.
 */
export function ThemeScript() {
  const script = `
(function(){
  try {
    var t = localStorage.getItem('visiondx_theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch(e) {}
})();
  `.trim();

  return (
    // eslint-disable-next-line react/no-danger
    <script dangerouslySetInnerHTML={{ __html: script }} />
  );
}
