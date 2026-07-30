<script setup>
    import { ref, watch, useTemplateRef, onMounted, onUnmounted } from "vue";
    import LeftOrganizer from "./LeftOrganizer.vue";
    import TraditionalSearch from "./TraditionalSearch.vue";
    import AIModeSearch from "./AIModeSearch.vue";
    import { useTextSelection } from '@vueuse/core'
    import { useDebouncedRefHistory } from '@vueuse/core'
    import { useParticipant } from "@/composables/useParticipant.js";

    const { condition, phase } = useParticipant();
    const selectedToolTip = useTemplateRef("selectedToolTip")
    const leftCanvasRef = ref(null);
    const selectedText = useTextSelection()
    const { history: selectedTextHistory } = useDebouncedRefHistory(selectedText.text, { deep: true, debounce: 500 })

    onMounted(() => {
        document.addEventListener('keydown', onDocumentKeydown);
    });
    onUnmounted(() => document.removeEventListener('keydown', onDocumentKeydown));

    watch(selectedText.text, (newSelectedText, oldSelectedText) => {
        if (newSelectedText === "") {
            selectedToolTip.value.style.opacity = "0%";
            selectedToolTip.value.style.zIndex = "-50"
        }
    })

    watch(selectedTextHistory, (newHistory, oldHistory) => {
        const el = document.activeElement;
        if (el?.tagName === 'TEXTAREA' || el?.tagName === 'INPUT') return;

        if (newHistory[0].snapshot) {
            const selectedLeft = selectedText.rects.value[0].left;
            const selectedTop = selectedText.rects.value[0].top;
            const selectedWidth = selectedText.rects.value[0].width;
            const selectedHeight = selectedText.rects.value[0].height;
            selectedToolTip.value.style.opacity = "100%";
            selectedToolTip.value.style.zIndex = "75"
            const toolTipWidth = selectedToolTip.value.getBoundingClientRect().width;
            const toolTipHeight = selectedToolTip.value.getBoundingClientRect().height;
            selectedToolTip.value.style.left = (selectedLeft - ((toolTipWidth / 2) - (selectedWidth / 2))) + "px"
            selectedToolTip.value.style.top = (selectedTop - toolTipHeight - 5) + "px"
        }
    })

    // Resizer state
    const leftWidth = ref(800); // initial px width of left pane
    const isResizing = ref(false);

    function onDocumentKeydown(e) {
        if (e.key !== 'Enter') return;
        const el = document.activeElement;
        if (el?.tagName === 'TEXTAREA' || el?.tagName === 'INPUT') return;

        const text = selectedText.text.value;
        if (!text) return;

        e.preventDefault();

        leftCanvasRef.value?.addEvidenceFromText({ 'text': text });
        selectedToolTip.value.style.opacity = "0%";
        selectedToolTip.value.style.zIndex = "-50";
    }

    function startResize(e) {
        isResizing.value = true;
        document.addEventListener("mousemove", onResize);
        document.addEventListener("mouseup", stopResize);
    }

    function onResize(e) {
        if (!isResizing.value) return;
        const newWidth = e.clientX;
        leftWidth.value = Math.min(Math.max(newWidth, 700), window.innerWidth * 0.65);
    }

    function stopResize() {
        isResizing.value = false;
        document.removeEventListener("mousemove", onResize);
        document.removeEventListener("mouseup", stopResize);
    }

    const pendingLinkEvidence = ref(null);
    const showLinkConfirm = ref(false);

    function confirmAddLinkEvidence(payload) {
        pendingLinkEvidence.value = payload;
        showLinkConfirm.value = true;
    }

    function handleLinkClicked(payload) {
        confirmAddLinkEvidence(payload);
    }

    function applyLinkEvidence() {
        if (pendingLinkEvidence.value) {
            leftCanvasRef.value?.addEvidenceFromLink(pendingLinkEvidence.value);
            // addMasterLog({
            //   type: "evidence-created-from-link",
            //   payload: pendingLinkEvidence.value,
            //   timestamp: Date.now()
            // });
        }
        pendingLinkEvidence.value = null;
        showLinkConfirm.value = false;
    }

    function cancelLinkEvidence() {
        pendingLinkEvidence.value = null;
        showLinkConfirm.value = false;
    }


    const updateRepresentation = (categories) => {
        // Do nothing for now
    }

    const log = (payload) => {
        leftCanvasRef.value?.addLog(payload.type, payload.data)
    }
