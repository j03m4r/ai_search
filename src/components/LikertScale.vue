<script setup>
import { ref, computed } from 'vue';

const props = defineProps(['id', 'importance', 'name']);
const emit = defineEmits(['updateImportance']);
const track = ref(null);

const safeImportance = computed(() =>
  typeof props.importance === "number" ? props.importance : 0
);

const updateScore = (clientX) => {
  if (!track.value) return;
  const rect = track.value.getBoundingClientRect();
  let percent = (clientX - rect.left) / rect.width;
  percent = Math.max(0, Math.min(1, percent));
  const score = Math.round(percent * 4);
  emit('updateImportance', props.id, score);
};

const onMove = (e) => updateScore(e.touches ? e.touches[0].clientX : e.clientX);

const stopDrag = () => {
  window.removeEventListener('mousemove', onMove);
  window.removeEventListener('mouseup', stopDrag);
  window.removeEventListener('touchmove', onMove);
  window.removeEventListener('touchend', stopDrag);
};

const startDrag = (e) => {
  updateScore(e.touches ? e.touches[0].clientX : e.clientX);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', stopDrag);
};
</script>

<template>
  <div class="w-full flex items-center py-1 gap-x-4! select-none">
    <div class="flex justify-between items-center">
      <div class="-ml-1! font-light text-xs text-gray-500 text-center">
        {{ props.name }}
      </div>
    </div>

    <div class="relative flex-1 h-1.5 bg-gray-200 rounded-full"
         ref="track"
         @mousedown="startDrag"
         @touchstart="startDrag">

      <div
        class="absolute top-0 left-0 h-full bg-indigo-400 rounded-full"
        :style="{ width: `${safeImportance * 25}%` }"
      />

      <div
        v-for="n in 5"
        :key="n"
        class="absolute top-1/2 w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2 transition-[left]-colors"
        :class="(n - 1) <= safeImportance ? 'bg-indigo-400' : 'bg-gray-300'"
        :style="{ left: `${(n - 1) * 25}%` }"
      />

      <div
        class="absolute top-1/2 w-4 h-4 bg-white border-2 border-indigo-500 rounded-full shadow -translate-x-1/2 -translate-y-1/2 transition-[left] duration-50 z-10"
        style="pointer-events: auto"
        :style="{ left: `${safeImportance * 25}%` }"
      />
    </div>
  </div>
</template>
