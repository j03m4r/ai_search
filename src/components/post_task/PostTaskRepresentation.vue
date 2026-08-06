<script setup lang="ts">
    import { ref } from 'vue';
    import LeftOrganizer from '../LeftOrganizer.vue';
    import { category } from '../setup/InitialRepresentation.vue';

    const representation = ref<category[]>([]);
    const pendingFinish = ref<boolean>(false);

    const emit = defineEmits<{
        (e: 'nextStep'): void;
        (e: 'updatePostTaskRepresentation', representation: category[]): void;
    }>();

    const updateRepresentation = (categories: category[]) => {
        representation.value = categories;
        emit('updatePostTaskRepresentation', representation.value)
    }

    function finish() {
        if (representation.value.length < 2) {
            pendingFinish.value = true;
        } else {
            emit('nextStep');
        }
    }
</script>

<template v-else-if="step === 5">
    <div class="w-screen h-screen fixed top-0 left-0 bg-black/50 flex items-center justify-center z-100" v-if="pendingFinish">
        <div class="bg-white p-4 rounded-xl shadow-lg w-lg flex flex-col justify-center items-start gap-y-3!">
            <p class="text-xl"><p class="font-bold!">You have {{ representation.length }} categories.</p> Are you sure you want to finish the study? Remember, faithful engagement is required for compensation.</p>
            <div class="flex w-full items-center gap-x-2!">
                <button @click="() => pendingFinish = false" class="cursor-pointer w-full bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-lg transition-colors">Go back</button>
                <button @click="emit('nextStep')" class="cursor-pointer w-full bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors">Confirm finish</button>
            </div>
        </div>
    </div>

    <div class="sticky top-0 w-full flex justify-start items-center bg-[#faf9f6] py-6">
        <h2 class="text-3xl font-bold! sticky top-0 bg-[#faf9f6] text-gray-600">Your Final Understanding</h2>
    </div>

    <div class="flex flex-col items-center gap-4 w-full">

        <div class="text-gray-600 text-2xl gap-y-6 flex flex-col">
            <p>
                Now that you have finished the task, <b class="font-bold!">try to recall and redevelop your map of the important considerations for adopting nuclear energy.</b> We understand remembering everything is difficult, focus on recreating the main categories and filling in the details where possible.
            </p>

            <p>
                We are just interested in what your understanding is now. This is a required activity for successful study completion.
            </p>
        </div>

        <div class="w-full flex h-[60vh]">
            <LeftOrganizer :hide-buttons="true" @update-representation="updateRepresentation" />
        </div>

        <div class="mb-40!"></div>
        <div
            class="shadow fixed bottom-12 flex justify-center items-center border p-1 rounded-2xl bg-white border-gray-300">
            <button @click="finish"
                class="px-6 py-6 bg-indigo-500 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-xl flex gap-x-2 justify-center items-center text-lg cursor-pointer hover:bg-indigo-600 transition-colors">
                Proceed
            </button>
        </div>

    </div>
</template>