</script>

<template>
    <div class="flex h-screen w-full overflow-hidden"
        :class="{ 'select-none': isResizing }">

        <!-- TOOL TIP FOR SUBMITTING NEW EVIDENCE FROM SELECTED -->
        <div ref="selectedToolTip" class="transition-all flex opacity-0 absolute -z-50 px-4 py-2 border-gray-300 border gap-x-1.5 bg-gray-100 rounded-xl shadow-lg">
            Press <p class="font-bold!">Enter</p> to create evidence
        </div>

        <!-- RESIZABLE REPRESENTATION DEVELOPMENT INTERFACE -->
        <div :style="{ width: leftWidth + 'px', flexShrink: 0 }" class="overflow-hidden">
            <LeftOrganizer v-if="phase === 'main'" ref="leftCanvasRef" :hide-buttons="false" @update-representation="updateRepresentation" />
        </div>

        <!-- VERTICAL LINE TO ALLOW WINDOW RESIZING -->
        <div class="group w-1 overflow-visible flex flex-col h-full items-center justify-center hover:bg-indigo-500 cursor-col-resize transition-colors relative z-10"
            :class="{ 'bg-indigo-500': isResizing }" @mousedown="startResize">
            <svg width="24" :class="{ 'fill-indigo-500': isResizing }"
                class="group-hover:fill-indigo-500 transition-colors fill-gray-500" xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640">
                <path
                    d="M320 208C289.1 208 264 182.9 264 152C264 121.1 289.1 96 320 96C350.9 96 376 121.1 376 152C376 182.9 350.9 208 320 208zM320 432C350.9 432 376 457.1 376 488C376 518.9 350.9 544 320 544C289.1 544 264 518.9 264 488C264 457.1 289.1 432 320 432zM376 320C376 350.9 350.9 376 320 376C289.1 376 264 350.9 264 320C264 289.1 289.1 264 320 264C350.9 264 376 289.1 376 320z" />
            </svg>
        </div>

        <!-- SEARCH/IF INTERFACE -->
        <div class="flex-1 flex flex-col overflow-y-auto p-2 min-w-0">
            <component :is="condition === 'traditional' ? TraditionalSearch : AIModeSearch" @link-clicked="handleLinkClicked" @log="log" />
        </div>

        <!-- LINK EVIDENCE CONFIRMATION POPUP -->
        <div v-if="showLinkConfirm" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div class="bg-white px-6 py-6 rounded-xl shadow-xl w-95 space-y-3!">
                <h2 class="text-lg font-semibold">Want to use this link as evidence in your model?</h2>

                <p class="text-sm text-gray-700 wrap-break-word p-3 border border-gray-400 rounded-lg">
                    {{ pendingLinkEvidence?.title || pendingLinkEvidence?.url }}
                </p>

                <div>
                    <label class="text-xs uppercase tracking-wide">Details</label>
                    <textarea :value="pendingLinkEvidence.body" @input="pendingLinkEvidence.body = $event.target.value"
                        placeholder="Add information here... Details, reasoning for inclusion, etc."
                        class="w-full min-h-20 resize-y text-sm border border-gray-300 rounded p-2 bg-white outline-none mt-0.5"></textarea>
                </div>

                <div class="flex w-full justify-between gap-3!">
                    <button class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 cursor-pointer" @click="cancelLinkEvidence">
                        Cancel
                    </button>

                    <button class="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                        @click="applyLinkEvidence">
                        Add Evidence
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>