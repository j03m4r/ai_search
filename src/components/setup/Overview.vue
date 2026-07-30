<script setup lang="ts">
    const emit = defineEmits<{
        (e: 'nextStep'): void;
    }>();
</script>
<template v-else-if="step === 4">
    <div class="flex flex-col items-center w-7xl h-screen">
        <div class="sticky top-0 w-full flex justify-center items-center bg-[#faf9f6] py-6">
            <h2 class="text-3xl font-bold! sticky top-0 w-7xl bg-[#faf9f6] text-gray-600">Overview of Study</h2>
        </div>
        <div class="text-gray-600 flex flex-col gap-y-6 w-full">
            <p class="text-2xl">
                <b class="font-bold!">Pre-task questionnaire (3-5 minutes):</b> here we&apos;ll ask a few questions related to AI, introduce you to the main search task, and you will build out your initial concept map for the search task
            </p>

            <p class="text-2xl">
                <b class="font-bold!">Search and sensemaking task (~10 minutes):</b> here you will execute the search task and iterate on your initial concept map as you go
            </p>

            <p class="text-2xl">
                <b class="font-bold!">Post-task questionnaire (3-5 minutes):</b> to wrap up we will ask you a few questions related to your experience and what you learned
            </p>
        </div>

        <div
            class="shadow fixed bottom-12 flex justify-center items-center border p-1 rounded-2xl bg-white border-gray-300">
            <button @click="emit('nextStep')"
              class=" px-6 py-6 bg-indigo-500 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed
                text-white rounded-xl flex gap-x-2 justify-center items-center text-lg cursor-pointer
                hover:bg-indigo-600 transition-colors">
                Proceed
            </button>
        </div>

    </div>
</template>