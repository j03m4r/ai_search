<script setup lang="ts">
    const emit = defineEmits<{
        (e: 'nextStep'): void;
    }>();
</script>
<template v-else-if="step === 4">
    <div class="flex flex-col items-center w-7xl h-screen">
        <div class="sticky top-0 w-full flex justify-center items-center bg-[#faf9f6] py-6">
            <h2 class="text-3xl font-bold! sticky top-0 w-7xl bg-[#faf9f6] text-gray-600">Task Description</h2>
        </div>
        <div class="text-gray-600 flex flex-col gap-y-6 w-full">
            <p class="text-2xl">
                Your task is to search for and map out the competing considerations for a policy decision:
                <b class="font-bold!">whether to adopt nuclear energy.</b>
            </p>

            <p class="text-2xl">
                Major policy decisions such as this one involve weighing many competing considerations: for example,
                scientific, economic, social, and political. Policymakers who understand a diverse set of
                considerations tend to make better decisions than those who only see one side.
            </p>

            <p class="text-2xl">
                <b class="font-bold!">We will provide you with a search tool, use this tool to explore what is at stake with the adoption of nuclear energy.</b>
                As you search, you will build out a concept map. Organize this map around higher-level
                dimensions (major categories of concern) and support each one with specific details you find.
            </p>

            <p class="text-2xl font-bold! text-red-500">
                A successful completion of this study requires that you conduct searches and create a concept map. Gibberish, irrelevant text, or searches irrelevant to the topic of nuclear energy will disqualify your participation.
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