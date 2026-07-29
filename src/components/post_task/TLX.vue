<script setup lang="ts">
    import { ref, computed } from 'vue';
    import TLXScale from './TLXScale.vue';
    import { useParticipant } from '@/composables/useParticipant.js';

    const { reject } = useParticipant()

    const tlx_questions = [
        "How much mental and perceptual activity was required (e.g. thinking, deciding, calculating, remembering, looking, searching, etc)? Was the task easy or demanding, simple or complex, exacting or forgiving?",
        "How much physical activity was required (e.g. pushing, pulling, turning, controlling, activating, etc)? Was the task easy or demanding, slow or brisk, slack or strenuous, restful or laborious?",
        "How much time pressure did you feel due to the rate of pace at which the tasks or task elements occurred? Was the pace slow and leisurely or rapid and frantic?",
        "How successful do you think you were in accomplishing the goals of the task set by the experimenter (or yourself)? How satisfied were you with your performance in accomplishing these goals?",
        "How hard did you have to work (mentally and physically) to accomplish your level of performance?",
        "How insecure, discouraged, irritated, stressed and annoyed versus secure, gratified, content, relaxed and complacent did you feel during the task?",
        "How do you think people will perceive your performance? This is an attention check; select 80 on the slider."
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
        frustration: number | null;
        attention: number | null;
    }>({
        mental: null,
        // physical: null,
        temporal: null,
        performance: null,
        effort: null,
        frustration: null,
        attention: null
    });

    const allAnswered = computed(() => Object.values(tlx.value).every(v => v !== null));

    const rawTlxScore = () => {
        if (!allAnswered.value) return 0;
        let values = Object.values(tlx.value) as number[];
        values = values.slice(0, values.length-1)
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
            left-label="Low"
            right-label="High"
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
            left-label="Low"
            right-label="High"
        />
        <TLXScale
            v-model="tlx.performance"
            :statement="tlx_questions[3]"
            left-label="Good"
            right-label="Poor"
        />
        <TLXScale
            v-model="tlx.effort"
            :statement="tlx_questions[4]"
            left-label="Low"
            right-label="High"
        />
        <TLXScale
            v-model="tlx.frustration"
            :statement="tlx_questions[5]"
            left-label="Low"
            right-label="High"
        />
        <TLXScale
            v-model="tlx.attention"
            :statement="tlx_questions[6]"
            left-label="Good"
            right-label="Poor"
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