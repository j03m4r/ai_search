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

// Number of tick intervals. If (max - min) isn't evenly divisible by step,
// the last tick will be slightly off-position — that's a real constraint of
// the CSS repeating-gradient approach, not a rounding bug in this code.
const intervalCount = computed(() => (props.max - props.min) / props.step);
const tickStyle = computed(() => ({ '--tick-unit': `${100 / intervalCount.value}%` }));

function onInput(e: Event) {
    touched.value = true;
    emit('update:modelValue', Number((e.target as HTMLInputElement).value));
}
</script>

<template>
    <div class="w-full flex flex-col gap-y-3 py-6 text-gray-600 z-0!">
        <p class="font-semibold! text-xl">{{ statement }}</p>
        <div class="flex flex-col gap-y-1">
            <input
                type="range"
                :min="min"
                :max="max"
                :step="step"
                :value="displayValue"
                :style="tickStyle"
                @input="onInput"
                class="tlx-slider w-full cursor-pointer"
                :class="{ 'opacity-50': !touched }"
            />
            <div class="flex justify-between text-sm text-gray-500">
                <span>{{ leftLabel }}</span>
                <span v-if="touched" class="font-semibold text-gray-700">{{ displayValue }}</span>
                <span v-else class="italic">Not yet answered</span>
                <span>{{ rightLabel }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
/*
  Single color drives everything (track ticks + thumb) via currentColor,
  so hover only needs to touch one property to restyle the whole control.
  No "filled vs unfilled" track — this is deliberate per the ruler reference,
  not an oversight. If you actually want a progress fill later, that's a
  separate ::-webkit-slider-runnable-track background layer, not a color swap.
*/
.tlx-slider {
    appearance: none;
    -webkit-appearance: none;
    height: 28px;
    background: transparent;
    color: var(--color-gray-500);
    transition: color 150ms ease;
}
.tlx-slider:hover,
.tlx-slider:focus-visible {
    color: var(--color-gray-700);
}

/*
  WebKit track: baseline + repeating ticks + a dedicated right-edge tick.
  The repeating gradient's final tick lands exactly at the 100% boundary
  and its 1px width extends past it, so it gets clipped entirely — this
  third layer is a fixed 1px block anchored to the right edge to draw it
  explicitly rather than relying on the repeat math to reach the edge.
*/
.tlx-slider::-webkit-slider-runnable-track {
    height: 28px;
    background-image:
        linear-gradient(currentColor, currentColor),
        repeating-linear-gradient(to right, currentColor 0 1px, transparent 1px var(--tick-unit)),
        linear-gradient(currentColor, currentColor);
    background-size: 100% 2px, 100% 55%, 1px 55%;
    background-position: center, center, right center;
    background-repeat: no-repeat, no-repeat, no-repeat;
}

/*
  WebKit thumb: layout width is 0 on purpose. The browser insets thumb
  travel by half the thumb's *box* width on each side — a nonzero width
  here reintroduces the left-drift you saw at high values. box-shadow
  paints the visible 3px bar without adding to that box, so the browser's
  position math stays exact at every value, including the endpoints.
*/
.tlx-slider::-webkit-slider-thumb {
    appearance: none;
    -webkit-appearance: none;
    width: 0px;
    height: 25px;
    background: transparent;
    box-shadow: 0 0 0 1.5px currentColor;
    border-radius: 0;
    cursor: pointer;
}

/* Firefox equivalent — same right-edge fix as the WebKit track above */
.tlx-slider::-moz-range-track {
    height: 28px;
    background-image:
        linear-gradient(currentColor, currentColor),
        repeating-linear-gradient(to right, currentColor 0 1px, transparent 1px var(--tick-unit)),
        linear-gradient(currentColor, currentColor);
    background-size: 100% 2px, 100% 55%, 1px 55%;
    background-position: center, center, right center;
    background-repeat: no-repeat, no-repeat, no-repeat;
}
.tlx-slider::-moz-range-thumb {
    width: 0px;
    height: 25px;
    background: transparent;
    box-shadow: 0 0 0 1.5px currentColor;
    border: none;
    border-radius: 0;
    cursor: pointer;
}
.tlx-slider::-moz-range-progress {
    background: transparent; /* no fill — see comment above */
}
</style>