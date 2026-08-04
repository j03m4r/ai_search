<script setup>
    import { ref, onMounted, watch, onUnmounted, computed } from 'vue';
    import { VueFlow, useVueFlow, Panel } from '@vue-flow/core';
    import LikertScale from './LikertScale.vue';
    import { Background } from '@vue-flow/background';
    import '@vue-flow/core/dist/style.css';
    import '@vue-flow/core/dist/theme-default.css';
    import { useParticipant } from '@/composables/useParticipant.js';

    const nodes = ref([]);
    const log = ref([]);
    const trash = ref([]);
    const showTrash = ref(false);
    const pendingCategory = ref(false);
    const pendingCategoryTitle = ref('');

    const props = defineProps({
        hideButtons: { type: Boolean, default: false },
    });

    const emit = defineEmits(["updateRepresentation"]);

    const { findNode, getNodes, viewport, zoomTo } = useVueFlow();
    const { submitLog, fetchSubmittedAt } = useParticipant();

    function parseSqliteTimestamp(ts) {
        return new Date(ts.replace(' ', 'T') + 'Z');
    }

    const created_at = ref(null);
    const now = ref(Date.now());
    let tickInterval = null;

    const MIN_ZOOM = 0.5;
    const MAX_ZOOM = 2;

    const zoomLevel = computed({
        get: () => viewport.value.zoom,
        set: (val) => zoomTo(val),
    });

    const remainingMs = computed(() => {
        if (!created_at.value) return null;
        const elapsed = now.value - created_at.value.getTime();
        return Math.max(0, 10 * 60 * 1000 - elapsed);
    });

    const canSkipTime = ref(false)
    const canConclude = computed(() => canSkipTime.value||(remainingMs.value !== null && remainingMs.value <= 0));

    onMounted(async () => {
        // Fetch canvas state from localStorage
        if (props.hideButtons) return

        nodes.value = JSON.parse(localStorage.getItem("rep_nodes")) || []
        trash.value = JSON.parse(localStorage.getItem("rep_trash")) || []
        log.value = JSON.parse(localStorage.getItem("rep_log")) || []

        _updateRepresentation();

        if (props.hideButtons) return;

        tickInterval = setInterval(() => { now.value = Date.now(); }, 1000);

        canSkipTime.value = localStorage.getItem("skip") === "true"

        try {
            const _created_at = await fetchSubmittedAt();
            if (_created_at) created_at.value = parseSqliteTimestamp(_created_at);
        } catch (err) {
            console.error('Failed to fetch pre-task submission time', err);
        }
    });

    onUnmounted(() => {
        if (tickInterval) clearInterval(tickInterval);
    });

    function _updateRepresentation() {
        const categories = nodes.value
            .filter(n => n.type === 'category')
            .map(cat => ({
                id: cat.id,
                title: cat.data.label,
                importance: cat.data.importance,
                position: { ...cat.position },
                evidence: cat.data.items.map(i => ({
                    id: i.id,
                    text: i.text,
                    body: i.body,
                    source: i.source
                }))
            }));

        emit('updateRepresentation', categories)
    }

    function addLog(type, payload = {}) {
        _updateRepresentation();

        // Save canvas state to localStorage
        localStorage.setItem("rep_nodes", JSON.stringify(nodes.value))
        localStorage.setItem("rep_trash", JSON.stringify(trash.value))
        localStorage.setItem("rep_log", JSON.stringify(log.value))

        if (props.hideButtons) return

        const timestamp = Date.now()
        const entry = { timestamp: timestamp, type: type, data: payload };
        log.value.push(entry);

        submitLog(type, timestamp, payload)
    }

    function addCategory(title) {
        // Clear the pending category state
        pendingCategory.value = false;
        pendingCategoryTitle.value = '';

        const id = crypto.randomUUID();
        nodes.value = [
            ...nodes.value,
            {
                id,
                type: 'category',
                position: { x: 80 + Math.random() * 200, y: 80 + Math.random() * 200 },
                data: { label: title, items: [], importance: 0 },
                dragHandle: '.drag-handle',
                style: { width: '300px' },
            }
        ];

        addLog('category-created', { id, title: title, importance: 0 });
    }

    function startCategoryAdd() {
        pendingCategory.value = true;
    }

    function deleteCategory(id) {
        if (id === TOUR_CATEGORY_ID) return;

        const node = nodes.value.find(n => n.id === id);
        if (!node) return;

        node.data.items.forEach(item => {
            nodes.value = [...nodes.value, {
                id: item.id,
                type: 'evidence',
                position: { x: node.position.x + 20 + Math.random() * 60, y: node.position.y + 20 + Math.random() * 60 },
                data: { ...item },
                dragHandle: '.drag-handle',
                style: { width: '220px' },
            }];
        });

        nodes.value = nodes.value.filter(n => n.id !== id);
        trash.value.unshift({ type: 'category', item: { id, data: { ...node.data, items: [] }, position: { ...node.position } }, deletedAt: Date.now() });
        addLog('category-deleted', { id });
    }

    function updateCategoryImportance(id, importance) {
        if (id === TOUR_CATEGORY_ID) return;

        const node = nodes.value.find(n => n.id === id);
        if (!node) return;
        if (node.data.importance === importance) return;

        node.data.importance = importance;
        addLog('category-importance-updated', { categoryId: id, importance: importance });
    }

    function addEvidence() {
        const id = crypto.randomUUID();
        nodes.value = [...nodes.value, {
            id,
            type: 'evidence',
            position: { x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 },
            data: { text: '[edit label here]', body: '', source: 'User', expanded: false },
            dragHandle: '.drag-handle',
            style: { width: '220px' },
        }];
        addLog('evidence-created', { id });
    }

    function deleteEvidence(id) {
        const node = nodes.value.find(n => n.id === id);
        if (!node) return;
        nodes.value = nodes.value.filter(n => n.id !== id);
        trash.value.unshift({ type: 'evidence', item: { id, data: { ...node.data }, position: { ...node.position } }, deletedAt: Date.now() });
        addLog('evidence-deleted', { id });
    }

    // Remove evidence from inside a category and eject it back to the canvas
    function ejectEvidence(catId, itemId) {
        if (catId === TOUR_CATEGORY_ID) return;

        const catNode = findNode(catId);
        if (!catNode) return;

        const item = catNode.data.items.find(i => i.id === itemId);
        if (!item) return;

        catNode.data.items = catNode.data.items.filter(i => i.id !== itemId);

        nodes.value = [...nodes.value, {
            id: itemId,
            type: 'evidence',
            position: { x: catNode.position.x + 320, y: catNode.position.y },
            data: { ...item },
            dragHandle: '.drag-handle',
            style: { width: '220px' },
        }];

        addLog('evidence-unassigned', { evidenceId: itemId, categoryId: catId });
    }

    // Delete evidence that's inside a category (not a standalone node)
    function deleteEvidenceInCategory(catId, itemId) {
        if (catId === TOUR_CATEGORY_ID) return;

        const catNode = findNode(catId);
        if (!catNode) return;
        const item = catNode.data.items.find(i => i.id === itemId);
        if (!item) return;

        catNode.data.items = catNode.data.items.filter(i => i.id !== itemId);
        trash.value.unshift({ type: 'evidence', item: { id: itemId, data: { ...item }, position: { ...catNode.position } }, deletedAt: Date.now() });
        addLog('evidence-deleted', { id: itemId });
    }

    // function clampToCanvas(node) {
    //     const vueFlowEl = document.querySelector('.vue-flow__transformationpane')?.parentElement;
    //     if (!vueFlowEl) return;

    //     const { width, height } = vueFlowEl.getBoundingClientRect();
    //     const nodeW = node.dimensions?.width || 300;
    //     const nodeH = node.dimensions?.height || 160;

    //     node.position.x = Math.min(Math.max(0, node.position.x), width - nodeW);
    //     node.position.y = Math.min(Math.max(0, node.position.y), height - nodeH);
    // }
    function clampToCanvas(node) {
        const vueFlowEl = document.querySelector('.vue-flow__transformationpane')?.parentElement;
        if (!vueFlowEl) return;

        const { width, height } = vueFlowEl.getBoundingClientRect(); // screen-space, correct as-is
        const { x: panX, y: panY, zoom } = viewport.value;

        // Convert the visible screen-space container into flow-space bounds
        const minX = -panX / zoom;
        const minY = -panY / zoom;
        const maxX = (width - panX) / zoom;
        const maxY = (height - panY) / zoom;

        const nodeW = node.dimensions?.width || 300;
        const nodeH = node.dimensions?.height || 160;

        node.position.x = Math.min(Math.max(minX, node.position.x), maxX - nodeW);
        node.position.y = Math.min(Math.max(minY, node.position.y), maxY - nodeH);
    }

    function onNodeDrag({ node }) {
        // if (node.type !== 'category') return;
        clampToCanvas(node);
    }

    // Re-clamp categories whenever their rendered size changes (e.g. an
    // evidence item inside is expanded/collapsed) — not just while dragging.
    // Otherwise a category that grows near the canvas edge gets clipped
    // off-screen with no drag gesture available to pull it back.
    watch(
        () => getNodes.value
            .filter(n => n.type === 'category')
            .map(n => `${n.id}:${n.dimensions?.width}x${n.dimensions?.height}`)
            .join(','),
        () => {
            getNodes.value.forEach(node => {
                if (node.type === 'category') clampToCanvas(node);
            });
        }
    );

    function onNodeDragStop({ node }) {
        if (node.type !== 'evidence') {
            // addLog('category-position-updated', { categoryId: node.id, position: node.position });
            return;
        }

        const absPos = { ...node.position };

        const matched = nodes.value
            .filter(n => n.type === 'category')
            .find(cat => {
                const catNode = findNode(cat.id);
                if (!catNode) return false;
                const { x, y } = catNode.position;
                const w = catNode.dimensions?.width || 300;
                const h = catNode.dimensions?.height || 200;
                return absPos.x >= x && absPos.x <= x + w && absPos.y >= y && absPos.y <= y + h;
            });

        if (matched) {
            const catNode = findNode(matched.id);
            if (!catNode) return;

            catNode.data.items = [...catNode.data.items, { ...node.data, id: node.id }];
            nodes.value = nodes.value.filter(n => n.id !== node.id);
            addLog('evidence-assigned', { evidenceId: node.id, categoryId: matched.id });
        }
    }

    function restoreItem(trashEntry) {
        const { type, item } = trashEntry;
        const id = crypto.randomUUID();

        if (type === 'category') {
            nodes.value = [...nodes.value, {
                id, type: 'category',
                position: item.position || { x: 100, y: 100 },
                data: { ...item.data, items: [] },
                dragHandle: '.drag-handle',
                style: { width: '300px' },
            }];
            addLog('category-restored', { id });
        } else {
            nodes.value = [...nodes.value, {
                id, type: 'evidence',
                position: item.position || { x: 200, y: 200 },
                data: { ...item.data, expanded: false },
                dragHandle: '.drag-handle',
                style: { width: '220px' },
            }];
            addLog('evidence-restored', { id });
        }

        trash.value = trash.value.filter(t => t !== trashEntry);
    }

    function addEvidenceFromLink(payload) {
        const id = crypto.randomUUID();
        nodes.value = [...nodes.value, {
            id,
            type: 'evidence',
            position: { x: 160 + Math.random() * 200, y: 160 + Math.random() * 200 },
            data: { text: payload.title || payload.link || 'New Link', url: payload.link, source: payload.link || 'User', body: payload.body, expanded: true },
            dragHandle: '.drag-handle',
            style: { width: '220px' },
        }];

        addLog('evidence-created-from-link', { id, ...payload });
    }

    function addEvidenceFromText(payload) {
        const id = crypto.randomUUID();

        const match = log.value.find(entry =>
            entry.data?.resultContent?.some(s => s.includes(payload.text))
        );
        const source = match ? `${match.data.query}-synthesis` : null;

        nodes.value = [...nodes.value, {
            id,
            type: 'evidence',
            position: { x: 160 + Math.random() * 200, y: 160 + Math.random() * 200 },
            data: { text: payload.text, url: null, source: source ? source : 'Search Interface', body: "", expanded: true },
            dragHandle: '.drag-handle',
            style: { width: '220px' },
        }];
        addLog('evidence-created-from-text', { id, ...payload });
    }

    function confirmFinish() {
        const ok = window.confirm("Are you sure you want to finish the task?");
        if (!ok) return;

        // Build a full snapshot of the current state
        const categories = nodes.value
            .filter(n => n.type === 'category')
            .map(cat => ({
                id: cat.id,
                title: cat.data.label,
                importance: cat.data.importance,
                position: { ...cat.position },
                evidence: cat.data.items.map(i => ({
                    id: i.id,
                    text: i.text,
                    body: i.body,
                    source: i.source
                }))
            }));

        const evidence = nodes.value
            .filter(n => n.type === 'evidence')
            .map(ev => ({
                id: ev.id,
                text: ev.data.text,
                body: ev.data.body,
                source: ev.data.source,
                position: { ...ev.position }
            }));

        const snapshot = {
            categories,
            evidence
        };

        // Log the snapshot
        addLog("final-state-snapshot", snapshot);
    }

    const showTooltip = ref(false);
    const concludeBtnRef = ref(null);
    const tooltipStyle = ref({});

    watch(showTooltip, (visible) => {
        if (!visible || !concludeBtnRef.value) return;
        const rect = concludeBtnRef.value.getBoundingClientRect();
        tooltipStyle.value = {
            left: `${rect.left + rect.width / 2}px`,
            top: `${rect.bottom + 8}px`,
            transform: 'translateX(-50%)',
        };
    });

    const TOUR_CATEGORY_ID = 'ex-cat';
    const TOUR_EVIDENCE1_ID = 'ex-ev1';
    const TOUR_EVIDENCE2_ID = 'ex-ev2';

    function spawnTourExample() {
        nodes.value = [
            ...nodes.value,
            {
                id: TOUR_CATEGORY_ID,
                type: 'category',
                position: { x: 80, y: 80 },
                data: {
                    label: 'Example Category',
                    importance: 2,
                    items: [
                        { id: TOUR_EVIDENCE1_ID, text: 'Example evidence 1', body: 'Details go here.', source: 'Tutorial' },
                        { id: TOUR_EVIDENCE2_ID, text: 'Example evidence 2', body: 'Details go here.', source: 'Tutorial' }
                    ],
                },
                dragHandle: '.drag-handle',
                style: { width: '300px' },
            },
        ];
    }

    function despawnTourExample() {
        nodes.value = nodes.value.filter(
            (n) => n.id !== TOUR_CATEGORY_ID && n.id !== TOUR_EVIDENCE1_ID && n.id !== TOUR_EVIDENCE2_ID
        );
    }

    import { useTour } from '@/composables/useTour.js';
    const { startRepresentationTour } = useTour();
    function tutorial() {
        addLog("tutorial-clicked");
        startRepresentationTour(spawnTourExample, despawnTourExample, () => {});
    }

    defineExpose({ addEvidenceFromLink, addEvidenceFromText, addLog });
