<script setup lang="ts">
    import { ref, onMounted } from "vue";
    import TLX from "./TLX.vue";
    import KnowledgeIncrease from "./KnowledgeIncrease.vue";
    import PostTaskRepresentation from "./PostTaskRepresentation.vue";
    import { category } from "../setup/InitialRepresentation.vue";
    import { useParticipant } from "@/composables/useParticipant.js";

    const { submitPostTaskData } = useParticipant()

    const step = ref(0);
    const tlx = ref(-1)
    const knowledgeIncrease = ref(-1)
    const representation = ref<category[]>([]);

    function nextStep() {
        step.value++;
    }

    const setLocalStorage = (key: string, value: string) => {
        localStorage.setItem(key, value);
    }

    onMounted(() => {
        // Check local cache for pre-task data
        const _tlx = localStorage.getItem("tlx");
        const _knowledgeIncrease = localStorage.getItem("knowledge_increase")

        // Populate vars with what is found + set step val
        if (_tlx) {
            tlx.value = parseInt(_tlx)
            step.value = 1;
        }

        if (_knowledgeIncrease) {
            knowledgeIncrease.value = JSON.parse(_knowledgeIncrease)
            step.value = 2;
        }
    })

    async function finish() {
        await submitPostTaskData({
            knowledge_increase: knowledgeIncrease.value,
            NASA_TLX: tlx.value,
            representation: representation.value
        })
    }
</script>

<template>
    <div class="w-full h-full flex justify-center items-start">
        <div class="w-7xl flex flex-col items-center justify-center">
            <TLX v-if="step === 0" @next-step="nextStep" @update-tlx="(_tlx: number) => { tlx = _tlx, setLocalStorage('tlx', _tlx.toString()) }" />
            <KnowledgeIncrease v-else-if="step === 1" @next-step="nextStep" @update-knowledge-increase="(_knowledgeIncrease: number) => { knowledgeIncrease = _knowledgeIncrease, setLocalStorage('knowledge_increase', _knowledgeIncrease.toString()) }" />
            <PostTaskRepresentation v-else @finish="finish" @update-post-task-representation="(_representation: category[]) => { representation = _representation, setLocalStorage('post_task_representation', JSON.stringify(_representation)) }" />
        </div>
    </div>
</template>
