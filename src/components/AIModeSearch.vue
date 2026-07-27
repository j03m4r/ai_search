<template>
    <div class="w-full flex flex-col h-full">
        <div class="flex-1 overflow-y-auto flex flex-col gap-2 py-4">

            <div v-for="(msg, i) in messages" :key="i" class="flex"
                :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">

                <!-- USER MESSAGE -->
                <div v-if="msg.role === 'user'"
                    class="max-w-[75%] px-4 py-3 rounded-2xl rounded-tr-sm bg-gray-200 leading-relaxed">
                    {{ msg.text }}
                </div>

                <!-- ASSISTANT MESSAGE -->
                <div v-else class="px-2 py-4 gap-y-2 flex flex-col max-w-[90%]">

                    <template v-if="msg._blocks">

                        <div v-for="(block, bi) in msg._blocks" :key="bi">

                            <!-- HEADING -->
                            <h4 v-if="block.type === 'heading'" class="font-semibold! py-2 text-lg">
                                {{ block.snippet }}
                            </h4>

                            <!-- PARAGRAPH -->
                            <p v-else-if="block.type === 'paragraph'" class="flex flex-wrap items-start gap-1">
                                <span>{{ block.snippet }}</span>

                                <!-- Paragraph citation bubble -->
                                <span v-if="block.refIndexes && block.refIndexes.length" class="relative inline-flex">
                                    <span @click.stop="updateAlignment($event, `${i}-${bi}`)"
                                        class="inline-flex items-center gap-1 bg-gray-200 hover:bg-gray-300 cursor-pointer text-xs rounded-full py-0.5 px-2 ml-1 select-none">
                                        {{ msg.sources[block.refIndexes[0]]?.source ||
                                            msg.sources[block.refIndexes[0]]?.title }}
                                        <span v-if="block.refIndexes.length > 1" class="text-gray-500">
                                            +{{ block.refIndexes.length - 1 }}
                                        </span>
                                    </span>

                                    <!-- Paragraph popup -->
                                    <div v-if="activePopup === `${i}-${bi}`"
                                        class="absolute top-full mt-1 w-100 bg-white border border-gray-300 rounded-xl shadow-xl z-50 overflow-hidden"
                                        :class="popupAlignments[`${i}-${bi}`] === 'right' ? 'right-0' : 'left-0'">
                                        <div
                                            class="px-3 py-2 border-b border-gray-300 flex items-center justify-between">
                                            <span
                                                class="text-xs font-semibold! text-gray-500 uppercase tracking-wide">Sources</span>
                                            <button @click.stop="closePopup"
                                                class="text-gray-300 hover:text-gray-500 text-sm">✕</button>
                                        </div>

                                        <ul class="flex flex-col divide-y divide-gray-300">
                                            <li v-for="ri in block.refIndexes" :key="ri"
                                                class="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                                @click.stop="emitSourceClick(msg.sources[ri]); closePopup()">
                                                <div class="text-sm font-medium text-gray-700 truncate">
                                                    {{ msg.sources[ri]?.title }}
                                                </div>
                                                <div class="text-xs text-blue-600 underline truncate">
                                                    {{ msg.sources[ri]?.link }}
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </span>
                            </p>

                            <!-- TABLE -->
                            <div v-else-if="block.type === 'table' && block.tableData" class="w-full">
                                <table class="w-full border-collapse mt-2">
                                    <thead>
                                        <tr class="bg-gray-100">
                                            <th v-for="col in Object.keys(block.tableData[0])" :key="col"
                                                class="text-left px-3 py-2 border border-gray-300 font-semibold! capitalize">
                                                {{ col.replace(/_/g, ' ') }}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(row, ri) in block.tableData" :key="ri" class="hover:bg-gray-50">
                                            <td v-for="(val, key) in row" :key="key"
                                                class="px-3 py-2 border border-gray-300">
                                                {{ val }}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <!-- LIST -->
                            <div v-else-if="block.type === 'list'">
                                <p v-if="block.snippet">{{ block.snippet }}</p>

                                <ul class="list-disc list-inside flex flex-col gap-1 px-2">
                                    <li v-for="(item, li) in block.items" :key="li"
                                        class="flex flex-wrap items-start gap-1">
                                        <!-- Item text -->
                                        <span class="whitespace-pre-line">
                                            {{ item.text }}
                                        </span>

                                        <!-- Item citation bubble -->
                                        <span v-if="item.refIndexes && item.refIndexes.length"
                                            class="relative inline-flex">
                                            <span @click.stop="updateAlignment($event, `${i}-${bi}-item-${li}`)"
                                                class="inline-flex items-center gap-1 bg-gray-200 hover:bg-gray-300 cursor-pointer text-xs rounded-full py-0.5 px-2 ml-1 select-none">
                                                {{ msg.sources[item.refIndexes[0]]?.source ||
                                                msg.sources[item.refIndexes[0]]?.title }}
                                                <span v-if="item.refIndexes.length > 1" class="text-gray-500">
                                                    +{{ item.refIndexes.length - 1 }}
                                                </span>
                                            </span>

                                            <!-- Item popup -->
                                            <div v-if="activePopup === `${i}-${bi}-item-${li}`"
                                                class="absolute top-full mt-1 w-100 bg-white border border-gray-300 rounded-xl shadow-xl z-50 overflow-hidden"
                                                :class="popupAlignments[`${i}-${bi}-item-${li}`] === 'right' ? 'right-0' : 'left-0'">
                                                <div
                                                    class="px-3 py-2 border-b border-gray-300 flex items-center justify-between">
                                                    <span
                                                        class="text-xs font-semibold! text-gray-500 uppercase tracking-wide">Sources</span>
                                                    <button @click.stop="closePopup"
                                                        class="text-gray-300 hover:text-gray-500 text-sm">✕</button>
                                                </div>

                                                <ul class="flex flex-col divide-y divide-gray-300">
                                                    <li v-for="ri in item.refIndexes" :key="ri"
                                                        class="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                                        @click.stop="emitSourceClick(msg.sources[ri]); closePopup()">
                                                        <div class="text-sm font-medium text-gray-700 truncate">
                                                            {{ msg.sources[ri]?.title }}
                                                        </div>
                                                        <div class="text-xs text-blue-600 underline truncate">
                                                            {{ msg.sources[ri]?.link }}
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                                        </span>
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </template>

                    <template v-else>
                        <p class="text-gray-800">{{ msg.text }}</p>
                    </template>

                </div>
            </div>

            <!-- LOADING -->
            <div v-if="loading" class="flex justify-start">
                <div class="max-w-[70%] px-4 py-3 rounded-2xl text-gray-400 italic">
                    Thinking...
                </div>
            </div>

            <!-- ERROR -->
            <div v-if="error" class="flex justify-start">
                <div class="max-w-[70%] px-4 py-3 rounded-2xl text-[#a94442]">
                    {{ error }}
                </div>
            </div>

            <div ref="messagesEnd"></div>
        </div>

        <!-- INPUT BAR -->
        <form id="search-panel" @submit.prevent="onSubmit" class="flex w-full sticky bottom-0">
            <textarea v-model="query" rows="3" placeholder="Ask anything..." aria-label="Ask"
                class="flex-1 border border-gray-300 rounded-xl py-4 px-6 shadow bg-gray-100 resize-none"
                @keydown="onKeydown" />
            <button type="submit" :disabled="loading || !query.trim()"
                class="absolute right-2 bottom-2 p-3 rounded-full cursor-pointer bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <svg width="18" class="fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path
                        d="M342.6 73.4C330.1 60.9 309.8 60.9 297.3 73.4L137.3 233.4C124.8 245.9 124.8 266.2 137.3 278.7C149.8 291.2 170.1 291.2 182.6 278.7L288 173.3L288 544C288 561.7 302.3 576 320 576C337.7 576 352 561.7 352 544L352 173.3L457.4 278.7C469.9 291.2 490.2 291.2 502.7 278.7C515.2 266.2 515.2 245.9 502.7 233.4L342.7 73.4z" />
                </svg>
            </button>
        </form>

    </div>
