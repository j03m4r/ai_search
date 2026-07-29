<script setup lang="ts">
    import { onMounted, ref } from "vue";
    import ConsentForm from './ConsentForm.vue'
    import PriorKnowledge from "./PriorKnowledge.vue";
    import SearchToolPreference from "./SearchToolPreference.vue";
    import type { SearchToolData } from "./SearchToolPreference.vue";
    import NFC from "./NFC.vue";
    import TaskDescription from "./TaskDescription.vue";
    import InitialRepresentation from "./InitialRepresentation.vue";
    import type { category } from "./InitialRepresentation.vue";
    import { useParticipant } from "@/composables/useParticipant";

    const { submitPreTaskData, screenout } = useParticipant();

    const step = ref(0);
    const priorKnowledge = ref(-1);
    const searchToolData = ref < SearchToolData | null > (null);
    const nfc = ref(Array(6).fill(null));
    const representation = ref<category[]>([]);

    function nextStep() {
        if (step.value === 1) {
            if (priorKnowledge.value >= 3) {
                screenout();
            }
        }

        if (step.value === 3) {
            if (nfc.value[5] !== 2) {
                setLocalStorage("fac", "1")
            }
        }

        step.value++;
    }

    async function begin() {
        const _nfc = (nfc.value[0] + nfc.value[1] + (6 - nfc.value[2]) + (6 - nfc.value[3]) + nfc.value[4] + nfc.value[6]) / 6

        await submitPreTaskData({
            knowledge_level: priorKnowledge.value,
            NFC: _nfc,
            search_tool_data: searchToolData.value,
            representation: representation.value,
        });
    }

    onMounted(() => {
        // Check local cache for pre-task data
        const _priorKnowledge = localStorage.getItem("prior_knowledge");
        const _searchToolData = localStorage.getItem("search_tool_data")
        const _nfc = localStorage.getItem("nfc")

        // Populate vars with what is found + set step val
        if (_priorKnowledge) {
            priorKnowledge.value = parseInt(_priorKnowledge)
            step.value = 2;
        }

        if (_searchToolData) {
            searchToolData.value = JSON.parse(_searchToolData)
            step.value = 3;
        }

        if (_nfc) {
            nfc.value = JSON.parse(_nfc)
            step.value = 4;
        }
    })

    const setLocalStorage = (key: string, value: string) => {
        localStorage.setItem(key, value);
    }
</script>

<template>
    <div class="w-full h-full flex justify-center items-start">
        <div class="w-7xl flex flex-col items-center justify-center">
            <ConsentForm v-if="step === 0" @next-step="nextStep" />
            <PriorKnowledge v-else-if="step === 1" @update-prior-knowledge="(pk: number) => { priorKnowledge = pk, setLocalStorage('prior_knowledge', pk.toString()) }" @next-step="nextStep" />
            <SearchToolPreference v-else-if="step === 2" @update-search-tool-data="(data) => { searchToolData = data, setLocalStorage('search_tool_data', JSON.stringify(data)) }" @next-step="nextStep" />
            <NFC v-else-if="step === 3" @next-step="nextStep" @updateNFC="(nfcData) => { nfc = nfcData, setLocalStorage('nfc', JSON.stringify(nfcData)) }" />
            <TaskDescription v-else-if="step === 4" @next-step="nextStep" />
            <InitialRepresentation v-else-if="step === 5" @begin="begin" @update-initial-representation="(_representation: category[]) => { representation = _representation, setLocalStorage('pre_task_representation', JSON.stringify(_representation)) }" />
        </div>
    </div>
</template>
