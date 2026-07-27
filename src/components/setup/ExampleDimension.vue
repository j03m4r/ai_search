<script setup lang="ts">
    import { ref } from 'vue';
    import LikertScale from '../LikertScale.vue';

    const imp = ref(2);
</script>

<template>
    <div class="w-full flex justify-center">
        <div class="bg-white border rounded-xl shadow-lg flex flex-col w-100"
        :class="{ 'border-indigo-300': imp === 0, 'border-indigo-400': imp === 1, 'border-indigo-500': imp === 2, 'border-indigo-600': imp === 3, 'border-indigo-700': imp === 4 }">

        <div
            class="drag-handle flex items-center justify-between gap-2 px-4 py-3 border-b cursor-grab active:cursor-grabbing rounded-t-xl transition-colors bg-indigo-50"
            :class="{ 'border-b-indigo-300': imp === 0, 'border-b-indigo-400': imp === 1, 'border-b-indigo-500': imp === 2, 'border-b-indigo-600': imp === 3, 'border-b-indigo-700': imp === 4 }">
            <div class="flex-1 flex items-center justify-left gap-2 min-w-0">
            <p class="no-drag flex-1 font-bold! bg-transparent border-none outline-none text-black">
                Social consequences
            </p>
            </div>

            <button title="Delete" @click="null" :disabled="true"
            class="group bg-transparent border p-2 rounded-lg border-indigo-300 cursor-not-allowed flex leading-none transition-colors">
            <svg class="" width="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                <path
                d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z" />
            </svg>
            </button>
        </div>

        <div
            class="cursor-pointer flex items-center justify-between gap-2 px-4 py-2! border-b no-drag! z-40 transition-colors bg-indigo-50"
            :class="{ 'border-b-indigo-300': imp === 0, 'border-b-indigo-400': imp === 1, 'border-b-indigo-500': imp === 2, 'border-b-indigo-600': imp === 3, 'border-b-indigo-700': imp === 4 }">
            <div class="cursor-not-allowed w-full">
            <LikertScale @updateImportance="(event) => imp = event.importance" :importance="Number(imp)" id="ex_ev_1"
                :name="'Importance'" />
            </div>
        </div>

        <div class="flex flex-col gap-2 p-2 min-h-24" :class="{ 'min-h-fit': 2 }">
            <div
            class="bg-amber-50 border border-amber-300 rounded-lg overflow-hidden">
            <div class="flex items-center justify-between gap-2 px-4 py-3">
                <button @click.stop="null" :disabled="true"
                class="shrink-0 w-4 h-4 bg-transparent border-0 cursor-not-allowed p-0 transition-colors flex items-center justify-center">
                <svg v-if="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="18"
                    fill="currentColor">
                    <path
                    d="M297.4 438.6C309.9 451.1 330.2 451.1 342.7 438.6L502.7 278.6C515.2 266.1 515.2 245.8 502.7 233.3C490.2 220.8 469.9 220.8 457.4 233.3L320 370.7L182.6 233.4C170.1 220.9 149.8 220.9 137.3 233.4C124.8 245.9 124.8 266.2 137.3 278.7L297.3 438.7z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="18"
                    fill="currentColor">
                    <path
                    d="M438.6 297.4C451.1 309.9 451.1 330.2 438.6 342.7L278.6 502.7C266.1 515.2 245.8 515.2 233.3 502.7C220.8 490.2 220.8 469.9 233.3 457.4L370.7 320L233.4 182.6C220.9 170.1 220.9 149.8 233.4 137.3C245.9 124.8 266.2 124.8 278.7 137.3L438.7 297.3z" />
                </svg>
                </button>
                <p class="flex-1 min-w-0 text-sm font-semibold! bg-transparent border-none outline-none text-black">
                    Research shows that LLMs isolate people from their peers by providing a place of perceived comfort.
                </p>

                <button @click.stop="null" title="Remove from category" :disabled="true"
                class="group bg-transparent border p-2 rounded-lg border-amber-300 cursor-not-allowed flex leading-none transition-colors">
                <svg width="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path
                    d="M160 512C142.3 512 128 526.3 128 544C128 561.7 142.3 576 160 576L256 576C309 576 352 533 352 480L352 173.3L425.4 246.7C437.9 259.2 458.2 259.2 470.7 246.7C483.2 234.2 483.2 213.9 470.7 201.4L342.7 73.4C330.2 60.9 309.9 60.9 297.4 73.4L169.4 201.4C156.9 213.9 156.9 234.2 169.4 246.7C181.9 259.2 202.2 259.2 214.7 246.7L288 173.3L288 480C288 497.7 273.7 512 256 512L160 512z" />
                </svg>
                </button>
                
                <button @click.stop="null" title="Duplicate" :disabled="true"
                class="group bg-transparent border p-2 rounded-lg border-amber-300 cursor-not-allowed flex leading-none transition-colors">
                <svg width="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path
                    d="M448 64H192C156.7 64 128 92.7 128 128V448C128 483.3 156.7 512 192 512H448C483.3 512 512 483.3 512 448V128C512 92.7 483.3 64 448 64zM192 0C121.3 0 64 57.3 64 128V448C64 518.7 121.3 576 192 576H448C518.7 576 576 518.7 576 448V128C576 57.3 518.7 0 448 0H192z" />
                </svg>
                </button>

                <button @click.stop="null" title="Delete" :disabled="true"
                class="group bg-transparent border p-2 rounded-lg border-amber-300 cursor-not-allowed flex leading-none transition-colors">
                <svg width="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path
                    d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z" />
                </svg>
                </button>
            </div>
            </div>
            <div
            class="bg-amber-50 border border-amber-300 rounded-lg overflow-hidden">
            <div class="flex items-center justify-between gap-2 px-4 py-3">
                <button @click.stop="null" :disabled="true"
                class="shrink-0 w-4 h-4 bg-transparent border-0 cursor-not-allowed p-0 transition-colors flex items-center justify-center">
                <svg v-if="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="18"
                    fill="currentColor">
                    <path
                    d="M297.4 438.6C309.9 451.1 330.2 451.1 342.7 438.6L502.7 278.6C515.2 266.1 515.2 245.8 502.7 233.3C490.2 220.8 469.9 220.8 457.4 233.3L320 370.7L182.6 233.4C170.1 220.9 149.8 220.9 137.3 233.4C124.8 245.9 124.8 266.2 137.3 278.7L297.3 438.7z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="18"
                    fill="currentColor">
                    <path
                    d="M438.6 297.4C451.1 309.9 451.1 330.2 438.6 342.7L278.6 502.7C266.1 515.2 245.8 515.2 233.3 502.7C220.8 490.2 220.8 469.9 233.3 457.4L370.7 320L233.4 182.6C220.9 170.1 220.9 149.8 233.4 137.3C245.9 124.8 266.2 124.8 278.7 137.3L438.7 297.3z" />
                </svg>
                </button>
                <p class="flex-1 min-w-0 text-sm font-semibold! bg-transparent border-none outline-none text-black">
                LLMs have been known to overly validate users, distorting self‑image.
                </p>

                <button @click.stop="null" title="Remove from category" :disabled="true"
                class="group bg-transparent border p-2 rounded-lg border-amber-300 cursor-not-allowed flex leading-none transition-colors">
                <svg width="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path
                    d="M160 512C142.3 512 128 526.3 128 544C128 561.7 142.3 576 160 576L256 576C309 576 352 533 352 480L352 173.3L425.4 246.7C437.9 259.2 458.2 259.2 470.7 246.7C483.2 234.2 483.2 213.9 470.7 201.4L342.7 73.4C330.2 60.9 309.9 60.9 297.4 73.4L169.4 201.4C156.9 213.9 156.9 234.2 169.4 246.7C181.9 259.2 202.2 259.2 214.7 246.7L288 173.3L288 480C288 497.7 273.7 512 256 512L160 512z" />
                </svg>
                </button>
                
                <button @click.stop="null" title="Duplicate" :disabled="true"
                class="group bg-transparent border p-2 rounded-lg border-amber-300 cursor-not-allowed flex leading-none transition-colors">
                <svg width="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path
                    d="M448 64H192C156.7 64 128 92.7 128 128V448C128 483.3 156.7 512 192 512H448C483.3 512 512 483.3 512 448V128C512 92.7 483.3 64 448 64zM192 0C121.3 0 64 57.3 64 128V448C64 518.7 121.3 576 192 576H448C518.7 576 576 518.7 576 448V128C576 57.3 518.7 0 448 0H192z" />
                </svg>
                </button>

                <button @click.stop="null" title="Delete" :disabled="true"
                class="group bg-transparent border p-2 rounded-lg border-amber-300 cursor-not-allowed flex leading-none transition-colors">
                <svg width="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path
                    d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z" />
                </svg>
                </button>
            </div>
            </div>
        </div>
        </div>
    </div>
</template>