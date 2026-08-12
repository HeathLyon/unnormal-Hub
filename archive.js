/* =========================================================
   UNNORMAL STORIES — SEARCHABLE EPISODE ARCHIVE

   Add a .txt record to /archive, then add its path below.
   The page parses the tags, summary, findings, sources, and
   Spotify URL directly from each text document.
   ========================================================= */

const ARCHIVE_FILES = [
  "archive/ep-13-unlucky-numbers.txt",
  "archive/ep-12-waking-up-in-the-wrong-body.txt",
  "archive/ep-11-circling-light.txt",
  "archive/ep-10-the-vril-society.txt",
  "archive/ep-09-the-hum.txt",
  "archive/ep-08-the-mirror-isnt-a-mirror.txt",
  "archive/ep-07-bennington-triangle.txt",
  "archive/ep-06-the-wooden-hand.txt",
  "archive/ep-05-three-red-eyes.txt",
  "archive/ep-04-the-crystal-skulls.txt",
  "archive/ep-03-the-lost-russian-prince.txt",
  "archive/ep-02-it-walked-funny.txt",
  "archive/ep-01-the-bermuda-triangle.txt"
];

// Replace this image file whenever you are ready to add custom featured art.
// An episode .txt file can optionally override it with: IMAGE: assets/file.webp
const DEFAULT_FEATURE_IMAGE = "assets/archive-feature-placeholder.webp";

// This fallback keeps the demo working when archive.html is opened directly
// from a computer. On the live website, the matching .txt files are loaded.
const ARCHIVE_FALLBACKS = {
  "archive/ep-13-unlucky-numbers.txt": `TITLE: Ep. 13 — Unlucky Numbers
SLUG: ep-13-unlucky-numbers
EPISODE: 13
SEASON: 2
PUBLISHED: 2025-09-13
DURATION: 58:56
TAGS: unlucky numbers, superstition, numerology, folklore, coincidence, listener question
SPOTIFY: https://podcasters.spotify.com/pod/show/unnormalstories/episodes/Ep--13---Unlucky-Numbers-e385mmn
---
SUMMARY
Jace and Ben follow the strange luck, fear, folklore, and personal meaning people attach to particular numbers—and ask listeners which numbers feel lucky or unlucky to them.

FINDINGS
- Numbers become “lucky” or “cursed” through a mixture of culture, religion, pattern recognition, and memorable coincidence.
- The same number can carry opposite meanings in different places, making number superstition a useful case study in how beliefs spread.
- Add the team’s final conclusions, corrections, and follow-up discoveries here.

SOURCES
- Britannica — Triskaidekaphobia | https://www.britannica.com/science/triskaidekaphobia
- Merriam-Webster — Triskaidekaphobia | https://www.merriam-webster.com/dictionary/triskaidekaphobia
- Add full episode bibliography and listener references here.`,

  "archive/ep-09-the-hum.txt": `TITLE: Ep. 9 — The Hum
SLUG: ep-09-the-hum
EPISODE: 9
SEASON: 2
PUBLISHED: 2025-06-21
DURATION: 1:16:13
TAGS: the hum, unexplained sound, Taos, Kokomo, Bristol, infrasound, environmental mystery
SPOTIFY: https://podcasters.spotify.com/pod/show/unnormalstories/episodes/Ep--9---The-Hum-e34iatd
---
SUMMARY
Can you hear it? Jace and Ben investigate reports of a persistent low-frequency sound known as “The Hum,” comparing famous clusters and the explanations proposed for them.

FINDINGS
- Reports called “The Hum” may not all share one cause; industrial sources, tinnitus, environmental sound, and expectation can overlap.
- Geographic clusters such as Taos, Kokomo, and Bristol turned a private sensory experience into a public mystery.
- Add the team’s audio tests, corrections, and conclusions here.

SOURCES
- Live Science — What Is the Mysterious Hum? | https://www.livescience.com/38427-the-hum-mystery-taos-hum.html
- The Conversation — The worldwide mystery of the Hum | https://theconversation.com/the-hum-the-mysterious-low-frequency-noise-that-drives-some-people-crazy-168556
- Episode audio attribution and complete bibliography should be added here.`,

  "archive/ep-07-bennington-triangle.txt": `TITLE: Ep. 7 — The Bennington Triangle
SLUG: ep-07-bennington-triangle
EPISODE: 7
SEASON: 2
PUBLISHED: 2025-06-08
DURATION: 2:01:55
TAGS: Bennington Triangle, Vermont, disappearances, Glastenbury Mountain, folklore, wilderness, season 2
SPOTIFY: https://podcasters.spotify.com/pod/show/unnormalstories/episodes/Ep--7---The-Bennington-Triangle-e33uk0o
---
SUMMARY
The Season 2 opener follows the disappearances and folklore associated with the so-called Bennington Triangle around Glastenbury Mountain, Vermont.

FINDINGS
- The “triangle” is a later label applied to several disappearances rather than an official historical region.
- Dense terrain, incomplete records, and retellings complicate efforts to separate the documented cases from accumulated legend.
- Add the hosts’ final case-by-case findings and any local follow-up here.

SOURCES
- Vermont Historical Society — Glastenbury history collections | https://vermonthistory.org/
- New England Historical Society — Bennington Triangle overview | https://newenglandhistoricalsociety.com/bennington-triangle-mysterious-disappearances-vermont/
- Add newspapers, maps, archival records, and corrections here.`
};

