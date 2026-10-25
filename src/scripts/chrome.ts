/** Abschnittszähler, Punktnavigation und Sprachwechsel mit Anker. */
export function initChrome(): void {
  const sections = [...document.querySelectorAll<HTMLElement>('section[data-index]')];
  const indexEl = document.querySelector('[data-counter-index]');
  const labelEl = document.querySelector('[data-counter-label]');
  const dots = [...document.querySelectorAll<HTMLAnchorElement>('.dotnav a')];

  let activeId = '';
  const activate = (section: HTMLElement) => {
    activeId = section.id;
    if (indexEl) indexEl.textContent = section.dataset.index ?? '';
    if (labelEl) labelEl.textContent = section.dataset.label ?? '';
    for (const dot of dots) {
      if (dot.hash === `#${section.id}`) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) if (entry.isIntersecting) activate(entry.target as HTMLElement);
    },
    { rootMargin: '-50% 0px -50% 0px' },
  );
  sections.forEach((s) => observer.observe(s));

  for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-lang-switch], .footer a[hreflang]')) {
    link.addEventListener('click', () => {
      if (activeId && activeId !== 'start') link.hash = `#${activeId}`;
      else if (location.hash) link.hash = location.hash;
    });
  }
}
