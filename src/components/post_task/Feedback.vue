<script setup lang="ts">
    import { ref, computed } from 'vue';
    import LeftOrganizer from '../LeftOrganizer.vue';
    import { category } from '../setup/InitialRepresentation.vue';

    const feedback = ref<string>("");

    const emit = defineEmits<{
        (e: 'finish'): void;
        (e: 'updateFeedback', feedback: string): void;
    }>();

    const updateFeedback = (event: Event) => {
        const target = event.target as HTMLTextAreaElement | null;
        const value = target?.value || '';
        feedback.value = value;
        emit('updateFeedback', value);
    };
</script>

<template v-else-if="step === 5">
    <div class="sticky top-0 w-full flex justify-start items-center bg-[#faf9f6] py-6">
        <h2 class="text-3xl font-bold! sticky top-0 bg-[#faf9f6] text-gray-600">Feedback on Experience</h2>
    </div>

    <div>
        <label class="text-xs uppercase tracking-wide"><b class="font-bold!">[Optional]</b> If you have any feedback, questions, or comments for the research team, please share that here:</label>
        <textarea :value="feedback" @input="updateFeedback"
            placeholder="Optionally write feedback here..."
            class="w-full min-h-20 resize-y text-sm border border-gray-400 rounded p-2 bg-white outline-none" />
    </div>

    <div class="mb-40!"></div>
    <div
        class="shadow fixed bottom-12 flex justify-center items-center border p-1 rounded-2xl bg-white border-gray-300">
        <button @click="emit('finish')"
            class="px-6 py-6 bg-indigo-500 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-xl flex gap-x-2 justify-center items-center text-lg cursor-pointer hover:bg-indigo-600 transition-colors">
            Finish
        </button>
    </div>
</template>