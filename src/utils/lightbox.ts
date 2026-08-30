// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

interface LightboxItem {
  trigger: HTMLElement;
  image: HTMLImageElement;
  src: string;
  alt: string;
  title: string;
}

function triggerImage(trigger: HTMLElement): HTMLImageElement | null {
  return trigger instanceof HTMLImageElement ? trigger : trigger.querySelector<HTMLImageElement>('img');
}

function collectItems(group: string): LightboxItem[] {
  return [...document.querySelectorAll<HTMLElement>('[data-lightbox-trigger]')]
    .filter((trigger) => (trigger.dataset.lightboxGroup || 'default') === group)
    .map((trigger) => {
      const image = triggerImage(trigger);
      if (!image) return null;
      return {
        trigger,
        image,
        src: trigger.dataset.lightboxSrc || image.currentSrc || image.src,
        alt: image.alt,
        title: trigger.dataset.lightboxTitle || '',
      };
    })
    .filter((item): item is LightboxItem => item !== null && item.src !== '');
}

function enhanceTriggers() {
  document.querySelectorAll<HTMLElement>('[data-lightbox-trigger]').forEach((trigger) => {
    if (!(trigger instanceof HTMLButtonElement) && !(trigger instanceof HTMLAnchorElement)) {
      trigger.tabIndex = 0;
      trigger.setAttribute('role', 'button');
      trigger.setAttribute('aria-haspopup', 'dialog');
    }
  });
}

export function setupLightbox(root: HTMLElement): void {
  const image = root.querySelector<HTMLImageElement>('[data-lightbox-image]');
  const closeButton = root.querySelector<HTMLButtonElement>('[data-lightbox-close]');
  const prevButton = root.querySelector<HTMLButtonElement>('[data-lightbox-prev]');
  const nextButton = root.querySelector<HTMLButtonElement>('[data-lightbox-next]');
  const number = root.querySelector<HTMLElement>('[data-lightbox-no]');
  const title = root.querySelector<HTMLElement>('[data-lightbox-title]');
  const count = root.querySelector<HTMLElement>('[data-lightbox-count]');
  if (!image || !closeButton || !prevButton || !nextButton || !number || !title || !count) return;

  const digits = Number(root.dataset.figureDigits || 3);
  let items: LightboxItem[] = [];
  let index = 0;
  let activeTrigger: HTMLElement | null = null;

  const render = () => {
    const item = items[index];
    if (!item) return;
    image.classList.remove('is-broken');
    image.src = item.src;
    image.alt = item.alt;
    number.textContent = `FIG.${String(index + 1).padStart(digits, '0')}`;
    title.textContent = item.title;
    title.hidden = item.title === '';
    count.textContent = `${index + 1} / ${items.length}`;
    const single = items.length <= 1;
    prevButton.hidden = single;
    nextButton.hidden = single;
  };

  const open = (trigger: HTMLElement) => {
    const group = trigger.dataset.lightboxGroup || 'default';
    const nextItems = collectItems(group);
    const nextIndex = nextItems.findIndex((item) => item.trigger === trigger);
    if (nextIndex < 0) return;
    items = nextItems;
    index = nextIndex;
    activeTrigger = trigger;
    activeTrigger.setAttribute('aria-expanded', 'true');
    render();
    root.hidden = false;
    document.body.classList.add('lightbox-open');
    closeButton.focus({ preventScroll: true });
  };

  const close = () => {
    root.hidden = true;
    document.body.classList.remove('lightbox-open');
    image.removeAttribute('src');
    activeTrigger?.removeAttribute('aria-expanded');
    activeTrigger?.focus({ preventScroll: true });
    activeTrigger = null;
  };

  const step = (delta: number) => {
    if (items.length <= 1) return;
    index = (index + delta + items.length) % items.length;
    render();
  };

  const focusableButtons = () => [closeButton, prevButton, nextButton].filter((button) => !button.hidden);

  enhanceTriggers();
  new MutationObserver(enhanceTriggers).observe(document.body, { childList: true, subtree: true });

  closeButton.addEventListener('click', close);
  prevButton.addEventListener('click', () => step(-1));
  nextButton.addEventListener('click', () => step(1));
  root.addEventListener('click', (event) => {
    if (event.target === root) close();
  });
  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-lightbox-trigger]') : null;
    if (target) open(target);
  });
  document.addEventListener('keydown', (event) => {
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-lightbox-trigger]') : null;
    if (target && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      open(target);
      return;
    }
    if (root.hidden) return;
    if (event.key === 'Escape') close();
    else if (event.key === 'ArrowLeft') step(-1);
    else if (event.key === 'ArrowRight') step(1);
    else if (event.key === 'Tab') {
      const buttons = focusableButtons();
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  });
}
