# Ilo Club

Статический сайт на Hugo. Без темы, без npm, без внешних зависимостей.

## Требования

Hugo extended 0.146 или новее. Проверить: `hugo version`.

## Команды

```bash
hugo server -D        # локальная разработка с черновиками
hugo new content posts/nazvanie.md
hugo                  # сборка в public/
hugo --minify         # сборка с минификацией HTML
```

## Структура

```text
content/            Markdown-контент
  _index.md         главная
  about.md          отдельная страница
  posts/            раздел «Заметки»
layouts/
  _default/         baseof, single, list
  partials/         head, header, footer, card, pagination
  home.html          главная
  404.html
assets/css/main.css стили (обрабатываются Hugo Pipes: minify + fingerprint)
static/             файлы как есть
hugo.toml           конфигурация
```

## Что менять в первую очередь

- `hugo.toml`: `baseURL`, `title`, `params.social`, меню.
- `layouts/partials/head.html`: метатеги, OG.
- `assets/css/main.css`: токены в `:root` — цвета, шрифты, ширина колонки.
