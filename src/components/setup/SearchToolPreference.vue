<script setup lang="ts">
    import { ref, computed } from 'vue';
    import SurveyLikert from './SurveyLikert.vue';

    export interface SearchToolData {
        preferences: {
            lookup: string | null;
            learn: string | null;
            investigate: string | null;
        };
        frequency: number | null;
        trust: number | null;
    }

    const searchToolData = ref<SearchToolData>({
        preferences: {
            lookup: null,
            learn: null,
            investigate: null
        },
        frequency: null,
        trust: null
    })

    const preferenceLikertOptions = [
        { label: 'Traditional search', val: 0 },
        { label: 'AI-based search', val: 1 }
    ]
    const preferenceStatements = [
        "Find the boiling point of water at sea level",
        "Understand the differences between electric cars and gas cars before buying one",
        "Decide whether your city should build more bike lanes, using evidence from multiple sources"
    ]
    const preferenceResponses = ref(Array(preferenceStatements.length).fill(null));

    const frequencyLikertOptions = [
        { label: 'Never', val: 0 },
        { label: 'Every few months', val: 1 },
        { label: 'Once a month', val: 2 },
        { label: 'Once a week', val: 3 },
        { label: 'Multiple times a week', val: 4 },
        { label: 'At least once a day', val: 5 },
    ]
    const frequencyStatements = [
        "How often do you use AI/LLM search tools (e.g., AI Overviews, AI Search Mode, ChatGPT)?",
    ]
    const frequencyResponses = ref(Array(frequencyStatements.length).fill(null));

    const trustLikertOptions = [
        { label: 'Strongly disagree', val: -3 },
        { label: 'Disagree', val: -2 },
        { label: 'Neither agree nor disagree', val: 0 },
        { label: 'Agree', val: 2 },
        { label: 'Strongly agree', val: 3 },
    ]
    const trustStatements = [
        "I trust AI/LLM tools (e.g., AI Overviews, AI Search Mode, ChatGPT) to provide accurate information",
    ]
    const trustResponses = ref(Array(trustStatements.length).fill(null));

    type TopLevelKey = "frequency" | "trust"

    const setLikertVal = (key: TopLevelKey, value: number) => {
        if (key === "frequency") {
            frequencyResponses.value = [value];
        } else {
            trustResponses.value = [value];
        }
        searchToolData.value[key] = value;
    }

    const setToolPreference = (prefs: number[]) => {
        preferenceResponses.value = prefs;
        const pref = {
            lookup: prefs[0] !== null ? (prefs[0] === 0 ? "traditional" : "ai") : null,
            learn: prefs[1] !== null ? (prefs[1] === 0 ? "traditional" : "ai") : null,
            investigate: prefs[2] !== null ? (prefs[2] === 0 ? "traditional" : "ai") : null
        }
        searchToolData.value.preferences = pref;
    }

    const validToContinue = computed(() => {
        const p1 = searchToolData.value.preferences.lookup !== null
        const p2 = searchToolData.value.preferences.learn !== null
        const p3 = searchToolData.value.preferences.investigate !== null
        const freq = searchToolData.value.frequency !== null
        const trust = searchToolData.value.trust !== null
        return p1 && p2 && p3 && freq && trust;
    });
    
    const emit = defineEmits<{
        (e: 'updateSearchToolData', searchToolData: SearchToolData): void;
        (e: 'nextStep'): void;
    }>();

    const nextStep = () => {
        emit('updateSearchToolData', searchToolData.value);
        emit('nextStep');
    };
</script>

<template v-else-if="step === 1">
    <div class="sticky top-0 w-full flex justify-start items-center bg-[#faf9f6] py-6">
        <h2 class="text-3xl font-bold! sticky top-0 bg-[#faf9f6] text-gray-600">Search Tool Preference</h2>
    </div>
    <div class="flex flex-col gap-3! w-full">
        <p class="text-gray-600 text-xl">
            For the search tasks listed below, specify whether you would use traditional link-based search tools (e.g., Google, Bing) or AI/LLM search tools (e.g., AI Overviews, AI Search Mode, ChatGPT)
        </p>

        <SurveyLikert :likertOptions="preferenceLikertOptions" :statements="preferenceStatements" :ratings="preferenceResponses"
        @update:ratings="(newRatings: number[]) => setToolPreference(newRatings)" />

        <div class="w-full border-b border-gray-600 my-3!" />

        <p class="text-gray-600 text-xl">
            Next, help us understand your AI usage
        </p>

        <SurveyLikert :likertOptions="frequencyLikertOptions" :statements="frequencyStatements" :ratings="frequencyResponses"
        @update:ratings="(newRatings: number[]) => setLikertVal('frequency', newRatings[0])" />

        <div class="w-full border-b border-gray-600 my-3!" />

        <p class="text-gray-600 text-xl">
            Finally, indicate how much you agree with the following statement
        </p>

        <SurveyLikert :likertOptions="trustLikertOptions" :statements="trustStatements" :ratings="trustResponses"
        @update:ratings="(newRatings: number[]) => setLikertVal('trust', newRatings[0])" />
    </div>

    <div class="mb-40!"></div>

    <div
        class="shadow fixed bottom-12 flex justify-center items-center border p-1 rounded-2xl bg-white border-gray-300">
        <button @click="nextStep"
        :disabled="!validToContinue"
        class="px-6 py-6 bg-indigo-500 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-xl flex gap-x-2 justify-center items-center text-lg cursor-pointer hover:bg-indigo-600 transition-colors">
        Proceed
        </button>
    </div>
</template>