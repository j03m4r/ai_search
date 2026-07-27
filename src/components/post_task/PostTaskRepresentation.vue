<script setup lang="ts">
    import { ref, computed } from 'vue';
    import LeftOrganizer from '../LeftOrganizer.vue';
    import { category } from '../setup/InitialRepresentation.vue';

    const representation = ref<category[]>([]);

    const validToBegin = computed(() => {
        const count = representation.value.length;
        return count >= 2;
    });

    const emit = defineEmits<{
        (e: 'finish'): void;
        (e: 'updatePostTaskRepresentation', representation: category[]): void;
    }>();

    const updateRepresentation = (categories: category[]) => {
        representation.value = categories;
        emit('updatePostTaskRepresentation', representation.value)
    }
</script>

<template v-else-if="step === 5">
    <div class="sticky top-0 w-full flex justify-start items-center bg-[#faf9f6] py-6">
        <h2 class="text-3xl font-bold! sticky top-0 bg-[#faf9f6] text-gray-600">Your Final Understanding</h2>
    </div>

    <div class="flex flex-col items-center gap-4 w-full">

        <div class="text-gray-600 text-xl gap-y-6 flex flex-col">
            <p>
                Now that you have searched and built your map, describe again what you think are the most important higher-level dimensions/considerations for adopting nuclear energy.
            </p>

            <p>
                Use the same format: name each dimension and support it with specific details from your research. We understand that remembering the details may be challenging; focus on the higher-level dimensions and include any evidence that you do remember. Your answer may look similar to before, or it may be quite different. We are just interested in what your understanding is now.
            </p>
        </div>

        <div class="w-full flex h-[60vh]">
            <LeftOrganizer :hide-buttons="true" @update-representation="updateRepresentation" />
        </div>

        <div class="mb-40!"></div>
        <div
            class="shadow fixed bottom-12 flex justify-center items-center border p-1 rounded-2xl bg-white border-gray-300">
            <button @click="emit('finish')" :disabled="!validToBegin"
                class="px-6 py-6 bg-indigo-500 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-xl flex gap-x-2 justify-center items-center text-lg cursor-pointer hover:bg-indigo-600 transition-colors">
                Finish
            </button>
        </div>

    </div>
</template>