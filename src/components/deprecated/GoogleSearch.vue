<!-- NOT IN USE, DEPRECATED -->

<template>
  <div class="google-search">
    <form @submit.prevent="onSubmit">
      <input
        v-model="query"
        type="search"
        placeholder="Search the web"
        aria-label="Search"
      />
      <button type="submit" :disabled="loading || !query.trim()">Search</button>
    </form>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="loading" class="loading">Searching…</div>

    <ul v-if="results.length" class="results">
      <li v-for="item in results" :key="item.cacheId || item.link">
        <a
          :href="item.link"
          target="_blank"
          rel="noreferrer noopener"
          @click="handleLinkOpen(item, $event)"
          @auxclick="handleAuxClick(item, $event)"
        >
          <h3 v-html="item.title"></h3>
        </a>
        <p v-html="item.snippet"></p>
        <small v-if="item.formattedUrl">{{ item.formattedUrl }}</small>
      </li>
    </ul>

    <div v-if="totalResults > pageSize" class="pagination">
      <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">Prev</button>
      <span>Page {{ currentPage }} / {{ lastPage }}</span>
      <button @click="changePage(currentPage + 1)" :disabled="currentPage === lastPage">Next</button>
    </div>

    <div v-if="!loading && !results.length && !error && hasSearched" class="no-results">
      No results found.
    </div>

    <div v-if="aiOverview.length" class="ai-overview">
      <h2>AI Overview</h2>
      <div v-for="(block, i) in aiOverview" :key="i" class="ai-block">
        <h4 v-if="block.type === 'heading'">{{ block.snippet }}</h4>
        <p v-else-if="block.type === 'paragraph'">{{ block.snippet }}</p>
        <ul v-else-if="block.type === 'list'">
          <li v-for="(item, j) in block.list" :key="j">
            {{ item.title || item.snippet }}
          </li>
        </ul>
      </div>
    </div>

    <hr/>

    <div class="metadata-controls">
      <button @click="toggleMetadata">
        {{ showMetadata ? 'Hide' : 'Show' }} captured metadata ({{ metadataRecords.length }})
      </button>
      <button @click="clearMetadata" :disabled="!metadataRecords.length">Clear</button>
      <button @click="downloadMetadata" :disabled="!metadataRecords.length">Download JSON</button>
    </div>

    <pre v-if="showMetadata" class="metadata-json" aria-live="polite">{{ prettyMetadata }}</pre>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// SerpApi key from Vite env (client-side prototype)
const SERPAPI_KEY = import.meta.env.VITE_SERPAPI_KEY;

const query = ref('');
const results = ref([]);
const loading = ref(false);
const error = ref('');
const totalResults = ref(0);
const pageSize = 10; // SerpApi/Google default page size is 10
const currentPage = ref(1);
const hasSearched = ref(false);

const metadataRecords = ref([]);
const showMetadata = ref(false);

const lastPage = computed(() => Math.max(1, Math.ceil(totalResults.value / pageSize)));

const aiOverview = ref([]); // parsed ai_overview blocks for UI

const emit = defineEmits(['link-clicked', 'log']);


function buildResultItemFromSerp(item) {
  return {
    title: item.title || item.snippet || '',
    snippet: item.snippet || '',
    link: item.link || item.url || '',
    formattedUrl: item.displayed_link || item.link || '',
    cacheId: item.link || item.url || item.position || Math.random().toString(36).slice(2, 9)
  };
}

function onSubmit() {
  // always reset to page 1 on explicit submit
  performSearch(1);
}