</template>


<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";

const messagesEnd = ref(null);

async function scrollToBottom() {
    await nextTick();
    messagesEnd.value?.scrollIntoView({ behavior: "smooth" });
}

const query = ref("");
const loading = ref(false);
const error = ref("");
const messages = ref([]);
const continuationToken = ref(null);

const activePopup = ref(null);
const popupAlignments = ref({});

const emit = defineEmits(["link-clicked", "log"]);

/* -------------------------------------------------------
   Popup helpers
------------------------------------------------------- */
function togglePopup(key) {
    activePopup.value = activePopup.value === key ? null : key;
    emit("log", {
        type: "AI-mode-citation-accessed",
        data: {}
    });
}

function closePopup() {
    activePopup.value = null;
}

function updateAlignment(event, key) {
    const rect = event.currentTarget.getBoundingClientRect();
    const spaceOnRight = window.innerWidth - rect.left;
    popupAlignments.value[key] = spaceOnRight < 300 ? "right" : "left";
    togglePopup(key);
}

function onClickOutside() {
    activePopup.value = null;
}

onMounted(() => document.addEventListener("click", onClickOutside));
onUnmounted(() => document.removeEventListener("click", onClickOutside));

/* -------------------------------------------------------
   Input handling
------------------------------------------------------- */
function onKeydown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSubmit();
    }
}