const archiveState = {
  episodes: [],
  query: "",
  activeTag: "all",
  featuredSlug: ""
};

const archiveElements = {
  total: document.getElementById("archiveTotal"),
  tagTotal: document.getElementById("archiveTagTotal"),
  latest: document.getElementById("latestEpisode"),
  featured: document.getElementById("featuredEpisode"),
  reroll: document.getElementById("rerollFeatured"),
  search: document.getElementById("archiveSearch"),
  clear: document.getElementById("clearArchiveSearch"),
  tagFilter: document.getElementById("tagFilter"),
  status: document.getElementById("catalogStatus"),
  grid: document.getElementById("episodeGrid"),
  empty: document.getElementById("emptyState"),
  emptyReset: document.getElementById("emptyReset"),
  dialog: document.getElementById("episodeDialog"),
  dialogClose: document.getElementById("dialogClose"),
  dialogContent: document.getElementById("dialogContent")
};

function escapeHTML(value = "") {
  return value.replace(/[&<>'"]/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[character]);
}

function parseListBlock(block = "") {
  return block
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => line.replace(/^[-*]\s*/, "").trim());
}

function parseSource(line) {
  const separator = line.lastIndexOf("|");
  if (separator === -1) return { label: line.trim(), url: "" };
  return {
    label: line.slice(0, separator).trim(),
    url: line.slice(separator + 1).trim()
  };
}

function parseArchiveText(text, file) {
  const normalized = text.replace(/\r/g, "").trim();
  const [headerText = "", bodyText = ""] = normalized.split(/\n---\n/, 2);
  const metadata = {};

  headerText.split("\n").forEach(line => {
    const separator = line.indexOf(":");
    if (separator === -1) return;
    const key = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    metadata[key] = value;
  });

  const sectionPattern = /(?:^|\n)(SUMMARY|FINDINGS|SOURCES)\n([\s\S]*?)(?=\n(?:SUMMARY|FINDINGS|SOURCES)\n|$)/g;
  const sections = {};
  let match;
  while ((match = sectionPattern.exec(bodyText)) !== null) {
    sections[match[1].toLowerCase()] = match[2].trim();
  }

  const tags = (metadata.tags || "")
    .split(",")
    .map(tag => tag.trim())
    .filter(Boolean);

  const findings = parseListBlock(sections.findings);
  const sources = parseListBlock(sections.sources).map(parseSource);

  return {
    file,
    slug: metadata.slug || file.split("/").pop().replace(/\.txt$/i, ""),
    title: metadata.title || "Untitled case file",
    episode: Number(metadata.episode || 0),
    season: Number(metadata.season || 0),
    published: metadata.published || "",
    duration: metadata.duration || "",
    tags,
    spotify: metadata.spotify || "",
    image: metadata.image || DEFAULT_FEATURE_IMAGE,
    summary: sections.summary || "Summary pending.",
    findings,
    sources
  };
}

async function loadEpisodeFile(file) {
  try {
    const response = await fetch(file, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load ${file}`);
    return parseArchiveText(await response.text(), file);
  } catch (error) {
    const fallback = ARCHIVE_FALLBACKS[file];
    if (!fallback) return null;
    return parseArchiveText(fallback, file);
  }
}

function formatDate(dateString) {
  if (!dateString) return "Date unknown";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${dateString}T00:00:00Z`));
}

function toISODuration(duration = "") {
  const parts = duration.split(":").map(Number);
  if (!parts.length || parts.some(Number.isNaN)) return undefined;

  const seconds = parts.pop() || 0;
  const minutes = parts.pop() || 0;
  const hours = parts.pop() || 0;
  return `PT${hours ? `${hours}H` : ""}${minutes ? `${minutes}M` : ""}${seconds || (!hours && !minutes) ? `${seconds}S` : ""}`;
}

function updatePodcastStructuredData() {
  document.getElementById("archivePodcastSchema")?.remove();

  const itemListElement = archiveState.episodes.map((episode, index) => {
    const episodeData = {
      "@type": "PodcastEpisode",
      name: episode.title,
      description: episode.summary,
      episodeNumber: episode.episode,
      datePublished: episode.published,
      keywords: episode.tags.join(", "),
      image: new URL(episode.image, window.location.href).href,
      url: episode.spotify || new URL(`archive.html?episode=${encodeURIComponent(episode.slug)}`, window.location.href).href,
      partOfSeries: {
        "@type": "PodcastSeries",
        "@id": "https://www.unnormalstories.com/#podcast",
        name: "Unnormal Stories"
      }
    };

    const isoDuration = toISODuration(episode.duration);
    if (isoDuration) episodeData.duration = isoDuration;

    return {
      "@type": "ListItem",
      position: index + 1,
      item: episodeData
    };
  });

  const schema = document.createElement("script");
  schema.id = "archivePodcastSchema";
  schema.type = "application/ld+json";
  schema.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Unnormal Stories Podcast Episodes",
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: itemListElement.length,
    itemListElement
  });
  document.head.appendChild(schema);
}