</script>

<template>
    <div class="w-screen h-screen fixed top-0 left-0 z-50 bg-black/50 flex items-center justify-center" v-if="pendingCategory">
        <div class="bg-white p-4 rounded-xl shadow-lg w-xs flex flex-col justify-center items-start gap-y-2!">
            <p class="text-sm text-gray-700">Enter a title for this category (you can edit this later too)</p>
            <input type="text" class="border border-gray-300 rounded-lg px-3 py-1.5 w-full" placeholder="Category title..." v-model="pendingCategoryTitle" />
            <button @click="() => addCategory(pendingCategoryTitle)" :disabled="pendingCategoryTitle.length < 2" class="disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer w-full bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors">Submit</button>
        </div>
    </div>
    <div class="w-full h-full relative p-2">
        <VueFlow v-model:nodes="nodes" :nodes-connectable="true" :connect-on-click="false" :zoom-on-scroll="true"
            :zoom-on-pinch="false" :zoom-on-double-click="false" :pan-on-drag="true" :pan-on-scroll="false"
            :auto-pan-on-node-drag="false" :prevent-scrolling="true" :elevate-nodes-on-select="true" :delete-key-code="null"
            no-drag-class-name="no-drag" class="bg-[#faf9f6] border border-gray-300 rounded-xl shadow-xl"
            @node-drag-stop="onNodeDragStop" @node-drag="onNodeDrag">
            <Background variant="dots" :gap="24" :size="1.2" pattern-color="#000"></Background>

            <template #node-category="{ id, data }">
                <div class="bg-white border rounded-xl shadow-lg flex flex-col w-75"
                    :id="id"
                    :class="{ 'border-indigo-300': data.importance === 0, 'border-indigo-400': data.importance === 1, 'border-indigo-500': data.importance === 2, 'border-indigo-600': data.importance === 3, 'border-indigo-700': data.importance === 4 }">

                    <div class="drag-handle flex items-center justify-between gap-2 px-4 py-3 border-b cursor-grab active:cursor-grabbing rounded-t-xl transition-colors bg-indigo-50"
                        :class="{ 'border-b-indigo-300': data.importance === 0, 'border-b-indigo-400': data.importance === 1, 'border-b-indigo-500': data.importance === 2, 'border-b-indigo-600': data.importance === 3, 'border-b-indigo-700': data.importance === 4 }">
                        <div class="flex-1 flex items-center justify-left gap-2 min-w-0" :id="id==='ex-cat'?'tour-rename-cat':'undefined'">
                            <input :value="data.label" @input="data.label = $event.target.value" :disabled="id === TOUR_CATEGORY_ID"
                                @change="addLog('category-renamed', { id, label: data.label })"
                                class="no-drag flex-1 font-bold! bg-transparent border-none outline-none text-black"
                                placeholder="Category name..." />
                        </div>

                        <button title="Delete" @click="deleteCategory(id)"
                            :id="id === 'ex-cat' ? 'tour-delete-cat' : 'undefined'"
                            class="group bg-transparent border p-2 rounded-lg border-indigo-300 hover:bg-indigo-100 cursor-pointer flex leading-none transition-colors">
                            <svg class="" width="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                                <path
                                    d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z" />
                            </svg>
                        </button>
                    </div>

                    <div class="cursor-pointer flex items-center justify-between gap-2 px-4 py-2! border-b no-drag! z-40 transition-colors bg-indigo-50" :id="id==='ex-cat'?'tour-importance-cat':'undefined'"
                        :class="{ 'border-b-indigo-300': data.importance === 0, 'border-b-indigo-400': data.importance === 1, 'border-b-indigo-500': data.importance === 2, 'border-b-indigo-600': data.importance === 3, 'border-b-indigo-700': data.importance === 4 }">
                        <LikertScale @updateImportance="updateCategoryImportance" :importance="data.importance" :id="id"
                            :name="'Importance'" />
                    </div>

                    <div class="flex flex-col gap-2 p-2 min-h-24" :id="id==='ex-cat'?'tour-evidence-pool':'undefined'" :class="{ 'min-h-fit': data.items.length }">
                        <div v-if="data.items.length === 0"
                            class="text-sm h-20 text-gray-300 text-center justify-center items-center flex py-3 border-2 border-dashed border-gray-300 rounded-lg select-none">
                            drop evidence here
                        </div>

                        <div v-for="item in data.items" :key="item.id"
                            class="bg-amber-50 border border-amber-300 rounded-lg overflow-hidden">
                            <div class="flex items-center justify-between gap-2 px-4 py-3">
                                <button @click.stop="item.expanded = !item.expanded" :disabled="item.id === TOUR_EVIDENCE1_ID || item.id === TOUR_EVIDENCE2_ID"
                                    class="shrink-0 w-4 h-4 bg-transparent border-0 cursor-pointer p-0 transition-colors flex items-center justify-center">
                                    <svg v-if="item.expanded" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"
                                        width="18" fill="currentColor">
                                        <path
                                            d="M297.4 438.6C309.9 451.1 330.2 451.1 342.7 438.6L502.7 278.6C515.2 266.1 515.2 245.8 502.7 233.3C490.2 220.8 469.9 220.8 457.4 233.3L320 370.7L182.6 233.4C170.1 220.9 149.8 220.9 137.3 233.4C124.8 245.9 124.8 266.2 137.3 278.7L297.3 438.7z" />
                                    </svg>
                                    <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="18"
                                        fill="currentColor">
                                        <path
                                            d="M438.6 297.4C451.1 309.9 451.1 330.2 438.6 342.7L278.6 502.7C266.1 515.2 245.8 515.2 233.3 502.7C220.8 490.2 220.8 469.9 233.3 457.4L370.7 320L233.4 182.6C220.9 170.1 220.9 149.8 233.4 137.3C245.9 124.8 266.2 124.8 278.7 137.3L438.7 297.3z" />
                                    </svg>
                                </button>
                                <input :value="item.text" @input="item.text = $event.target.value" :disabled="item.id === TOUR_EVIDENCE1_ID || item.id === TOUR_EVIDENCE2_ID"
                                    @change="addLog('evidence-renamed', { id: item.id, text: item.text })" :id="item.id === TOUR_EVIDENCE1_ID ? 'tour-rename-ev' : 'undefined'"
                                    class="flex-1 min-w-0 font-semibold! bg-transparent border-none outline-none text-black" />
                                <button @click.stop="ejectEvidence(id, item.id)" title="Remove from category" :id="item.id==='ex-ev1'?'tour-eject-evidence':'undefined'"
                                    class="group bg-transparent border p-2 rounded-lg border-amber-300 hover:bg-amber-100 cursor-pointer flex leading-none transition-colors">
                                    <svg width="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                                        <path
                                            d="M160 512C142.3 512 128 526.3 128 544C128 561.7 142.3 576 160 576L256 576C309 576 352 533 352 480L352 173.3L425.4 246.7C437.9 259.2 458.2 259.2 470.7 246.7C483.2 234.2 483.2 213.9 470.7 201.4L342.7 73.4C330.2 60.9 309.9 60.9 297.4 73.4L169.4 201.4C156.9 213.9 156.9 234.2 169.4 246.7C181.9 259.2 202.2 259.2 214.7 246.7L288 173.3L288 480C288 497.7 273.7 512 256 512L160 512z" />
                                    </svg>
                                </button>
                                <button @click.stop="deleteEvidenceInCategory(id, item.id)" title="Delete" :id="item.id==='ex-ev1'?'tour-delete-evidence':'undefined'"
                                    class="group bg-transparent border p-2 rounded-lg border-amber-300 hover:bg-amber-100 cursor-pointer flex leading-none transition-colors">
                                    <svg width="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                                        <path
                                            d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z" />
                                    </svg>
                                </button>
                            </div>

                            <div v-if="item.expanded"
                                class="border-t border-amber-300 px-2 py-2 flex flex-col gap-2 bg-white">
                                <div>
                                    <label class="text-xs uppercase tracking-wide">Details</label>
                                    <textarea :value="item.body" @input="item.body = $event.target.value"
                                        @change="addLog('evidence-body-updated', { id: item.id, body: item.body })"
                                        placeholder="Add information here... Details, reasoning for inclusion, etc."
                                        class="w-full min-h-20 resize-y text-sm border border-gray-300 rounded p-2 bg-white outline-none mt-0.5"></textarea>
                                </div>
                                <div>
                                    <label class="text-xs uppercase tracking-wide">Source</label>
                                    <input :value="item.source" @input="item.source = $event.target.value"
                                        @change="addLog('evidence-source-updated', { id, source: data.source })"
                                        placeholder="Source of information"
                                        class="w-full text-sm border border-gray-300 rounded p-2 bg-white outline-none mt-0.5" />
                                </div>
                                <!-- <a v-if="item.url" :href="item.url" target="_blank"
                                    class="text-[10px] text-blue-500 hover:underline truncate">{{ item.url }}</a> -->
                            </div>
                        </div>
                    </div>

                </div>
            </template>

            <template #node-evidence="{ id, data }">
                <div class="bg-amber-50 border border-amber-300 rounded-lg shadow-sm overflow-hidden w-65 z-30">
                    <div
                        class="drag-handle flex items-center justify-between gap-2 px-4 py-3 cursor-grab active:cursor-grabbing">
                        <button @click.stop="data.expanded = !data.expanded"
                            class="shrink-0 w-4 h-4 bg-transparent border-0 cursor-pointer p-0 transition-colors flex items-center justify-center">
                            <svg v-if="data.expanded" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"
                                width="18" fill="currentColor">
                                <path
                                    d="M297.4 438.6C309.9 451.1 330.2 451.1 342.7 438.6L502.7 278.6C515.2 266.1 515.2 245.8 502.7 233.3C490.2 220.8 469.9 220.8 457.4 233.3L320 370.7L182.6 233.4C170.1 220.9 149.8 220.9 137.3 233.4C124.8 245.9 124.8 266.2 137.3 278.7L297.3 438.7z" />
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="18"
                                fill="currentColor">
                                <path
                                    d="M438.6 297.4C451.1 309.9 451.1 330.2 438.6 342.7L278.6 502.7C266.1 515.2 245.8 515.2 233.3 502.7C220.8 490.2 220.8 469.9 233.3 457.4L370.7 320L233.4 182.6C220.9 170.1 220.9 149.8 233.4 137.3C245.9 124.8 266.2 124.8 278.7 137.3L438.7 297.3z" />
                            </svg>
                        </button>
                        <input :value="data.text" @input="data.text = $event.target.value"
                            @change="addLog('evidence-renamed', { id, text: data.text })"
                            class="no-drag flex-1 min-w-0 font-semibold! bg-transparent border-none outline-none text-black" />
                        <button title="Delete" @click.stop="deleteEvidence(id)"
                            class="group bg-transparent border p-2 rounded-lg border-amber-300 hover:bg-amber-100 cursor-pointer flex leading-none transition-colors">
                            <svg width="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                                <path
                                    d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z" />
                            </svg>
                        </button>
                    </div>
                    <div v-if="data.expanded" class="border-t border-amber-300 px-2 py-2 flex flex-col gap-2 bg-white">
                        <div>
                            <label class="text-xs uppercase tracking-wide">Details</label>
                            <textarea :value="data.body" @input="data.body = $event.target.value"
                                @change="addLog('evidence-body-updated', { id, body: data.body })"
                                placeholder="Add information here... Details, reasoning for inclusion, etc."
                                class="w-full min-h-20 resize-y text-sm border border-gray-300 rounded p-2 bg-white outline-none mt-0.5"></textarea>
                        </div>
                        <div>
                            <label class="text-xs uppercase tracking-wide">Source</label>
                            <input :value="data.source" @input="data.source = $event.target.value"
                                @change="addLog('evidence-source-updated', { id, source: data.source })"
                                placeholder="Source of information"
                                class="w-full text-sm border border-gray-300 rounded p-2 bg-white outline-none mt-0.5" />
                        </div>
                        <!-- <a v-if="data.url" :href="data.url" target="_blank"
                            class="text-[10px] text-blue-500 hover:underline truncate">
                            {{ data.url }}
                        </a> -->
                    </div>
                </div>
            </template>

            <Panel position="top-left">
                <div class="flex gap-2 bg-white rounded-xl shadow-md border border-gray-300 px-3 py-2">
                    <button @click="startCategoryAdd" id="tour-add-cat"
                        class="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 border-indigo-500 text-white rounded-lg font-semibold! cursor-pointer transition-colors flex gap-x-1.5">
                        <svg width="12" class="fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                            <path
                                d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z" />
                        </svg>
                        Category
                    </button>
                    <button @click="addEvidence" id="tour-add-ev"
                        class="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 border-amber-400 rounded-lg font-semibold! cursor-pointer transition-colors flex gap-x-1.5">
                        <svg width="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                            <path
                                d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z" />
                        </svg>
                        Evidence
                    </button>
                    <button :hidden="hideButtons" @click="showTrash = !showTrash"
                        class="px-3 py-1.5 hover:bg-gray-100 border border-gray-300 rounded-lg cursor-pointer transition-colors flex gap-x-1.5">
                        <svg width="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                            <path
                                d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z" />
                        </svg>
                        Toggle Trash
                    </button>
                    <button @click="tutorial"
                        class="px-3 py-1.5 hover:bg-gray-100 border border-gray-300 rounded-lg cursor-pointer transition-colors flex gap-x-1.5">
                        Tutorial
                    </button>
                    <button id="conclude-task-btn" :hidden="hideButtons" @click="confirmFinish" :disabled="!canConclude"
                        ref="concludeBtnRef"
                        class="px-3 py-1.5 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">
                        Conclude Task
                    </button>
                </div>
            </Panel>
        </VueFlow>

        <div class="absolute top-4 right-4 z-40 bg-white border border-gray-300 rounded-xl shadow-md p-2 flex flex-col items-center gap-2">
            <!-- <span class="text-xs text-gray-500">{{ Math.round(zoomLevel * 100) }}%</span> -->
            <input
                type="range"
                :min="MIN_ZOOM"
                :max="MAX_ZOOM"
                step="0.01"
                v-model.number="zoomLevel"
                class="zoom-slider"
            />
        </div>

        <div v-if="showTrash"
            class="absolute right-5 bottom-5 w-100 max-h-75 overflow-y-auto bg-white border border-gray-300 rounded-xl shadow-2xl z-50">
            <h3 class="font-bold! border-b border-gray-300 px-3 py-2 sticky top-0 bg-white">Trash</h3>
            <div class="px-3">
                <div v-if="trash.length === 0" class="text-gray-400 text-sm my-2!">Trash is empty</div>
                <div v-for="t in trash" :key="t.deletedAt" class="py-2 border-b border-gray-300 last:border-0">
                    <div class="flex items-center justify-between gap-2">
                        <div class="min-w-0">
                            <span class="uppercase text-sm text-gray-400">{{ t.type }}</span>
                            <span class="block truncate">{{ t.item.data?.label || t.item.data?.text }}</span>
                            <span class="text-gray-400 text-sm">{{ new
                                Date(t.deletedAt).toLocaleString().split(",")[1].slice(1)
                            }}</span>
                        </div>
                        <button @click="restoreItem(t)"
                            class="shrink-0 px-2 py-1 bg-green-500 hover:bg-green-600 text-white border-none rounded-lg cursor-pointer transition-colors flex gap-x-1.5">
                            <svg width="12" class="fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                                <path
                                    d="M160 512C142.3 512 128 526.3 128 544C128 561.7 142.3 576 160 576L256 576C309 576 352 533 352 480L352 173.3L425.4 246.7C437.9 259.2 458.2 259.2 470.7 246.7C483.2 234.2 483.2 213.9 470.7 201.4L342.7 73.4C330.2 60.9 309.9 60.9 297.4 73.4L169.4 201.4C156.9 213.9 156.9 234.2 169.4 246.7C181.9 259.2 202.2 259.2 214.7 246.7L288 173.3L288 480C288 497.7 273.7 512 256 512L160 512z" />
                            </svg>
                            Restore
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- <Teleport to="body">
            <div v-if="!canConclude && countdownLabel && showTooltip"
                class="fixed px-4 py-2 bg-white text-black border border-gray-300 w-18 text-center rounded-lg shadow-lg z-[9999] pointer-events-none"
                :style="tooltipStyle">
                {{ countdownLabel }}
            </div>
        </Teleport> -->
    </div>
</template>

<style>
.vue-flow__node {
    z-index: 1;
}

.vue-flow__node-category.selected>div {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
}

.vue-flow__node-evidence.selected>div {
    outline: 2px solid #fbbf24;
    outline-offset: 2px;
}

.zoom-slider {
    writing-mode: vertical-lr;
    direction: rtl;
    width: 6px;
    height: 120px;
    cursor: pointer;
    accent-color: #6366f1;
}
</style>