async function performSearch(page = 1) {
  const q = query.value.trim();
  if (!q) return;
  if (!SERPAPI_KEY) {
    error.value = 'Missing SERPAPI_KEY in environment (Vite) for SerpApi';
    return;
  }

  // coerce page to number safely
  const pageNum = Number(page);
  const pageUsed = Number.isInteger(pageNum) && pageNum > 0 ? pageNum : 1;

  loading.value = true;
  error.value = '';
  hasSearched.value = true;
  results.value = [];

  // SerpApi uses start as 0-based offset for some setups; we'll calculate like Google (1-based start)
  // SerpApi accepts `start` (1-based) parameter similarly; use (page-1)*pageSize
  const start = (pageUsed - 1) * pageSize;

  try {
    const url = new URL('/api/serp', window.location.origin);
    url.searchParams.set('engine', 'google');
    url.searchParams.set('q', q);
    url.searchParams.set('start', String(start));
    url.searchParams.set('num', String(pageSize));
    url.searchParams.set('api_key', import.meta.env.VITE_SERPAPI_KEY); // exposed to client in dev
    const resp = await fetch(url.toString());

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`SerpApi responded with ${resp.status}: ${text}`);
    }
    const json = await resp.json();


    // SerpApi typically returns results in organic_results
    const items = json.organic_results || json.items || [];

    results.value = (items || []).map(buildResultItemFromSerp);

    // total results from SerpApi may be in search_metadata.total_results or json.search_information
    totalResults.value = parseInt(
      json.search_metadata?.total_results
      || json.search_information?.totalResults
      || String((items || []).length),
      10
    );

    currentPage.value = pageUsed;

    const aiBlocks = json.ai_overview?.text_blocks || json.raw?.ai_overview?.text_blocks || [];
    aiOverview.value = parseAiOverviewBlocks(aiBlocks);

    // capture metadata including raw SerpApi response
    captureMetadata({
      query: q,
      page: pageUsed,
      timestamp: new Date().toISOString(),
      resultCount: totalResults.value,
      returnedItems: (items || []).map(it => ({
        title: it.title || '',
        link: it.link || it.url || '',
        snippet: it.snippet || '',
        displayed_link: it.displayed_link || ''
      })),
      raw: json
    });

  } catch (err) {
    console.error('Search error', err);
    error.value = err.message || 'An unknown error occurred during search';
  } finally {
    loading.value = false;
  }
}

function changePage(nextPage) {
  if (nextPage < 1 || nextPage > lastPage.value) return;
  performSearch(nextPage);
}

// Link open capture (clicks, middle-clicks, modifier opens)
function recordLinkOpen(item, mode, event) {
  const record = {
    type: 'open_link',
    link: item.link || null,
    title: item.title || null,
    query: query.value || null,
    page: currentPage.value || null,
    method: mode,
    modifiers: {
      ctrl: !!event?.ctrlKey,
      meta: !!event?.metaKey,
      shift: !!event?.shiftKey,
      alt: !!event?.altKey
    },
    timestamp: Date.now()
  };

  metadataRecords.value.push(record);

  emit('log', {
    timestamp: record.timestamp,
    action: 'open_link',
    payload: record
  });
}


function handleLinkOpen(item, event) {
  const isNewTabByModifier = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
  const mode = isNewTabByModifier ? 'modifier_open' : 'same_tab';
  recordLinkOpen(item, mode, event);
  // allow default navigation

  emit('link-clicked', {
    title: item.title,
    link: item.link
  });

}

function handleAuxClick(item, event) {
  if (event.button === 1) {
    recordLinkOpen(item, 'middle_click', event);
  } else {
    recordLinkOpen(item, `aux_button_${event.button}`, event);
  }
  // allow default behavior

  emit('link-clicked', {
    title: item.title,
    link: item.link
  });

}

// Metadata helpers
function captureMetadata(record) {
  const enriched = {
    id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
    receivedAt: new Date().toISOString(),
    userAgent: navigator?.userAgent || null,
    ...record
  };

  metadataRecords.value.push(enriched);

  emit('log', {
    timestamp: Date.now(),
    action: 'search-metadata',
    payload: enriched
  });
}


function parseAiOverviewBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];
  // Normalize blocks to a small shape for the template
  return blocks.map(b => {
    if (b.type === 'list' && Array.isArray(b.list)) {
      // ensure each list item has a snippet or title
      return { type: 'list', list: b.list.map(li => ({ title: li.title, snippet: li.snippet })) };
    }
    // paragraph / heading / fallback
    return { type: b.type || 'paragraph', snippet: b.snippet || '' };
  });
}


function toggleMetadata() {
  showMetadata.value = !showMetadata.value;
}

function clearMetadata() {
  metadataRecords.value = [];
}

const prettyMetadata = computed(() => {
  return JSON.stringify(metadataRecords.value, null, 2);
});

function downloadMetadata() {
  const blob = new Blob([prettyMetadata.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `search-metadata-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
.google-search { max-width: 760px; margin: 0 auto; }
form { display:flex; gap:8px; margin-bottom:12px; }
input[type="search"] { flex:1; padding:8px; font-size:14px; }
button { padding:8px 12px; }
.results { list-style:none; padding:0; margin:0; }
.results li { margin-bottom:16px; border-bottom:1px solid #eee; padding-bottom:12px; }
.error { color: #a94442; background:#f2dede; padding:8px; margin-bottom:12px; }
.loading { color:#555; margin-bottom:12px; }
.pagination { display:flex; gap:12px; align-items:center; margin-top:12px; }
.no-results { color:#666; margin-top:12px; }
.metadata-controls { display:flex; gap:8px; margin-top:12px; }
.metadata-json { background:#f7f7f8; padding:12px; overflow:auto; max-height:44vh; white-space:pre-wrap; }
</style>
