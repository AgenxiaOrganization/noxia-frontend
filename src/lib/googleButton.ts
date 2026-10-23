/**
 * Dessine le bouton Google à la largeur de son conteneur. L'API Google n'accepte qu'une largeur
 * en pixels, entre 200 et 400 : « 100% » est ignoré et le bouton reprend sa largeur minimale.
 */
export function renderGoogleButton(element: HTMLElement | null, text: 'signin_with' | 'signup_with') {
  if (!element || !window.google) return
  const width = Math.round(Math.min(400, Math.max(200, element.clientWidth)))
  element.innerHTML = ''
  window.google.accounts.id.renderButton(element, {
    type: 'standard',
    theme: 'filled_dark',
    size: 'large',
    text,
    shape: 'rectangular',
    logo_alignment: 'center',
    width,
  })
}

/** Redessine le bouton quand la largeur de la page change (rotation du téléphone, fenêtre redimensionnée). */
export function watchGoogleButtonWidth(elementId: string, text: 'signin_with' | 'signup_with') {
  let lastWidth = 0
  const onResize = () => {
    const element = document.getElementById(elementId)
    if (!element || element.clientWidth === lastWidth) return
    lastWidth = element.clientWidth
    renderGoogleButton(element, text)
  }
  window.addEventListener('resize', onResize)
  return () => window.removeEventListener('resize', onResize)
}