function tagMarkup(tags, limit = tags.length) {
  return tags.slice(0, limit).map(tag => `<span class="episode-tag">${escapeHTML(tag)}</span>`).join("");
}

function episodeActions(episode, compact = false) {
  return `
    <div class="episode-actions${compact ? " compact-actions" : ""}">
      <a class="btn btn-red" href="${escapeHTML(episode.spotify)}" target="_blank" rel="noopener noreferrer">Listen on Spotify</a>
      <button class="btn btn-outline" type="button" data-open-episode="${escapeHTML(episode.slug)}">Findings &amp; sources</button>
    </div>`;
}

function discoverMarkup(episode, label) {
  return `
    <div class="pick-image">
      <img src="${escapeHTML(episode.image)}" alt="${escapeHTML(episode.title)} featured artwork" />
    </div>
    <div class="pick-content">
      <div class="pick-topline">
        <span class="pick-label">${escapeHTML(label)}</span>
        <span>S${String(episode.season).padStart(2, "0")} / EP${String(episode.episode).padStart(2, "0")}</span>
      </div>
      <h3>${escapeHTML(episode.title)}</h3>
      <div class="pick-actions">
        <a href="${escapeHTML(episode.spotify)}" target="_blank" rel="noopener noreferrer">Listen ↗</a>
        <button type="button" data-open-episode="${escapeHTML(episode.slug)}">Open file</button>
      </div>
    </div>
  `;
}

