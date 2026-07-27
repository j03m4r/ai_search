<script setup lang="ts">
    import { ref } from 'vue';
    import SurveyLikert from "./SurveyLikert.vue"

    const nfcStatements = [
        "I would prefer complex to simple problems. ",
        "I like to have the responsibility of handling a situation that requires a lot of thinking.",
        "Thinking is not my idea of fun.",
        "I would rather do something that requires little thought than something that is sure to challenge my thinking abilities.",
        "I really enjoy a task that involves coming up with new solutions to problems.",
        "I would prefer a task that is intellectual, difficult, and important to one that is somewhat important but does not require much thought."
    ];

    const nfcLikertOptions = [
        { label: 'Extremely Uncharacteristic ', val: 1 },
        { label: 'Uncharacteristic', val: 2 },
        { label: 'Neither agree nor disagree', val: 3 },
        { label: 'Moderately agree', val: 4 },
        { label: 'Strongly agree', val: 5 },
    ]

    const nfcResponses = ref(Array(nfcStatements.length).fill(null));

    const emit = defineEmits<{
        (e: 'updateNFC', nfc: number[]): void;
        (e: 'nextStep'): void;
    }>();
</script>

<template>
    <div class="sticky top-0 w-full flex justify-start items-center bg-[#faf9f6] py-6">
        <h2 class="text-3xl font-bold! sticky top-0 bg-[#faf9f6] text-gray-600">Need For Cognition Scale</h2>
    </div>

    <p class="text-gray-600 text-xl w-full mb-3!">
        For each sentence below, please select how uncharacteristic or characteristic (5-point scale) this is for you personally
    </p>

    <SurveyLikert :likertOptions="nfcLikertOptions" :statements="nfcStatements" :ratings="nfcResponses"
        @update:ratings="(newRatings: number[]) => { nfcResponses = newRatings; emit('updateNFC', newRatings); }" />

    <div class="mb-40!"></div>
    <div
        class="shadow fixed bottom-12 flex justify-center items-center border p-1 rounded-2xl bg-white border-gray-300">
        <button @click="emit('nextStep')" :disabled="nfcResponses.some(response => response === null)"
        class="px-6 py-6 bg-indigo-500 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-xl flex gap-x-2 justify-center items-center text-lg cursor-pointer hover:bg-indigo-600 transition-colors">
        Proceed
        </button>
    </div>
</template>