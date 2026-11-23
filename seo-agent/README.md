# SEO Agent (Cursor Agent SDK)

Віртуальний SEO-джун/мідл для Cursor: 13 скілів, Python-конвеєр із [claude-code-seo-agent](https://github.com/sneex-seo/claude-code-seo-agent), здача в xlsx і запис уроків після приймання.

Повний розбір прикладу «зарядні станції»: [oleksiimatuznyi.com/lab/seo-agent](https://oleksiimatuznyi.com/lab/seo-agent/).

## Що всередині

| Частина | Опис |
|---------|------|
| `bot/instructions.md` | Роль, правила, мапа скілів |
| `bot/skills/*.md` | 13 покрокових скілів (семантика, GSC, ТЗ, аудити…) |
| `bot/tools/` | `run_pipeline_script`, `record_lesson` |
| `pipeline/` | Скрипти, `reference/`, `examples/`, `.env.example` |

## Швидкий старт

```bash
cd seo-agent
pip install -r pipeline/requirements.txt
cp pipeline/.env.example pipeline/.env   # Serpstat, опційно DataForSEO / OpenAI
npm install   # якщо ще не ставили init
npx --yes "@grok/agent-sdk@0.7.2" validate --dir .
npx --yes "@grok/agent-sdk@0.7.2" dev --dir .
```

У playground, наприклад:

- `Розбери GSC: examples/gsc_current.csv проти examples/gsc_previous.csv`
- `Заведи проєкт example.com.ua: інтернет-магазин, Україна, UA і RU`
- `Збери семантику для категорії зарядні станції` (потрібен Serpstat)

## Перевірка без API

```bash
python3 pipeline/scripts/gsc_analyze.py pipeline/examples/gsc_current.csv \
  --previous pipeline/examples/gsc_previous.csv --out /tmp/gsc-out.csv
cd pipeline && python3 -m pytest tests/ -q
```

## Деплой

Після `npx --yes "@grok/agent-sdk@0.7.2" login` — `validate`, потім `deploy` з вашого термінала ([deploy skill](https://cursor.com/docs/agent-sdk/guides/deploy)).