function cardMarkup(episode) {
  return `
    <article class="archive-episode-card reveal visible" data-episode-slug="${escapeHTML(episode.slug)}">
      <div class="episode-file-tab">FILE ${String(episode.episode).padStart(2, "0")}</div>
      <div class="episode-tags">${tagMarkup(episode.tags, 4)}</div>
      <p class="episode-kicker">Season ${episode.season} • ${escapeHTML(formatDate(episode.published))}</p>
      <h3>${escapeHTML(episode.title)}</h3>
      <p class="episode-summary">${escapeHTML(episode.summary)}</p>
      <div class="episode-meta">
        <span>${escapeHTML(episode.duration)}</span>
        <span>${episode.sources.length} sources</span>
        <span>${episode.findings.length} findings</span>
      </div>
      ${episodeActions(episode)}
    </article>
  `;
}

function searchableText(episode) {
  return [
    episode.title,
    episode.summary,
    episode.tags.join(" "),
    episode.findings.join(" "),
    episode.sources.map(source => source.label).join(" "),
    `season ${episode.season}`,
    `episode ${episode.episode}`
  ].join(" ").toLowerCase();
}

function filteredEpisodes() {
  const terms = archiveState.query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return archiveState.episodes.filter(episode => {
    const matchesTag = archiveState.activeTag === "all" ||
      episode.tags.some(tag => tag.toLowerCase() === archiveState.activeTag);
    const haystack = searchableText(episode);
    const matchesTerms = terms.every(term => haystack.includes(term));
    return matchesTag && matchesTerms;
  });
}

function renderCatalog() {
  const results = filteredEpisodes();
  archiveElements.grid.innerHTML = results.map(cardMarkup).join("");
  archiveElements.status.textContent = `${results.length} of ${archiveState.episodes.length} case files in signal range`;
  archiveElements.empty.hidden = results.length !== 0;
  archiveElements.grid.hidden = results.length === 0;
}

function renderTagFilters() {
  const tags = [...new Set(archiveState.episodes.flatMap(episode => episode.tags.map(tag => tag.toLowerCase())))].sort();
  const buttons = ["all", ...tags].map(tag => `
    <button class="tag-filter-button${tag === archiveState.activeTag ? " active" : ""}" type="button" data-filter-tag="${escapeHTML(tag)}">
      ${tag === "all" ? "All files" : escapeHTML(tag)}
    </button>`).join("");
  archiveElements.tagFilter.innerHTML = buttons;
  archiveElements.tagTotal.textContent = String(tags.length).padStart(2, "0");
}

function randomEpisode(excludeSlug = "") {
  const choices = archiveState.episodes.filter(episode => episode.slug !== excludeSlug);
  const pool = choices.length ? choices : archiveState.episodes;
  if (!pool.length) return null;
  let index;
  if (window.crypto?.getRandomValues) {
    const random = new Uint32Array(1);
    window.crypto.getRandomValues(random);
    index = random[0] % pool.length;
  } else {
    index = Math.floor(Math.random() * pool.length);
  }
  return pool[index];
}

function renderDiscoverFeed(reroll = false) {
  const latest = archiveState.episodes[0];
  if (!latest) return;

  if (reroll || !archiveState.featuredSlug) {
    archiveState.featuredSlug = randomEpisode(latest.slug)?.slug || latest.slug;
  }

  const featured = archiveState.episodes.find(episode => episode.slug === archiveState.featuredSlug) || latest;
  archiveElements.latest.innerHTML = discoverMarkup(latest, "Latest episode");
  archiveElements.featured.innerHTML = discoverMarkup(featured, "Random file");
}

function resetArchive() {
  archiveState.query = "";
  archiveState.activeTag = "all";
  archiveElements.search.value = "";
  renderTagFilters();
  renderCatalog();
}

