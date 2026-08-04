<script setup lang="ts">
    import { ref, computed } from 'vue';
    import ExampleDimension from './ExampleDimension.vue';
    import LeftOrganizer from '../LeftOrganizer.vue';

    export interface category {
        id: string;
        title: string;
        importance: number;
        position: {
            x: number,
            y: number
        },
        evidence: {
            id: string;
            title: string;
            body: string;
            source: string;
        }[]
    }

    const representation = ref<category[]>([]);

    const validToBegin = computed(() => {
        const count = representation.value.length;
        return count >= 2;
    });

    const emit = defineEmits<{
        (e: 'begin'): void;
        (e: 'updateInitialRepresentation', representation: category[]): void;
    }>();

    const updateRepresentation = (categories: category[]) => {
        representation.value = categories;
        emit('updateInitialRepresentation', representation.value)
    }

    const startSearchTask = () => {
        pendingStart.value = true;
    }

    const pendingStart = ref(false);
</script>

<template v-else-if="step === 5">
    <div class="w-screen h-screen fixed top-0 left-0 bg-black/50 flex items-center justify-center z-100" v-if="pendingStart">
        <div class="bg-white p-4 rounded-xl shadow-lg w-lg flex flex-col justify-center items-start gap-y-6!">
            <p class="text-xl font-semibold!">You are about to start the search task.</p>
            <p class="text-xl">Remember, you should build out, expand, and change your initial concept map to accommodate for new factors you discover while searching.</p>
            <button @click="emit('begin')" class="cursor-pointer w-full bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors">Start search task</button>
        </div>
    </div>

    <div class="sticky top-0 w-full flex justify-start items-center bg-[#faf9f6] py-6 z-50">
        <h2 class="text-3xl font-bold! sticky top-0 bg-[#faf9f6] text-gray-600">Your Initial Understanding</h2>
    </div>

    <div class="flex flex-col items-center gap-4 w-full">

        <div class="text-gray-600 text-2xl! gap-y-6 flex flex-col">
            <p>
                Before searching, we want to capture your starting point. <b class="font-bold!">What do you think are
                    the most
                    important higher-level dimensions/considerations for adopting nuclear energy?</b> List each one
                and explain what you already know about it.
            </p>

            <p>
                A higher-level dimension is a major category of information that any person with
                decision-making authority should consider. For example, for deciding whether to use AI
                chatbots in therapy, a dimension might be:
            </p>

            <ExampleDimension />

            <p>
                Use this same structure for nuclear energy: name each dimension, then describe what you
                know about them. There are no wrong answers — we just want your honest starting point. Remember, you are
                doing this to map out the considerations for whether to adopt nuclear
                    energy. <b class="font-bold! text-red-500">You must use at least two
            categories in your map to continue</b>
            </p>
        </div>

        <div ref="canvasWrapper" class="w-full flex h-[60vh]">
            <LeftOrganizer :hide-buttons="true" @update-representation="updateRepresentation" />
        </div>

        <div class="mb-40!"></div>
        <div
            class="shadow fixed bottom-12 flex justify-center items-center border p-1 rounded-2xl bg-white border-gray-300">
            <button @click="startSearchTask" :disabled="!validToBegin"
                class="px-6 py-6 bg-indigo-500 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-xl flex gap-x-2 justify-center items-center text-lg cursor-pointer hover:bg-indigo-600 transition-colors">
                Begin Search Task
            </button>
        </div>

    </div>
</template>