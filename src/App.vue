<script setup>
    import { onMounted, watch, nextTick } from "vue";
    import SetupScreen from "./components/setup/SetupScreen.vue";
    import { VueSpinner } from "vue3-spinners";
    import { useParticipant } from "./composables/useParticipant.js";
    import MainTask from "./components/MainTask.vue";
    import ConcludingScreen from "./components/post_task/ConcludingScreen.vue";
    import { useTour } from '@/composables/useTour';
    import CompletionCode from "./components/CompletionCode.vue";
    import ScreenOut from "./components/ScreenOut.vue";
    import FailedAttentionChecks from "./components/FailedAttentionChecks.vue";

    const { condition, phase, initParticipant } = useParticipant();
    const { startMainTaskTour } = useTour();

    onMounted(() => {
        initParticipant();
    });

    watch(phase, (stage) => {
        if (stage !== 'main') return;
        if (localStorage.getItem('tour_seen')) return;

        nextTick(() => {
            startMainTaskTour(condition.value === 'traditional' ? 'traditional' : 'ai', (skipped) => {
                localStorage.setItem('tour_seen', 'true');
            });
        });
    });
</script>

<template>
    <!-- INTERMEDIATE LOADING STATE -->
    <div v-if="phase === 'loading'" class="w-full h-screen flex items-center justify-center">
        <VueSpinner size="24" color="#6366f1" />
    </div>

    <!-- PRE-TASK QUESTIONNAIRE -->
    <SetupScreen v-else-if="phase === 'pre_task'" />

    <!-- MAIN TASK  -->
    <MainTask v-else-if="phase === 'main'" />

    <!-- POST-TASK QUESTIONNAIRE -->
    <ConcludingScreen v-else-if="phase === 'post_task'" />

    <!-- PROLIFIC COMPLETION CODE -->
    <CompletionCode v-else-if="phase === 'completion_code'"/>

    <!-- PROLIFIC SCREENOUT CODE -->
    <ScreenOut v-else-if="phase === 'screenout'" />

    <!-- ATTENTION CHECKS FAILED -->
    <FailedAttentionChecks v-else-if="phase === 'rejected'" />
</template>