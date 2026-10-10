// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

// 数据统计工具层：脚本拼装与事件接口
// config 只放数据与开关，所有脚本/事件逻辑下沉在此。
import type { GoogleAnalyticsConfig, MicrosoftClarityConfig, UmamiConfig } from '@t/analytics';

/** 生成 Microsoft Clarity 初始化脚本 */
export function clarityScript(config: MicrosoftClarityConfig): string {
  if (!config.enabled || !config.id) return '';
  return [
    `<script type="text/javascript">`,
    `  (function(c,l,a,r,i,t,y){`,
    `    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};`,
    `    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;`,
    `    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);`,
    `  })(window, document, "clarity", "script", "${config.id}");`,
    `</script>`,
  ].join('\n');
}

/** 生成 GA4 gtag 初始化脚本 */
export function gaScript(config: GoogleAnalyticsConfig): string {
  if (!config.enabled || !config.id) return '';
  return [
    `<script async src="https://www.googletagmanager.com/gtag/js?id=${config.id}"></script>`,
    `<script>`,
    `  window.dataLayer = window.dataLayer || [];`,
    `  function gtag(){dataLayer.push(arguments);}`,
    `  gtag('js', new Date());`,
    `  gtag('config', '${config.id}');`,
    `</script>`,
  ].join('\n');
}

/**
 * 会话回放标签：recorder.js 是与 tracker **并列**的独立脚本（官方文档：in addition to your
 * existing tracker script）。它只读 `data-website-id` / `data-host-url`，**不采集 pageview、
 * 自定义事件、性能，也不暴露 `window.umami`** —— 所以绝不能用它替换 tracker。
 * 它同样不认 `data-domains`，所以域名约束只能在注入前自行判断，否则开发/预览环境会被录制。
 */
function recorderTag(config: UmamiConfig): string {
  const replay = config.sessionReplay;
  if (!replay?.enabled || !replay.recorderUrl) return '';

  const lines = [`<script is:inline>`, `  (function () {`];
  const domains = config.domains ?? [];
  if (domains.length > 0) {
    lines.push(`    if (${JSON.stringify(domains)}.indexOf(location.hostname) === -1) return;`);
  }
  lines.push(
    `    var s = document.createElement('script');`,
    `    s.defer = true;`,
    `    s.src = ${JSON.stringify(replay.recorderUrl)};`,
    `    s.setAttribute('data-website-id', ${JSON.stringify(config.websiteId)});`,
  );
  if (config.hostUrl) {
    lines.push(`    s.setAttribute('data-host-url', ${JSON.stringify(config.hostUrl)});`);
  }
  lines.push(`    document.head.appendChild(s);`, `  })();`, `</script>`);
  return lines.join('\n');
}

/** 生成 Umami tracker script 标签（含会话回放时的 recorder 标签） */
export function umamiScript(config: UmamiConfig): string {
  if (!config.enabled || !config.websiteId) return '';

  const src = config.scriptUrl;
  if (!src) return '';

  const attrs: Record<string, string> = {
    'defer': '',
    'src': src,
    'data-website-id': config.websiteId,
  };

  if (config.hostUrl) attrs['data-host-url'] = config.hostUrl;
  if (config.autoTrack === false) attrs['data-auto-track'] = 'false';
  if (config.domains && config.domains.length > 0) attrs['data-domains'] = config.domains.join(',');
  if (config.tag) attrs['data-tag'] = config.tag;
  if (config.collectWebVitals) attrs['data-performance'] = 'true';

  const attrStr = Object.entries(attrs)
    .map(([key, value]) => (value === '' ? key : `${key}="${value}"`))
    .join(' ');

  return [`<script ${attrStr}></script>`, recorderTag(config)].filter(Boolean).join('\n');
}

/**
 * 生成 data-umami-event-* 属性对象，供 Astro 组件 spread 使用。
 * Umami 会自动收集带 data-umami-event 的元素的点击事件。
 */
export function umamiEvent(
  event: string,
  data?: Record<string, string | number | boolean>
): Record<string, string> {
  const attrs: Record<string, string> = { 'data-umami-event': event };
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      attrs[`data-umami-event-${key}`] = String(value);
    });
  }
  return attrs;
}

/** 全局 trackEvent 脚本：同时向 GA 和 Umami 发送自定义事件 */
export function trackEventBridge(): string {
  return [
    `<script is:inline>`,
    `  window.trackEvent = function(name, data) {`,
    `    data = data || {};`,
    `    if (typeof window.gtag === 'function') {`,
    `      window.gtag('event', name, data);`,
    `    }`,
    `    if (typeof window.umami === 'object' && typeof window.umami.track === 'function') {`,
    `      window.umami.track(name, data);`,
    `    }`,
    `  };`,
    `</script>`,
  ].join('\n');
}

/**
 * 监听带 data-umami-event 的元素点击，并自动转发给 GA。
 * Umami 自身会自动收集这些点击；此脚本补全 GA4 的自定义事件上报。
 */
export function umamiToGaBridge(): string {
  return [
    `<script is:inline>`,
    `  document.addEventListener('click', function (e) {`,
    `    var el = e.target.closest('[data-umami-event]');`,
    `    if (!el) return;`,
    `    var eventName = el.getAttribute('data-umami-event');`,
    `    if (!eventName) return;`,
    `    var data = {};`,
    `    el.getAttributeNames().forEach(function (name) {`,
    `      if (name.indexOf('data-umami-event-') === 0) {`,
    `        var key = name.replace('data-umami-event-', '');`,
    `        data[key] = el.getAttribute(name);`,
    `      }`,
    `    });`,
    `    if (typeof window.gtag === 'function') {`,
    `      window.gtag('event', eventName, data);`,
    `    }`,
    `  });`,
    `</script>`,
  ].join('\n');
}
