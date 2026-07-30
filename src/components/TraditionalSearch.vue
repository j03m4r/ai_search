<template>
    <div class="w-full">
        <form @submit.prevent="onSubmit" class="flex w-full sticky top-0">
            <input id="search-panel" v-model="query" type="search" placeholder="Search the web" aria-label="Search"
                class="flex-1 border border-gray-300 rounded-xl px-6! py-4! shadow bg-gray-100" />
            <button type="submit" :disabled="loading || !query.trim()"
                class="absolute right-2 bottom-2 p-3! rounded-full cursor-pointer bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <svg width="18" class="fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path
                        d="M342.6 73.4C330.1 60.9 309.8 60.9 297.3 73.4L137.3 233.4C124.8 245.9 124.8 266.2 137.3 278.7C149.8 291.2 170.1 291.2 182.6 278.7L288 173.3L288 544C288 561.7 302.3 576 320 576C337.7 576 352 561.7 352 544L352 173.3L457.4 278.7C469.9 291.2 490.2 291.2 502.7 278.7C515.2 266.2 515.2 245.9 502.7 233.4L342.7 73.4z" />
                </svg>
            </button>
        </form>

        <div v-if="error" class="text-[#a94442] bg-[#f2dede] px-2 py-2 mt-3! rounded">{{ error }}</div>
        <div v-if="loading" class="text-gray-500 w-full py-4 flex justify-center items-center">Loading...</div>

        <ul v-if="results.length" class="list-none px-2 py-4">
            <p v-if="(totalResults > pageSize) && !loading" class="text-sm text-gray-500 mb-3!">Page {{ currentPage }} /
                {{ lastPage }}</p>
            <li v-for="(item, idx) in results" :key="item.cacheId || item.link" class="border-b border-gray-300 mb-4! pb-4" :id="idx===0?'tour-highlight':undefined">
                <a :href="item.link" target="_blank" rel="noreferrer noopener" @click="emitLink(item)"
                    @auxclick="emitLink(item)">
                    <h3 v-html="item.title" class="text-blue-600 hover:underline text-base font-medium"></h3>
                    <small v-if="item.formattedUrl" class="text-xs text-gray-400 -mt-2!">{{ item.formattedUrl }}</small>
                </a>
                <p v-html="item.snippet" class="text-sm text-gray-700 mt-1!" :class="idx===0&&!finishedHighlightTutorial ? 'tour-selection-mark' : ''"></p>
            </li>
        </ul>

        <div v-if="(totalResults > pageSize) && !loading" class="flex gap-2 items-center -mt-3! mb-3!">
            <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
                class="px-3 py-1.5 border border-gray-300 rounded cursor-pointer hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Prev</button>
            <span class="text-sm text-gray-500">Page {{ currentPage }} / {{ lastPage }}</span>
            <button @click="changePage(currentPage + 1)" :disabled="currentPage === lastPage"
                class="px-3 py-1.5 border border-gray-300 rounded cursor-pointer hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button>
        </div>

        <div v-if="!loading && !results.length && hasSearched && !error"
            class="text-gray-500 w-full py-4 flex justify-center items-center">
            No results found.
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';

const query = ref('');
const results = ref([]);
const loading = ref(false);
const error = ref('');
const totalResults = ref(0);
const pageSize = 10;
const currentPage = ref(1);
const hasSearched = ref(false);
const finishedHighlightTutorial = ref(false);

const lastPage = computed(() =>
    Math.max(1, Math.ceil(totalResults.value / pageSize))
);

const emit = defineEmits(['link-clicked', 'log']);

import { useTour } from "@/composables/useTour";
const { startHighlightTour } = useTour()
watch(() => results.value.length, (newLength) => {
    if (!finishedHighlightTutorial.value) {
        nextTick(() => {
            startHighlightTour(() => {
                localStorage.setItem('finishedHighlightTutorial', 'true');
                finishedHighlightTutorial.value = true;
            });
        });
    }
})
onMounted(() => {
    finishedHighlightTutorial.value = localStorage.getItem("finishedHighlightTutorial") !== null
});

function buildResultItem(item) {
    return {
        title: item.title || item.snippet || '',
        snippet: item.snippet || '',
        link: item.link || item.url || '',
        formattedUrl: item.displayed_link || item.link || '',
        cacheId: item.link || item.url || Math.random().toString(36).slice(2, 9)
    };
}

function onSubmit() {
    performSearch(1);
}

import { apiFetch } from "@/lib/api";
import { useParticipant } from "@/composables/useParticipant";

const { participantId } = useParticipant();

async function performSearch(page = 1) {
    const q = query.value.trim();
    if (!q) return;
    loading.value = true;
    error.value = '';
    hasSearched.value = true;
    results.value = [];
    const start = (page - 1) * pageSize;

    try {
        const params = new URLSearchParams({
            engine: 'google',
            q,
            start: String(start),
            num: String(pageSize),
            participant_id: String(participantId.value),
        });

        const resp = await apiFetch(`/api/search?${params.toString()}`);
        if (!resp.ok) throw new Error(`Search failed with ${resp.status}`);

        const json = await resp.json();
        const items = json.organic_results || [];
        results.value = items.map(buildResultItem);
        totalResults.value = json.search_information?.total_results || items.length;
        currentPage.value = page;

        emit('log', {
            type: 'traditional-search-returned',
            data: {
                query: q,
                resultsCount: results.value.length,
                resultContent: results.value.map(r => `${r.title} ${r.snippet}`),
                resultURL: results.value.map(r => `${r.link}`),
                page: page,
            },
        });
    } catch (err) {
        error.value = err.message || 'Search failed';
    } finally {
        loading.value = false;
    }
}

function changePage(nextPage) {
    if (nextPage < 1 || nextPage > lastPage.value) return;
    currentPage.value = nextPage;
    performSearch(nextPage);

    emit('log', {
        type: 'traditional-search-page-change',
        data: nextPage
    });
}

function emitLink(item) {
    emit('link-clicked', {
        title: item.title,
        body: '',
        link: item.link
    });

    emit('log', {
        type: 'traditional-search-link-clicked',
        data: item.link
    });
}
</script>
<style>
.tour-selection-mark {
    background-color: #c7d2fe; /* indigo-200 */
    border-radius: 2px;
    box-decoration-break: clone; /* keeps rounded corners consistent across wrapped lines */
    -webkit-box-decoration-break: clone;
}
</style>