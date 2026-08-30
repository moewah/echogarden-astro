// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

import { zh } from './zh';

// 后期新增语言：在 messages 中注册对应语言文件，并扩展 Locale。
// 语言文件须满足 I18nMessages 类型，保证 key 齐全。
const messages = { zh } as const;

export type Locale = keyof typeof messages;
export type I18nMessages = typeof zh;

const current: Locale = 'zh';
export const i18n: I18nMessages = messages[current];
