# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Hugo-based website for **FC Aich e.V.**, a German football club in Landkreis Fürstenfeldbruck. The site uses the Ananke theme with custom layouts and German content.
The original and still productive Webpage can be found at https://www.fc-aich.de. The production Page is based on Wordpress and was hacked. The hacker or bot created a lot of news pages about gambling an casinos. The goal of this project is to migrate the Wordpress based page to a Hugo page, hosted on Github pages and deployed by Github actions. To create news articles and Spielberichte Sveltia CMS (https://github.com/sveltia/sveltia-cms) was integrated.

**Live URL**: https://fc-aich.engelmann.me/

## Development Commands

### Local Development
```bash
# Start local development server (default: http://localhost:1313)
hugo server

# Start with drafts visible
hugo server -D

# Build site for production
hugo

# Clean build cache
hugo --gc
```

### Build Output
- Production builds go to `public/` directory
- Git ignores `public/` (use for local testing)

## Site Architecture

### Content Organization

The site is structured around different sections:

- **content/herren1/**, **content/damen1/**, **content/jugend/**, **content/ah/** - Team pages with BFV widgets
- **content/spielberichte/** - Match reports with special metadata (opponent, score, competition)
- **content/news/** - General news articles (some imported from old WordPress site)
- **content/sponsoren/**, **content/vorstand/**, **content/sportgelaende/** - Static informational pages

### Custom Layouts & Shortcodes

**Custom Spielberichte Layout** (`layouts/spielberichte/single.html`):
- Uses `match-meta.html` partial to display match metadata in a card format
- Automatically renders galleries from front matter without requiring shortcode

**Match Metadata Partial** (`layouts/partials/match-meta.html`):
- Renders team names, opponent, score, competition, date
- Shows featured image if present
- Styled via `.match-card`, `.match-teams`, `.match-score` classes in custom.css

**Gallery Implementations**:
- **Shortcode** (`layouts/shortcodes/gallery.html`) - Use `{{< gallery >}}` in markdown
- **Partial** (`layouts/partials/gallery-from-params.html`) - Auto-renders in spielberichte layout
- Both support two formats:
  ```yaml
  gallery:
    - /uploads/pic1.jpg
    - /uploads/pic2.jpg
  # OR with captions:
  gallery:
    - image: /uploads/pic1.jpg
      caption: "Jubel"
  ```

### Match Report Front Matter

Example front matter for spielberichte:
```yaml
---
title: Topspiel Damen 1
date: 2025-11-05T18:40:00
team: 1. Mannschaft
opponent: FC Landsberied
competition: A Klasse
score: 8:1
gallery:
  - /uploads/em-frauen-2025-italien-spanien.jpg
---
```

### Custom Styling

- Custom CSS: `assets/ananke/css/custom.css`
- Loaded via `custom_css = ["custom.css"]` in config.toml
- Includes:
  - Gallery grid layout (responsive, auto-fill columns)
  - Match card styling (teams, score, metadata chips)
  - Hover effects for sponsor logos (`.fc-hover-gray`)
  - Header cover image styling
  - Dark mode support via `@media (prefers-color-scheme: dark)`

### Static Assets

- **static/img/** - Club logos, team photos
- **static/uploads/** - User-uploaded images (match photos, news images)
- **static/downloads/** - PDFs, documents for download
- **static/wp-content/** - Assets from old WordPress site

### BFV Widget Integration

Team pages embed Bayerischer Fußball-Verband (BFV) widgets for match schedules. Example in [content/herren1/_index.md](content/herren1/_index.md#L14-L18):
```html
<script type="text/javascript" src="https://widget-prod.bfv.de/widget/widgetresource/widgetjs"></script>
<div id="bfv1631688311537">Laden...</div>
<script>
BFVWidget.HTML5.zeigeMannschaftKomplett("016PBJFEVS000000VV0AG811VTE5EA5R", ...);
</script>
```

Note: `unsafe = true` in config.toml allows raw HTML in markdown.

## Configuration

Main config: `config.toml`
- German language (`de-de`)
- Main navigation menu defined in `[[menu.main]]` sections
- Params include club contact info, logo, custom CSS

## Important Notes

- **Language**: All content is in German
- **Date Format**: DD.MM.YYYY (`date_format = "02.01.2006"`)
- **Timezone**: Europe/Berlin
- **Theme**: Ananke (in `themes/ananke/`)
- **Hugo Version**: v0.152.2+extended (installed via snap)
