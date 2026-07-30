<script setup lang="ts">
    import { ref, computed } from 'vue';
    import TLXScale from './TLXScale.vue';
    import { useParticipant } from '@/composables/useParticipant.js';

    const { reject } = useParticipant()

    const tlx_questions = [
        "How mentally demanding was the task?",
        "How hurried or rushed was the pace of the task?",
        "How hurried or rushed was the pace of the task?",
        "How successful were you in accomplishing what you were asked to do?",
        "How hard did you have to work to accomplish your level of performance?",
        "How do you think people will perceive your performance? This is an attention check; select 80 on the slider.",
        "How insecure, discouraged, irritated, stressed and annoyed were you?",
    ];

    const emit = defineEmits<{
        (e: 'updateTlx', tlx: number): void;
        (e: 'nextStep'): void;
    }>();

    const tlx = ref<{
        mental: number | null;
        // physical: number | null;
        temporal: number | null;
        performance: number | null;
        effort: number | null;
        attention: number | null;
        frustration: number | null;
    }>({
        mental: null,
        // physical: null,
        temporal: null,
        performance: null,
        effort: null,
        attention: null,
        frustration: null,
    });

    const allAnswered = computed(() => Object.values(tlx.value).every(v => v !== null));

    const rawTlxScore = () => {
        if (!allAnswered.value) return 0;
        let values = Object.entries(tlx.value).filter(([key, value]) => key!=="attention").map(([key, value]) => value) as number[]
        return values.reduce((sum, v) => sum + v, 0) / values.length;
    };

    const next = () => {
        emit('nextStep');
        emit('updateTlx', rawTlxScore())

        if (tlx.value.attention !== 80) {
            let numFailedAttentionChecks = parseInt(localStorage.getItem("fac") || "0")
            numFailedAttentionChecks += 1;
            if (numFailedAttentionChecks === 2) {
                reject()
            }
            localStorage.setItem("fac", numFailedAttentionChecks.toString());
        }
    }
</script>

<template>
    <div class="sticky top-0 w-full flex justify-start items-center bg-[#faf9f6] py-6 z-50">
        <h2 class="text-3xl font-bold! sticky top-0 bg-[#faf9f6] text-gray-600 w-full">NASA Task Load Index</h2>
    </div>

    <p class="text-gray-600 text-2xl w-full mb-3!">
        For each question below, please rate your experience during the task by moving the slider between the two endpoints shown
    </p>

    <div class="flex flex-col w-full divide-y divide-gray-300">
        <TLXScale
            v-model="tlx.mental"
            :statement="tlx_questions[0]"
            left-label="Very Low"
            right-label="Very High"
        />
        <!-- <TLXScale
            v-model="tlx.physical"
            :statement="tlx_questions[1]"
            left-label="Low"
            right-label="High"
        /> -->
        <TLXScale
            v-model="tlx.temporal"
            :statement="tlx_questions[2]"
            left-label="Very Low"
            right-label="Very High"
        />
        <TLXScale
            v-model="tlx.performance"
            :statement="tlx_questions[3]"
            left-label="Perfect"
            right-label="Failure"
        />
        <TLXScale
            v-model="tlx.effort"
            :statement="tlx_questions[4]"
            left-label="Very Low"
            right-label="Very High"
        />
        <TLXScale
            v-model="tlx.attention"
            :statement="tlx_questions[5]"
            left-label="Very Low"
            right-label="Very High"
        />
        <TLXScale
            v-model="tlx.frustration"
            :statement="tlx_questions[6]"
            left-label="Very Low"
            right-label="Very High"
        />
    </div>

    <div class="mb-40!"></div>

    <div
        class="shadow fixed bottom-12 flex justify-center items-center border p-1 rounded-2xl bg-white border-gray-300">
        <button @click="next" :disabled="!allAnswered"
        class="px-6 py-6 bg-indigo-500 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-xl flex gap-x-2 justify-center items-center text-lg cursor-pointer hover:bg-indigo-600 transition-colors">
            Proceed
        </button>
    </div>
</template>