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
  const stage = root.querySelector<HTMLElement>('.site-lightbox-stage');
  const image = root.querySelector<HTMLImageElement>('[data-lightbox-image]');
  const closeButton = root.querySelector<HTMLButtonElement>('[data-lightbox-close]');
  const prevButton = root.querySelector<HTMLButtonElement>('[data-lightbox-prev]');
  const nextButton = root.querySelector<HTMLButtonElement>('[data-lightbox-next]');
  const zoomButton = root.querySelector<HTMLButtonElement>('[data-lightbox-zoom]');
  const zoomLabel = root.querySelector<HTMLElement>('[data-lightbox-zoom-label]');
  const number = root.querySelector<HTMLElement>('[data-lightbox-no]');
  const title = root.querySelector<HTMLElement>('[data-lightbox-title]');
  const count = root.querySelector<HTMLElement>('[data-lightbox-count]');
  if (!stage || !image || !closeButton || !prevButton || !nextButton || !zoomButton || !zoomLabel || !number || !title || !count) return;

  const digits = Number(root.dataset.figureDigits || 3);
  let items: LightboxItem[] = [];
  let index = 0;
  let activeTrigger: HTMLElement | null = null;

  // ===== 缩放：FIT ⇄ 1:1 两态 + 滚轮/捏合连续缩放 + 放大后拖拽平移 =====
  const MIN_SCALE = 1;
  let scale = MIN_SCALE;
  let panX = 0;
  let panY = 0;

  // 图按 contain 收进舞台后的宽度与自然像素之比，就是「1:1」需要的倍数；
  // 图本来就小于舞台时返回 1（没有可放大的东西，按钮置灰）
  const maxScale = () => (image.clientWidth > 0 ? Math.max(MIN_SCALE, image.naturalWidth / image.clientWidth) : MIN_SCALE);

  const applyTransform = () => {
    const moved = scale > MIN_SCALE || panX !== 0 || panY !== 0;
    // 动态变换值：走 inline style（静态值一律在组件 CSS 里）
    image.style.transform = moved ? `translate(${panX}px, ${panY}px) scale(${scale})` : '';
    root.classList.toggle('is-zoomed', scale > MIN_SCALE);
  };

  const syncZoomButton = () => {
    // 放大不到 20% 不值得一个键（1:1 与 FIT 几乎看不出差别），置灰
    zoomButton.disabled = maxScale() < 1.2;
    zoomButton.setAttribute('aria-pressed', String(scale > MIN_SCALE));
    zoomLabel.textContent = (scale > MIN_SCALE ? zoomButton.dataset.labelActual : zoomButton.dataset.labelFit) ?? '';
  };

  // 平移边界：放大后的图不许被拖出视野（图比舞台小的方向不允许平移）
  // 用 border-box 尺寸：边框也跟着缩放，它是看图时真实的可见边缘
  const clampPan = () => {
    const view = stage.getBoundingClientRect();
    const limitX = Math.max(0, (image.offsetWidth * scale - view.width) / 2);
    const limitY = Math.max(0, (image.offsetHeight * scale - view.height) / 2);
    panX = Math.min(limitX, Math.max(-limitX, panX));
    panY = Math.min(limitY, Math.max(-limitY, panY));
  };

  const resetZoom = () => {
    scale = MIN_SCALE;
    panX = 0;
    panY = 0;
    applyTransform();
    syncZoomButton();
  };

  // 以某个视口坐标为锚缩放：该点下的图内容保持不动（按钮 / 滚轮 / 捏合 / 双击共用一条路径）
  const zoomAt = (next: number, clientX: number, clientY: number) => {
    const target = Math.min(Math.max(next, MIN_SCALE), maxScale());
    if (Math.abs(target - scale) < 0.001) return;
    const box = image.getBoundingClientRect();
    // 变换后的矩形中心已知，减去当前平移即未变换的中心（缩放不改中心）
    const offsetX = clientX - (box.left + box.width / 2 - panX);
    const offsetY = clientY - (box.top + box.height / 2 - panY);
    const ratio = target / scale;
    panX = offsetX * (1 - ratio) + ratio * panX;
    panY = offsetY * (1 - ratio) + ratio * panY;
    scale = target;
    clampPan();
    applyTransform();
    syncZoomButton();
  };

  const toggleZoom = (clientX: number, clientY: number) => {
    if (zoomButton.disabled) return;
    if (scale > MIN_SCALE) resetZoom();
    else zoomAt(maxScale(), clientX, clientY);
  };

  image.addEventListener('load', syncZoomButton);
  image.addEventListener('dblclick', (event) => {
    if (!root.hidden) toggleZoom(event.clientX, event.clientY);
  });
  zoomButton.addEventListener('click', () => {
    const box = image.getBoundingClientRect();
    toggleZoom(box.left + box.width / 2, box.top + box.height / 2);
  });
  stage.addEventListener(
    'wheel',
    (event) => {
      if (root.hidden || event.deltaY === 0) return;
      event.preventDefault();
      zoomAt(scale * Math.exp(-event.deltaY * 0.0015), event.clientX, event.clientY);
    },
    { passive: false },
  );

  // 指针：单指拖拽平移，双指捏合缩放（双指中点即锚点，所以捏合同时也能平移）
  const pointers = new Map<number, { x: number; y: number }>();
  let pinchDistance = 0;

  const pinch = () => {
    const [a, b] = [...pointers.values()];
    return { distance: Math.hypot(a.x - b.x, a.y - b.y), mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
  };

  image.addEventListener('pointerdown', (event) => {
    if (root.hidden) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    // 捕获让拖拽在指针离开图之后仍收得到 move；指针已失效时浏览器会抛 NotFoundError，
    // 这不该带走整段手势（后续 move 仍能从图上冒回来）
    try {
      image.setPointerCapture(event.pointerId);
    } catch {
      /* 无捕获继续 */
    }
    if (pointers.size === 1 && scale > MIN_SCALE) root.classList.add('is-dragging');
    if (pointers.size === 2) pinchDistance = pinch().distance;
  });

  image.addEventListener('pointermove', (event) => {
    const previous = pointers.get(event.pointerId);
    if (!previous || root.hidden) return;
    if (pointers.size >= 2) {
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const { distance, mid } = pinch();
      if (pinchDistance > 0 && distance > 0) zoomAt(scale * (distance / pinchDistance), mid.x, mid.y);
      pinchDistance = distance;
      return;
    }
    if (scale > MIN_SCALE) {
      panX += event.clientX - previous.x;
      panY += event.clientY - previous.y;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      clampPan();
      applyTransform();
    }
  });

  const releasePointer = (event: PointerEvent) => {
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinchDistance = 0;
    if (pointers.size === 0) root.classList.remove('is-dragging');
  };
  image.addEventListener('pointerup', releasePointer);
  image.addEventListener('pointercancel', releasePointer);

  const render = () => {
    const item = items[index];
    if (!item) return;
    image.classList.remove('is-broken');
    // 同 URL 不重设 src：避免重复加载（动态图重播/闪烁）
    if (image.src !== item.src) image.src = item.src;
    image.alt = item.alt;
    number.textContent = `FIG.${String(index + 1).padStart(digits, '0')}`;
    title.textContent = item.title;
    title.hidden = item.title === '';
    count.textContent = `${index + 1} / ${items.length}`;
    const single = items.length <= 1;
    prevButton.hidden = single;
    nextButton.hidden = single;
    // 换图必须归位：否则下一张会继承上一张的缩放与位移
    resetZoom();
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
    // 取消失藏后尺寸才可测（缓存的图不会再触发 load，这里必须自己同步一次）
    syncZoomButton();
    document.body.classList.add('lightbox-open');
    closeButton.focus({ preventScroll: true });
  };

  const close = () => {
    root.hidden = true;
    document.body.classList.remove('lightbox-open');
    // 不删 src：保留已加载图，再次打开同图不重载（动态图不重播、不闪）
    activeTrigger?.removeAttribute('aria-expanded');
    activeTrigger?.focus({ preventScroll: true });
    activeTrigger = null;
  };

  const step = (delta: number) => {
    if (items.length <= 1) return;
    index = (index + delta + items.length) % items.length;
    render();
  };

  const focusableButtons = () => [closeButton, prevButton, zoomButton, nextButton].filter((button) => !button.hidden && !button.disabled);

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
