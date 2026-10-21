/**
 * The browser-facing view of `/sitemap.xml` — the workspace's sitemap XSLT
 * template, with the brand line and the visible copy in Azerbaijani (the site's
 * default language) and the language counters/filters extended from three to
 * the site's six. Presentation only: the sitemap's bytes, URLs, hreflang
 * annotations and dates do not depend on it, and when a browser drops XSLT the
 * file simply shows as the raw XML it always was.
 */
export const SITEMAP_XSL = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  TEMPLATE — browser-facing presentation for /sitemap.xml.

  Copy into the project (Next.js: \`public/sitemap.xsl\`; Laravel: \`public/sitemap.xsl\`)
  and attach it from the sitemap's prologue:

      <?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>

  Two things are per-project and are meant to be edited: the brand name in <h1>,
  and the visible copy, which belongs in the site's default locale. Everything
  else — the host line, the counts, the language chips — is read from the sitemap
  itself and needs no editing.

  A sitemap is XML, and a browser shows XML as a wall of markup. This stylesheet
  is read by the browser only: it is attached with an <?xml-stylesheet?>
  processing instruction, which crawlers ignore — the bytes Google parses are
  the same with or without it. Nothing here changes the sitemap's structure, its
  URLs, its hreflang annotations or its lastmod values.

  XSLT 1.0 on purpose: that is the only version browsers implement. If a browser
  drops XSLT support entirely (Chrome has announced it intends to), the file
  degrades to the raw XML it always was, and nothing about indexation changes.
-->
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <xsl:output method="html" encoding="UTF-8" indent="no" doctype-system="about:legacy-compat"/>

  <xsl:template match="/">
    <html lang="az">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <!-- The rendered view is a convenience, never a page to index. -->
        <meta name="robots" content="noindex, nofollow"/>
        <title>sitemap.xml</title>
        <style>
          :root {
            color-scheme: light dark;
            --bg: #f6f7f9;
            --panel: #ffffff;
            --line: #e3e6ea;
            --ink: #16191d;
            --ink-soft: #5c636d;
            --ink-faint: #8b929c;
            --accent: #1d4ed8; /* brand colour */
            --accent-soft: #e8efff;
            --chip: #eef1f5;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #0f1114;
              --panel: #16191d;
              --line: #262b31;
              --ink: #e9ecef;
              --ink-soft: #a2aab4;
              --ink-faint: #767e88;
              --accent: #7aa2ff; /* brand colour, dark */
              --accent-soft: #17203a;
              --chip: #20252b;
            }
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: var(--bg);
            color: var(--ink);
            font: 14px/1.5 ui-sans-serif, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
          }
          .wrap { max-width: 1180px; margin: 0 auto; padding: 32px 20px 64px; }
          header { display: flex; flex-wrap: wrap; align-items: baseline; gap: 12px; }
          h1 { font-size: 20px; letter-spacing: -0.01em; margin: 0; }
          h1 span { color: var(--accent); }
          .origin { color: var(--ink-faint); font-size: 13px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
          .stats { display: flex; flex-wrap: wrap; gap: 10px; margin: 22px 0 0; }
          .stat {
            background: var(--panel); border: 1px solid var(--line); border-radius: 10px;
            padding: 10px 14px; min-width: 120px;
          }
          .stat b { display: block; font-size: 20px; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }
          .stat span { color: var(--ink-faint); font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; }
          .toolbar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin: 22px 0 12px; }
          input[type="search"] {
            flex: 1 1 260px; min-width: 0; padding: 9px 12px; font: inherit;
            color: var(--ink); background: var(--panel);
            border: 1px solid var(--line); border-radius: 9px;
          }
          input[type="search"]:focus { outline: 2px solid var(--accent); outline-offset: 1px; }
          .filters { display: flex; flex-wrap: wrap; gap: 6px; }
          .filters button {
            font: inherit; cursor: pointer; padding: 8px 13px; border-radius: 9px;
            border: 1px solid var(--line); background: var(--panel); color: var(--ink-soft);
          }
          .filters button[aria-pressed="true"] { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); font-weight: 600; }
          .count { color: var(--ink-faint); font-size: 13px; margin-inline-start: auto; font-variant-numeric: tabular-nums; }
          table { width: 100%; border-collapse: collapse; background: var(--panel); border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
          thead th {
            position: sticky; top: 0; z-index: 1; background: var(--panel);
            text-align: start; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em;
            color: var(--ink-faint); font-weight: 600; padding: 12px 14px; border-bottom: 1px solid var(--line);
          }
          tbody tr { border-bottom: 1px solid var(--line); content-visibility: auto; contain-intrinsic-size: 0 46px; }
          tbody tr:last-child { border-bottom: 0; }
          tbody tr:hover { background: var(--bg); }
          td { padding: 10px 14px; vertical-align: top; }
          td.num { color: var(--ink-faint); font-variant-numeric: tabular-nums; width: 1%; white-space: nowrap; }
          td.url { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; word-break: break-word; }
          td.url a { color: var(--ink); text-decoration: none; border-bottom: 1px solid transparent; }
          td.url a:hover { color: var(--accent); border-bottom-color: currentColor; }
          td.langs { width: 1%; white-space: nowrap; }
          td.date { width: 1%; white-space: nowrap; color: var(--ink-soft); font-variant-numeric: tabular-nums; }
          td.date .none { color: var(--ink-faint); }
          .chip {
            display: inline-block; margin-inline-end: 5px; padding: 2px 8px; border-radius: 999px;
            font-size: 11.5px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;
            background: var(--chip); color: var(--ink-soft); text-decoration: none; border: 1px solid transparent;
          }
          .chip:hover { border-color: var(--accent); color: var(--accent); }
          .chip.self { background: var(--accent-soft); color: var(--accent); }
          .chip.xdefault { text-transform: none; letter-spacing: 0; font-weight: 500; opacity: 0.75; }
          footer { color: var(--ink-faint); font-size: 12.5px; margin-top: 20px; }
          @media (max-width: 720px) {
            .wrap { padding: 22px 14px 48px; }
            td.date, thead th.date { display: none; }
          }
        </style>
      </head>

      <body>
        <div class="wrap">
          <header>
            <h1>H2 Solutions <span>sitemap.xml</span></h1>
            <span class="origin">
              <xsl:variable name="authority" select="substring-after(/s:urlset/s:url[1]/s:loc, '//')"/>
              <xsl:choose>
                <xsl:when test="contains($authority, '/')">
                  <xsl:value-of select="substring-before($authority, '/')"/>
                </xsl:when>
                <xsl:otherwise><xsl:value-of select="$authority"/></xsl:otherwise>
              </xsl:choose>
            </span>
          </header>

          <div class="stats">
            <div class="stat"><b><xsl:value-of select="count(/s:urlset/s:url)"/></b><span>URL</span></div>
            <div class="stat"><b id="count-az">—</b><span>dil: az</span></div>
            <div class="stat"><b id="count-en">—</b><span>dil: en</span></div>
            <div class="stat"><b id="count-ru">—</b><span>dil: ru</span></div>
            <div class="stat"><b id="count-de">—</b><span>dil: de</span></div>
            <div class="stat"><b id="count-kk">—</b><span>dil: kk</span></div>
            <div class="stat"><b id="count-uz">—</b><span>dil: uz</span></div>
            <div class="stat"><b><xsl:value-of select="count(/s:urlset/s:url/s:lastmod)"/></b><span>lastmod</span></div>
          </div>

          <div class="toolbar">
            <input type="search" id="q" placeholder="URL axtarın — məs. /en/, services, about" aria-label="URL axtarışı"/>
            <div class="filters">
              <button type="button" data-lang="" aria-pressed="true">Hamısı</button>
              <button type="button" data-lang="az" aria-pressed="false">AZ</button>
              <button type="button" data-lang="en" aria-pressed="false">EN</button>
              <button type="button" data-lang="ru" aria-pressed="false">RU</button>
              <button type="button" data-lang="de" aria-pressed="false">DE</button>
              <button type="button" data-lang="kk" aria-pressed="false">KK</button>
              <button type="button" data-lang="uz" aria-pressed="false">UZ</button>
            </div>
            <span class="count" id="visible"></span>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>URL</th>
                <th>Dillər (hreflang)</th>
                <th class="date">Son dəyişiklik</th>
              </tr>
            </thead>
            <tbody id="rows">
              <xsl:for-each select="/s:urlset/s:url">
                <xsl:variable name="loc" select="s:loc"/>
                <!-- The row's own locale: the alternate that points back at it. -->
                <xsl:variable name="self" select="xhtml:link[@href = $loc and @hreflang != 'x-default'][1]/@hreflang"/>
                <xsl:variable name="tail" select="substring-after(substring-after($loc, '//'), '/')"/>

                <tr data-lang="{$self}">
                  <td class="num"><xsl:value-of select="position()"/></td>

                  <td class="url">
                    <a href="{$loc}">
                      <xsl:choose>
                        <xsl:when test="$tail != ''">/<xsl:value-of select="$tail"/></xsl:when>
                        <xsl:otherwise>/</xsl:otherwise>
                      </xsl:choose>
                    </a>
                  </td>

                  <td class="langs">
                    <xsl:for-each select="xhtml:link[@hreflang != 'x-default']">
                      <a href="{@href}" title="{@href}">
                        <xsl:attribute name="class">
                          <xsl:text>chip</xsl:text>
                          <xsl:if test="@href = $loc"> self</xsl:if>
                        </xsl:attribute>
                        <xsl:value-of select="@hreflang"/>
                      </a>
                    </xsl:for-each>
                    <xsl:for-each select="xhtml:link[@hreflang = 'x-default']">
                      <a class="chip xdefault" href="{@href}" title="{@href}">x-default</a>
                    </xsl:for-each>
                  </td>

                  <td class="date">
                    <xsl:choose>
                      <xsl:when test="s:lastmod">
                        <span title="{s:lastmod}"><xsl:value-of select="substring(s:lastmod, 1, 10)"/></span>
                      </xsl:when>
                      <xsl:otherwise><span class="none">—</span></xsl:otherwise>
                    </xsl:choose>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>

          <footer>
            XSLT yalnız görünüş üçündür — sitemap-in strukturuna, URL-lərinə,
            hreflang annotasiyalarına və lastmod dəyərlərinə təsir etmir.
          </footer>
        </div>

        <script>
          <![CDATA[
          (function () {
            var rows = Array.prototype.slice.call(document.querySelectorAll('#rows tr'));
            var search = document.getElementById('q');
            var visible = document.getElementById('visible');
            var buttons = Array.prototype.slice.call(document.querySelectorAll('.filters button'));
            var codes = ['az', 'en', 'ru', 'de', 'kk', 'uz'];
            var counts = { az: 0, en: 0, ru: 0, de: 0, kk: 0, uz: 0 };
            var lang = '';

            rows.forEach(function (row) {
              var code = row.getAttribute('data-lang');
              if (counts[code] !== undefined) { counts[code] += 1; }
              row.dataset.url = row.querySelector('td.url a').getAttribute('href').toLowerCase();
            });

            codes.forEach(function (code) {
              document.getElementById('count-' + code).textContent = counts[code].toLocaleString();
            });

            function apply() {
              var needle = search.value.trim().toLowerCase();
              var shown = 0;

              rows.forEach(function (row) {
                var ok = (lang === '' || row.getAttribute('data-lang') === lang) &&
                         (needle === '' || row.dataset.url.indexOf(needle) !== -1);
                row.hidden = !ok;
                if (ok) { shown += 1; }
              });

              visible.textContent = shown.toLocaleString() + ' / ' +
                                    rows.length.toLocaleString() + ' URL';
            }

            search.addEventListener('input', apply);

            buttons.forEach(function (button) {
              button.addEventListener('click', function () {
                lang = button.getAttribute('data-lang');
                buttons.forEach(function (other) {
                  other.setAttribute('aria-pressed', other === button ? 'true' : 'false');
                });
                apply();
              });
            });

            apply();
          })();
          ]]>
        </script>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
`;
