---
title: "Первый пост: как устроен этот сайт"
date: 2026-11-12
description: "Собираем статический сайт на Hugo без темы и внешних зависимостей."
tags: ["hugo", "статика"]
---

Сайт собран на Hugo и не тянет ни одного npm-пакета. HTML-шаблоны лежат в
`layouts/`, стили — в `assets/css/main.css`, и Hugo минифицирует их при сборке.

## Структура

```text
content/    тексты в Markdown
layouts/    HTML-шаблоны
assets/     CSS и другие ресурсы, которые обрабатывает Hugo
static/     файлы как есть: картинки, favicon, robots.txt
```

## Как добавить материал

```bash
hugo new content posts/nazvanie.md
hugo server -D
```

Черновики видны только с флагом `-D`. Публикация — просто `hugo`, результат в
`public/`.
