<template>
  <div class="w-full">
    <form @submit.prevent="onSubmit" class="flex w-full sticky top-0">
      <input
        v-model="query"
        type="search"
        placeholder="Search the web"
        aria-label="Search"
        class="flex-1 border border-gray-300 rounded-xl px-6! py-4! shadow bg-gray-100"
      />
      <button type="submit" :disabled="loading || !query.trim()" class="absolute right-2 bottom-2 p-3! rounded-full cursor-pointer bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        <svg width="18" class="fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M342.6 73.4C330.1 60.9 309.8 60.9 297.3 73.4L137.3 233.4C124.8 245.9 124.8 266.2 137.3 278.7C149.8 291.2 170.1 291.2 182.6 278.7L288 173.3L288 544C288 561.7 302.3 576 320 576C337.7 576 352 561.7 352 544L352 173.3L457.4 278.7C469.9 291.2 490.2 291.2 502.7 278.7C515.2 266.2 515.2 245.9 502.7 233.4L342.7 73.4z"/></svg>
      </button>
    </form>

    <div v-if="error" class="text-[#a94442] bg-[#f2dede] rounded-lg w-full py-4 flex justify-center items-center">{{ error }}</div>
    <div v-if="loading" class="text-gray-500 w-full py-4 flex justify-center items-center">Generating AI Overview…</div>

    <div v-if="aiOverview.length" class="px-2 py-4 gap-y-2 flex flex-col">
      <h2 class="font-semibold!">AI Overview</h2>

      <div v-for="(block, i) in aiOverview" :key="i">
        <h4 v-if="block.type === 'heading'" class="font-bold! mb-2!">{{ block.snippet }}</h4>

        <p v-else-if="block.type === 'paragraph'">
          <span :class="{ 'font-semibold! py-2! text-lg': i != aiOverview.length-1 && aiOverview[i+1].type == 'list' }">
            {{ block.snippet }}
          </span>

          <span v-if="block.references.length" class="relative inline-flex">
            <span
              @click.stop="updateAlignment($event, i)"
              class="inline-flex items-center gap-1 bg-gray-200 hover:bg-gray-300 cursor-pointer text-xs rounded-full py-0.5 px-2 ml-1! -translate-y-px select-none"
            >
              {{ getReference(block.references[0])?.source }}
              <span v-if="block.references.length > 1" class="text-gray-500">+{{ block.references.length - 1 }}</span>
            </span>

            <div
              v-if="activePopup === i"
              class="absolute top-full mb-2 w-100 bg-white border border-gray-300 rounded-xl shadow-xl z-50 overflow-hidden"
              :class="popupAlignments[i] === 'right' ? 'right-0' : 'left-0'"
            >
              <div class="px-3 py-2 border-b border-gray-300 flex items-center justify-between">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sources</span>
              </div>
              <ul class="flex flex-col divide-y divide-gray-300">
                  <li
                    v-for="(refIndex, k) in block.references"
                    :key="k"
                    class="px-2 py-2 hover:bg-gray-100 cursor-pointer"
                    @click.stop="openReference(refIndex); closePopup()"
                  >
                    <div class="text-sm font-medium truncate">{{ getReference(refIndex)?.title }}</div>
                  <div class="text-xs text-gray-400 truncate">{{ getReference(refIndex)?.source }}</div>
                </li>
              </ul>
            </div>
          </span>
        </p>

        <div v-else-if="block.type === 'table' && block.tableData" class="w-full">
          <table class="w-full border-collapse mt-2">
            <thead>
              <tr class="bg-gray-100">
                <th
                  v-for="col in Object.keys(block.tableData[0])"
                  :key="col"
                  class="text-left px-3 py-2 border border-gray-300 font-semibold capitalize"
                >
                  {{ col.replace(/_/g, ' ') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, ri) in block.tableData" :key="ri" class="hover:bg-gray-50">
                <td
                  v-for="(val, key) in row"
                  :key="key"
                  class="px-3 py-2 border border-gray-300"
                >
                  {{ val }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else>
          <p v-if="block.snippet">{{ block.snippet }}</p>
          <ul class="list-disc list-inside flex flex-col gap-1 px-2">
            <li v-for="(item, li) in block.list" :key="li">
              <template v-if="item.includes(':')">
                <b class="font-semibold!">{{ item.split(":")[0] }}</b>: <span>{{ item.split(":")[1] }}</span>
              </template>
              <template v-else>
                <p>{{ item }}</p>
              </template>
              <span v-if="block.references.length && li === block.list.length - 1" class="relative inline-flex">
                <span
                  @click.stop="updateAlignment($event, `${i}-${li}-list`)"
                  class="inline-flex items-center gap-1 bg-gray-200 hover:bg-gray-300 cursor-pointer text-xs rounded-full py-0.5 px-2 ml-1! -translate-y-px select-none"
                >
                  <!-- {{ msg.sources[block.refIndexes[0]]?.title?.split(' ').slice(0, 3).join(' ') }}… -->
                  {{ references[block.references[0]]?.source || references[block.references[0]]?.title?.split(' ').slice(0, 3).join(' ') }}
                  <span v-if="block.references.length > 1" class="text-gray-500">+{{ block.references.length - 1 }}</span>
                </span>

                <div
                  v-if="activePopup === `${i}-${li}-list`"
                  class="absolute top-full mt-1 w-100 bg-white border border-gray-300 rounded-xl shadow-xl z-50 overflow-hidden"
                  :class="popupAlignments[`${i}-${li}-list`] === 'right' ? 'right-0' : 'left-0'"
                >
                  <div class="px-3 py-2 border-b border-gray-300 flex items-center justify-between">
                    <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sources</span>
                    <button @click.stop="closePopup" class="text-gray-300 hover:text-gray-500 bg-transparent border-0 cursor-pointer text-sm leading-none">✕</button>
                  </div>
                  <ul class="flex flex-col divide-y divide-gray-300">
                    <li
                      v-for="ri in block.references"
                      :key="ri"
                      class="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      @click.stop="openReference(ri); closePopup()"
                    >
                      <div class="text-sm font-medium text-gray-700 truncate">{{ references[ri]?.title }}</div>
                      <div class="text-xs text-gray-400 truncate">{{ references[ri]?.link }}</div>
                    </li>
                  </ul>
                </div>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="!loading && !aiOverview.length && hasSearched && !error" class="text-gray-500 px-2 w-full py-4 flex justify-center items-center">
      No AI overview available for this query.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const references = ref([]);
const SERPAPI_KEY = import.meta.env.VITE_SERPAPI_KEY;

const query = ref('');
const aiOverview = ref([]);
const loading = ref(false);
const error = ref('');
const hasSearched = ref(false);
const activePopup = ref(null);

const emit = defineEmits(['link-clicked', 'log']);

const popupAlignments = ref({});

function updateAlignment(event, key) {
  const rect = event.currentTarget.getBoundingClientRect();
  const spaceOnRight = window.innerWidth - rect.left;
  popupAlignments.value[key] = spaceOnRight < 500 ? 'right' : 'left';
  togglePopup(key);
}

function togglePopup(i) {
  activePopup.value = activePopup.value === i ? null : i;
}

function closePopup() {
  activePopup.value = null;
}

function onClickOutside() {
  activePopup.value = null;
}

onMounted(() => document.addEventListener('click', onClickOutside));
onUnmounted(() => document.removeEventListener('click', onClickOutside));

function onSubmit() {
  performSearch();
}

async function performSearch() {
  const q = query.value.trim();
  if (!q) return;

  if (!SERPAPI_KEY) {
    error.value = 'Missing SERPAPI_KEY in environment.';
    return;
  }

  loading.value = true;
  error.value = '';
  hasSearched.value = true;
  aiOverview.value = [];

  try {
    const url = new URL('/api/serp', window.location.origin);
    url.searchParams.set('engine', 'google');
    url.searchParams.set('q', q);
    url.searchParams.set('api_key', SERPAPI_KEY);

    const resp = await fetch(url.toString());
    if (!resp.ok) {
      throw new Error(`SerpApi responded with ${resp.status}`);
    }

    const json = await resp.json();

    const blocks =
      json.ai_overview?.text_blocks ||
      json.raw?.ai_overview?.text_blocks ||
      [];

    let _blocks = normalizeBlocks(blocks).filter(block => block.type==="list"&&block.list.length);
    if (_blocks[_blocks.length-1].type === "heading") {
      _blocks = blocks.slice(0, blocks.length-1)
    }
    aiOverview.value = _blocks
    
    const refs =
      json.ai_overview?.references ||
      json.raw?.ai_overview?.references ||
      [];
    references.value = normalizeReferences(refs);

    emit('log', {
      timestamp: Date.now(),
      action: 'ai-overview-returned',
      payload: {
        query: q,
        blockCount: aiOverview.value.length,
        referenceCount: references.value.length,
        resultContent: aiOverview.value.flatMap(b => {
          if (b.type === 'heading') return [b.snippet]
          if (b.type === 'list') return [...b.list].filter(Boolean)
          if (b.type === 'table' && b.tableData) return b.tableData.map(row => Object.values(row).join(' '))
          return [b.snippet].filter(Boolean)
        })
      }
    });

  } catch (err) {
    error.value = err.message || 'AI Overview search failed';
  } finally {
    loading.value = false;
  }
}

function normalizeBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];

  return blocks.map(b => {
    // CRITICAL: SerpAPI has changed reference format frequently.
    // If citations aren't working this is a likely culprit.
    const refs =
      (Array.isArray(b.references) && b.references) ||
      (Array.isArray(b.reference_indexes) && b.reference_indexes) ||
      (Array.isArray(b.reference_ids) && b.reference_ids) ||
      (Array.isArray(b.citation_indices) && b.citation_indices) ||
      (Array.isArray(b.attributes?.references) && b.attributes.references) ||
      (Array.isArray(b.metadata?.references) && b.metadata.references) ||
      [];

    const base = {
      type: b.type || 'paragraph',
      snippet: b.snippet || '',
      references: refs
    };

    if (b.type === 'list' && Array.isArray(b.list)) {
      return {
        ...base,
        type: 'list',
        list: b.list.map(li => {
          const raw = li.title || li.snippet || "";
          const stripped = raw.replace(/^\d+\.\s*/, "");
          const splitMatch = stripped.match(/([a-z])([A-Z])/);
          if (splitMatch) {
            const idx = stripped.indexOf(splitMatch[0]);
            const title = stripped.slice(0, idx + 1);
            const content = stripped.slice(idx + 1);
            return `${title}: ${content}`;
          }
          return stripped;
        })
      };
    }

    if (b.type === 'table' && b.formatted) {
      return {
        ...base,
        type: 'table',
        tableData: b.formatted
      };
    }

    return base;
  });
}

function normalizeReferences(refs) {
  if (!Array.isArray(refs)) return [];

  return refs.map(r => ({
    title: r.title || r.snippet || r.link || 'Untitled Source',
    link: r.link || '',
    source: r.source || '',
  }));
}

function getReference(index) {
  const ref = references.value[index];
  if (!ref) return null;
  return ref;
}

function openReference(index) {
  const ref = references.value[index];
  if (!ref) return;

  emit('link-clicked', {
    title: ref.title,
    link: ref.link
  });

  emit('log', {
    timestamp: Date.now(),
    action: 'ai-overview-citation-clicked',
    payload: {
      index,
      title: ref.title,
      link: ref.link,
      source: ref.source
    }
  });

  window.open(ref.link, '_blank', 'noopener,noreferrer');
}
</script>