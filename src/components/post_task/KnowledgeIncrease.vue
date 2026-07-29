<script setup lang="ts">
    import { ref } from 'vue';
    import SurveyLikert from '../setup/SurveyLikert.vue';

    const likertOptions = [
        { label: 'Strongly Disagree', val: 1 },
        { label: 'Disagree', val: 2 },
        { label: 'Neutral', val: 3 },
        { label: 'Agree', val: 4 },
        { label: 'Strongly Agree', val: 5 },
    ];

    const knowledgeIncreaseStatements = [
        "My knowledge of this topic has increased."
    ]

    const knowledgeIncreaseRatings = ref(Array(knowledgeIncreaseStatements.length).fill(-1));

    const emit = defineEmits<{
        (e: 'updateKnowledgeIncrease', _knowledgeIncrease: number): void;
        (e: 'nextStep'): void;
    }>();

    const updateRatings = (newRatings: number[]) => {
        knowledgeIncreaseRatings.value = newRatings;
        emit('updateKnowledgeIncrease', newRatings[0]);
    };
</script>

<template v-else-if="step === 1">
    <div class="sticky top-0 w-full flex justify-start items-center bg-[#faf9f6] py-6">
        <h2 class="text-3xl font-bold! sticky top-0 bg-[#faf9f6] text-gray-600">Topic Familiarity</h2>
    </div>
    <p class="text-gray-600 text-2xl w-full mb-3!">
        Your task for this study was to search for information about <b class="font-bold!">nuclear energy</b>. How
        much do you agree with the following statement?
    </p>
    <SurveyLikert :likertOptions="likertOptions" :statements="knowledgeIncreaseStatements"
        :ratings="knowledgeIncreaseRatings" @update:ratings="(newRatings: number[]) => updateRatings(newRatings)" />
    <div
        class="shadow fixed bottom-12 flex justify-center items-center border p-1 rounded-2xl bg-white border-gray-300">
        <button @click="emit('nextStep')" :disabled="knowledgeIncreaseRatings[0] === -1"
        class="px-6 py-6 bg-indigo-500 text-white rounded-xl flex gap-x-2 justify-center items-center text-lg cursor-pointer hover:bg-indigo-600 transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed">
        Proceed
        </button>
    </div>
</template>