function openEpisodeFile(slug, updateURL = true) {
  const episode = archiveState.episodes.find(item => item.slug === slug);
  if (!episode || !archiveElements.dialog) return;

  const findings = episode.findings.length
    ? `<ul>${episode.findings.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>`
    : "<p>Findings have not been added yet.</p>";

  const sources = episode.sources.length
    ? `<ol>${episode.sources.map(source => {
        const label = escapeHTML(source.label);
        return source.url
          ? `<li><a href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">${label} ↗</a></li>`
          : `<li>${label}</li>`;
      }).join("")}</ol>`
    : "<p>Sources have not been added yet.</p>";

  archiveElements.dialogContent.innerHTML = `
    <p class="eyebrow">CASE FILE // S${String(episode.season).padStart(2, "0")} EP${String(episode.episode).padStart(2, "0")}</p>
    <div class="episode-tags">${tagMarkup(episode.tags)}</div>
    <h2 id="dialogTitle">${escapeHTML(episode.title)}</h2>
    <div class="episode-meta dialog-meta">
      <span>${escapeHTML(formatDate(episode.published))}</span>
      <span>${escapeHTML(episode.duration)}</span>
    </div>
    <section class="dialog-section">
      <h3>Episode summary</h3>
      <p>${escapeHTML(episode.summary)}</p>
    </section>
    <section class="dialog-section">
      <h3>What we found</h3>
      ${findings}
    </section>
    <section class="dialog-section">
      <h3>More information &amp; sources</h3>
      ${sources}
    </section>
    <div class="episode-actions dialog-actions">
      <a class="btn btn-red" href="${escapeHTML(episode.spotify)}" target="_blank" rel="noopener noreferrer">Listen on Spotify</a>
      <a class="btn btn-outline" href="${escapeHTML(episode.file)}" target="_blank" rel="noopener noreferrer">Open raw .txt file</a>
    </div>
  `;

  archiveElements.dialog.showModal();
  if (updateURL) {
    const url = new URL(window.location.href);
    url.searchParams.set("episode", slug);
    window.history.replaceState({}, "", url);
  }
}

function closeEpisodeFile() {
  archiveElements.dialog?.close();
  const url = new URL(window.location.href);
  url.searchParams.delete("episode");
  window.history.replaceState({}, "", url);
}

async function initializeArchive() {
  try {
    archiveState.episodes = (await Promise.all(ARCHIVE_FILES.map(loadEpisodeFile)))
      .filter(Boolean)
      .sort((a, b) => b.published.localeCompare(a.published));

    updatePodcastStructuredData();
    archiveElements.total.textContent = String(archiveState.episodes.length).padStart(2, "0");
    renderTagFilters();
    renderDiscoverFeed();
    renderCatalog();

    const requestedEpisode = new URLSearchParams(window.location.search).get("episode");
    if (requestedEpisode) openEpisodeFile(requestedEpisode, false);
  } catch (error) {
    archiveElements.status.textContent = "The archive files could not be indexed. Check the file list in archive.js.";
    archiveElements.empty.hidden = false;
    archiveElements.grid.hidden = true;
  }
}

archiveElements.search?.addEventListener("input", event => {
  archiveState.query = event.target.value;
  renderCatalog();
});

archiveElements.clear?.addEventListener("click", resetArchive);
archiveElements.emptyReset?.addEventListener("click", resetArchive);
archiveElements.reroll?.addEventListener("click", () => renderDiscoverFeed(true));

archiveElements.tagFilter?.addEventListener("click", event => {
  const button = event.target.closest("[data-filter-tag]");
  if (!button) return;
  archiveState.activeTag = button.dataset.filterTag;
  renderTagFilters();
  renderCatalog();
});

document.addEventListener("click", event => {
  const button = event.target.closest("[data-open-episode]");
  if (button) openEpisodeFile(button.dataset.openEpisode);
});

archiveElements.dialogClose?.addEventListener("click", closeEpisodeFile);
archiveElements.dialog?.addEventListener("click", event => {
  if (event.target === archiveElements.dialog) closeEpisodeFile();
});
archiveElements.dialog?.addEventListener("cancel", event => {
  event.preventDefault();
  closeEpisodeFile();
});

initializeArchive();