function onSubmit() {
    const q = String(query.value).trim();
    if (!q) return;

    messages.value.push({ role: "user", text: q });
    query.value = "";
    scrollToBottom();
    performSearch(q);
}

/* -------------------------------------------------------
   URL + reference helpers
------------------------------------------------------- */
function normalizeUrl(url) {
    if (!url) return "";
    return url
        .replace(/^https?:\/\//, "")
        .replace(/\/+$/, "")
        .toLowerCase();
}

function extractRefIndexes(snippetLinks, allRefs) {
    if (!Array.isArray(snippetLinks)) return [];

    const indexes = [];

    snippetLinks.forEach(linkObj => {
        const clean = normalizeUrl(linkObj.link);

        const idx = allRefs.findIndex(r => {
            const refClean = normalizeUrl(r.link);
            return (
                refClean === clean ||
                refClean.startsWith(clean) ||
                clean.startsWith(refClean)
            );
        });

        if (idx !== -1) indexes.push(idx);
    });

    return indexes;
}

function parseTrailingRefCount(text) {
    const match = text.match(/\+(\d+)\s*$/);
    return match ? parseInt(match[1], 10) + 1 : 1;
}

/* -------------------------------------------------------
   LaTeX flattening — AI Mode occasionally returns inline math
   (e.g. "$\text{CO}_{2}$") instead of plain text. We don't
   typeset it, we just strip the markup down to readable text
   (e.g. "CO₂") so raw LaTeX source never reaches the UI.
------------------------------------------------------- */
const LATEX_SUBSCRIPTS = { 0: "₀", 1: "₁", 2: "₂", 3: "₃", 4: "₄", 5: "₅", 6: "₆", 7: "₇", 8: "₈", 9: "₉", x: "ₓ" };
const LATEX_SUPERSCRIPTS = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹", "+": "⁺", "-": "⁻" };
const LATEX_SYMBOLS = {
    "\\times": "×",
    "\\cdot": "·",
    "\\geq": "≥",
    "\\leq": "≤",
    "\\pm": "±",
    "\\approx": "≈",
    "\\neq": "≠",
    "\\rightarrow": "→",
    "\\Rightarrow": "⇒",
    "\\leftarrow": "←",
    "\\infty": "∞"
};

function toScriptChars(chars, map) {
    return chars
        .split("")
        .map(c => map[c.toLowerCase()] ?? c)
        .join("");
}

function flattenLatex(str) {
    if (typeof str !== "string" || !str.includes("\\")) return str;

    let out = str;

    // Strip $$...$$ / $...$ delimiters, but only when the enclosed
    // content actually looks like LaTeX (contains a backslash) —
    // otherwise leave plain "$" currency mentions untouched.
    out = out.replace(/\$\$([^$]*\\[^$]*)\$\$/g, (_, inner) => inner);
    out = out.replace(/\$([^$]*\\[^$]*)\$/g, (_, inner) => inner);

    // \text{...}, \mathrm{...}, etc. -> inner content
    out = out.replace(/\\(?:text|mathrm|mathbf|mathit)\{([^{}]*)\}/g, "$1");

    // subscripts / superscripts
    out = out.replace(/_\{([^{}]+)\}/g, (_, inner) => toScriptChars(inner, LATEX_SUBSCRIPTS));
    out = out.replace(/_([0-9a-zA-Z])/g, (_, c) => toScriptChars(c, LATEX_SUBSCRIPTS));
    out = out.replace(/\^\{([^{}]+)\}/g, (_, inner) => toScriptChars(inner, LATEX_SUPERSCRIPTS));
    out = out.replace(/\^([0-9+-])/g, (_, c) => toScriptChars(c, LATEX_SUPERSCRIPTS));

    // known symbol commands
    Object.entries(LATEX_SYMBOLS).forEach(([cmd, sym]) => {
        out = out.split(cmd).join(sym);
    });

    // generic \command{...} -> inner content, then bare \command -> removed
    out = out.replace(/\\[a-zA-Z]+\{([^{}]*)\}/g, "$1");
    out = out.replace(/\\left|\\right|\\big|\\Big/g, "");
    out = out.replace(/\\[a-zA-Z]+/g, "");

    // leftover braces / whitespace cleanup
    out = out.replace(/[{}]/g, "");
    out = out.replace(/[ \t]+/g, " ").trim();

    return out;
}

function flattenTableData(rows) {
    if (!Array.isArray(rows)) return rows;
    return rows.map(row => {
        if (!row || typeof row !== "object") return row;
        const flatRow = {};
        for (const [key, val] of Object.entries(row)) {
            flatRow[key] = typeof val === "string" ? flattenLatex(val) : val;
        }
        return flatRow;
    });
}

/* -------------------------------------------------------
   Nested list-item flattening (list items can themselves be
   sub-blocks like { text_blocks: [...] } instead of a flat
   { text } / { snippet } string field)
------------------------------------------------------- */
function flattenTextBlocks(tbArray) {
    const lines = [];
    let links = [];

    (tbArray || []).forEach(tb => {
        if ((tb.type === "heading" || tb.type === "paragraph") && (tb.snippet ?? tb.text)) {
            lines.push(flattenLatex(String(tb.snippet ?? tb.text).trim()));
            links = links.concat(tb.snippet_links || []);
            return;
        }

        if (tb.type === "list") {
            const inner = tb.list || tb.items || tb.list_items || [];
            inner.forEach(it => {
                const flat = flattenListItem(it);
                if (flat.text) lines.push(flat.text);
                links = links.concat(flat.links);
            });
            return;
        }

        if (Array.isArray(tb.text_blocks)) {
            const nested = flattenTextBlocks(tb.text_blocks);
            if (nested.text) lines.push(nested.text);
            links = links.concat(nested.links);
        }
    });

    return { text: lines.join("\n"), links };
}

function flattenListItem(it) {
    if (typeof it === "string") return { text: flattenLatex(it.trim()), links: [] };

    if (it?.text ?? it?.snippet) {
        return { text: flattenLatex(String(it.text ?? it.snippet).trim()), links: it.snippet_links || [] };
    }

    if (Array.isArray(it?.text_blocks)) {
        return flattenTextBlocks(it.text_blocks);
    }

    if (it?.title) {
        return { text: flattenLatex(String(it.title).trim()), links: it.snippet_links || [] };
    }

    return { text: "", links: [] };
}

/* -------------------------------------------------------
   NORMALIZATION
------------------------------------------------------- */
function normalizeBlock(b, refs) {
    const text = flattenLatex(b.text ?? b.snippet ?? "");
    const snippet = flattenLatex(b.snippet ?? b.text ?? "");
    const snippetLinks = b.snippet_links || [];

    let refIndexes = extractRefIndexes(snippetLinks, refs);

    if (refIndexes.length > 0 && /\+\d+$/.test(snippet)) {
        const count = parseTrailingRefCount(snippet);
        const start = refIndexes[0];
        refIndexes = Array.from({ length: count }, (_, i) => start + i);
    }

    // LIST BLOCK
    if (b.type === "list") {
        const rawItems = b.list || b.items || b.list_items || [];

        const items = rawItems.map(it => {
            const flat = flattenListItem(it);
            const itemText = flat.text;
            const itemLinks = flat.links;

            let itemRefs = extractRefIndexes(itemLinks, refs);

            if (itemRefs.length > 0 && /\+\d+$/.test(itemText)) {
                const count = parseTrailingRefCount(itemText);
                const start = itemRefs[0];
                itemRefs = Array.from({ length: count }, (_, i) => start + i);
            }

            return {
                text: itemText,
                snippet: itemText,
                refIndexes: itemRefs
            };
        });

        return {
            type: "list",
            text,
            snippet,
            items,
            refIndexes
        };
    }

    // PARAGRAPH / HEADING
    if (b.type === "paragraph" || b.type === "heading") {
        return {
            type: b.type,
            text,
            snippet,
            items: [],
            refIndexes
        };
    }

    // TABLE BLOCK (future-proof)
    if (b.type === "table") {
        return {
            type: "table",
            tableData: flattenTableData(b.table || b.rows || []),
            text,
            snippet,
            items: [],
            refIndexes
        };
    }

    return null;
}

/* -------------------------------------------------------
   performSearch — now stable across all AI Mode schemas
------------------------------------------------------- */
// async function performSearch(q) {
//   loading.value = true;
//   error.value = "";

//   let blocks = [];

//   try {
//     const API_BASE = import.meta.env.PROD
//       ? window.location.origin
//       : "http://localhost:3001";

//     const url = new URL("/api/serp", API_BASE);

//     url.searchParams.set("engine", "google_ai_mode");
//     url.searchParams.set("q", q);

//     if (!continuationToken.value) {
//       url.searchParams.set("continuable", "true");
//     } else {
//       url.searchParams.set(
//         "subsequent_request_token",
//         continuationToken.value
//       );
//     }

//     const resp = await fetch(url.toString());
//     if (!resp.ok) throw new Error(`SerpApi responded with ${resp.status}`);

//     const json = await resp.json();
//     console.log("AI Mode raw JSON:", json);

//     if (json.subsequent_request_token) {
//       continuationToken.value = json.subsequent_request_token;
//     }

//     const refs = json.references || [];

//     blocks = (json.text_blocks || [])
//       .map(b => normalizeBlock(b, refs))
//       .filter(Boolean);

//     messages.value.push({
//       role: "assistant",
//       _blocks: blocks,
//       sources: refs
//     });

//     scrollToBottom();
//   } catch (err) {
//     error.value = err.message || "AI Mode search failed";
//   } finally {
//     loading.value = false;

//     emit("log", {
//       timestamp: Date.now(),
//       action: "ai-mode-query-sent",
//       payload: { query: q, results: blocks }
//     });
//   }
// }

import { apiFetch } from "@/lib/api";
import { useParticipant } from "@/composables/useParticipant";

const { participantId } = useParticipant();

async function performSearch(q) {
    loading.value = true;
    error.value = "";
    let blocks = [];

    try {
        const params = new URLSearchParams({
            engine: 'google_ai_mode',
            q,
            participant_id: String(participantId.value),
        });

        if (!continuationToken.value) {
            params.set('continuable', 'true');
        } else {
            params.set('subsequent_request_token', continuationToken.value);
        }

        const resp = await apiFetch(`/api/search?${params.toString()}`);
        if (!resp.ok) throw new Error(`Search failed with ${resp.status}`);

        const json = await resp.json();
        if (json.subsequent_request_token) {
            continuationToken.value = json.subsequent_request_token;
        }

        const refs = json.references || [];
        blocks = (json.text_blocks || []).map(b => normalizeBlock(b, refs)).filter(Boolean);
        messages.value.push({ role: "assistant", _blocks: blocks, sources: refs });
        scrollToBottom();
    } catch (err) {
        error.value = err.message || "AI Mode search failed";
    } finally {
        loading.value = false;
        emit("log", {
            type: "ai-mode-query-sent",
            data: { query: q, results: blocks },
        });
    }
}

/* -------------------------------------------------------
  Source click handler
------------------------------------------------------- */
function emitSourceClick(src) {
    if (!src) return;
    emit("link-clicked", { title: src.title, link: src.link });
    window.open(src.link, "_blank", "noopener,noreferrer");

    emit("log", {
        type: "ai-mode-citation-visited",
        data: src.link
    });
}
</script>
