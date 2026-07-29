<script setup lang="ts">
import { ref, computed } from 'vue';

const props = withDefaults(defineProps<{
    statement: string;
    leftLabel: string;
    rightLabel: string;
    min?: number;
    max?: number;
    step?: number;
    modelValue: number | null;
}>(), {
    min: 0,
    max: 100,
    step: 5,
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: number): void;
}>();

const touched = ref(props.modelValue !== null);
const displayValue = computed(() => props.modelValue ?? Math.round((props.min + props.max) / 2));

function onInput(e: Event) {
    touched.value = true;
    emit('update:modelValue', Number((e.target as HTMLInputElement).value));
}
</script>

<template>
    <div class="w-full flex flex-col gap-y-3 py-6 text-gray-600 z-0!">
        <p class="font-semibold! text-lg">{{ statement }}</p>

        <div class="flex flex-col gap-y-1">
            <input
                type="range"
                :min="min"
                :max="max"
                :step="step"
                :value="displayValue"
                @input="onInput"
                class="w-full cursor-pointer accent-indigo-500"
                :class="{ 'opacity-40': !touched }"
            />
            <div class="flex justify-between text-sm text-gray-500">
                <span>{{ leftLabel }}</span>
                <span v-if="touched" class="font-semibold text-indigo-500">{{ displayValue }}</span>
                <span v-else class="italic">Not yet answered</span>
                <span>{{ rightLabel }}</span>
            </div>
        </div>
    </div>
</template>