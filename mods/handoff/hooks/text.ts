// Pure text helpers of the handoff mod: no `$`, no engine — so they are testable alone.

export type Lang = 'ru' | 'en'

export type Parsed = { slug: string; body: string }

/** YYYY-MM-DD-HHMM in the local time of the hooks environment. */
export function stampOf(ms: number): string {
  const d = new Date(ms)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`
}

/** A safe file-name slug: lowercase ASCII/Cyrillic letters, digits and dashes, at most 40 characters. */
export function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/giu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '')
}

/** The fork's answer: an optional first line `slug: …`, then the document. */
export function parseHandoff(text: string): Parsed {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  let i = 0
  while (i < lines.length && lines[i]!.trim() === '') i++
  const first = lines[i] ?? ''
  const m = /^\s*slug\s*:\s*(.+?)\s*$/i.exec(first)
  if (m) {
    const body = lines.slice(i + 1).join('\n').replace(/^\n+/, '')
    return { slug: slugify(m[1]!), body: body.endsWith('\n') ? body : body + '\n' }
  }
  const body = lines.slice(i).join('\n')
  return { slug: '', body: body.endsWith('\n') ? body : body + '\n' }
}

/** The one user message the fork answers: write the handoff for a fresh session. */
export function handoffPrompt(lang: Lang, stamp: string, dir: string): string {
  if (lang === 'en') {
    return [
      'Write the HANDOFF of this session for a fresh session that has none of this context. Answer with text only, do not call tools.',
      `The file will be saved as ${dir}/handoff-${stamp}-<slug>.md. First line of your answer: \`slug: <2-4 kebab-case words naming the topic>\`. Then the document:`,
      `# Handoff ${stamp} — <topic>`,
      'One line: "For a fresh session. Files are the truth, this file is the map. Read first: <up to 3 files with paths>."',
      '## 1. Done in this session — facts with paths, commits, numbers, exit codes; no narration.',
      '## 2. Decisions and rulings — numbered, each with its reason; what the operator said verbatim where it matters.',
      '## 3. Next — the critical path in order, exact commands or files; who does each step (operator / team lead / executor).',
      '## 4. Open — questions waiting on the operator, risks, anything not finished, with the exact state it was left in.',
      '## 5. Fresh-session line — one line the person pastes as the first message of a brand-new process.',
      'Rules: under 120 lines; facts over prose; every claim traceable to a file or a command; never invent a result you did not see; secrets never written.',
    ].join('\n')
  }
  return [
    'Напиши ХЕНДОФФ этой сессии для свежей сессии, у которой нет этого контекста. Отвечай только текстом, инструменты не вызывай.',
    `Файл будет сохранён как ${dir}/handoff-${stamp}-<slug>.md. Первая строка ответа: \`slug: <2–4 слова латиницей через дефис — тема>\`. Дальше документ:`,
    `# Хендофф ${stamp} — <тема>`,
    'Одна строка: «Для свежей сессии. Файлы — правда, этот файл — карта. Читать: <до 3 файлов с путями>».',
    '## 1. Что сделано в этой сессии — факты с путями, коммитами, числами, кодами выхода; без пересказа.',
    '## 2. Решения и рулинги — нумерованно, у каждого причина; слова оператора дословно там, где это важно.',
    '## 3. Следующее — критический путь по порядку, точные команды или файлы; кто делает шаг (оператор / тимлид / исполнитель).',
    '## 4. Открыто — вопросы к оператору, риски, незаконченное — с точным состоянием, в котором оставлено.',
    '## 5. Строка свежей сессии — одна строка, которую человек вставляет первым сообщением нового процесса.',
    'Правила: до 120 строк; факты, не проза; каждое утверждение прослеживается до файла или команды; не выдумывать результат, которого не видел; секреты не писать.',
  ].join('\n')
}

/** The prompt submitted after /clear: read the handoff and continue. */
export function resumePrompt(lang: Lang, relPath: string): string {
  return lang === 'en'
    ? `Fresh context after a handoff. Read ${relPath} in full, then continue from its section "3. Next" — start with the first step; ask only if section 4 blocks it.`
    : `Свежий контекст после хендоффа. Прочитай ${relPath} целиком и продолжай с раздела «3. Следующее» — начни с первого шага; спрашивай только если раздел 4 его блокирует.`
}
