<!-- NOT IN USE, DEPRECATED -->

<template>
  <div
    ref="root"
    class="node"
    :class="node.type"
    :data-node-id="node.id"
    :style="{ left: node.x + 'px', top: node.y + 'px' }"
    @mousedown="startDrag"
    @dblclick.stop="editing = true"
    @click.stop="emit('startConnect', node)"
  >
    <button class="remove-btn" @click.stop="emit('remove', node.id)">×</button>

    <input
      v-if="editing"
      v-model="label"
      @blur="finishEdit"
      @keyup.enter="finishEdit"
      class="label-input"
    />
    <span v-else class="label">{{ node.label }}</span>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const root = ref(null);
defineExpose({ root });

const props = defineProps({
  node: Object
});

// Emits:
// - updatePosition: parent updates node.x / node.y
// - startConnect: your existing connection logic
// - remove: delete node
// - stopMove: now used as "drop" with final coords
const emit = defineEmits(['updatePosition', 'startConnect', 'remove', 'stopMove']);

const label = ref(props.node.label);
const editing = ref(false);

watch(label, v => (props.node.label = v));

let offsetX = 0;
let offsetY = 0;

function startDrag(e) {
  if (editing.value) return;

  offsetX = e.clientX - props.node.x;
  offsetY = e.clientY - props.node.y;

  window.addEventListener('mousemove', drag);
  window.addEventListener('mouseup', stopDrag);
}

function drag(e) {
  emit('updatePosition', {
    id: props.node.id,
    x: e.clientX - offsetX,
    y: e.clientY - offsetY
  });
}

function stopDrag() {
  window.removeEventListener('mousemove', drag);
  window.removeEventListener('mouseup', stopDrag);

  // Treat this as "drop" — parent can decide where it landed
  emit('stopMove', {
    id: props.node.id,
    x: props.node.x,
    y: props.node.y
  });
}

function finishEdit() {
  editing.value = false;
}
</script>

<style scoped>
.node {
  position: absolute;
  width: 150px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: grab;
  user-select: none;
  border: 2px solid #333;
  background: white;
  color: black;
  z-index: 10;
}

.node.oval {
  border-radius: 50%;
}

.node.rect {
  border-radius: 6px;
}

.label-input {
  width: 90%;
  text-align: center;
  color: black;
}

.label {
  pointer-events: none;
}

.remove-btn {
  position: absolute;
  top: -12px;
  right: -12px;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: #d33;
  color: white;
  font-weight: bold;
  cursor: pointer;
  z-index: 20;
  padding: 0;
  line-height: 18px;
}

</style>