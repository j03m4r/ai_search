<!-- NOT IN USE, DEPRECATED -->


<template>
  <div class="canvas" @click="clearConnectMode" ref="canvasRef">
    <!-- Spawn shape -->
    <!-- TODO: Integrate dimensions w/initial representation page-->
    <button class="spawn oval" @click.stop="addNode('oval')">+ Oval</button>
    <!-- TODO: Integrate evidence w/evidence bank -->
    <button class="spawn rect" @click.stop="addNode('rect')">+ Rect</button>
    <!-- Download log of canvas activities- placeholder -->
    <button class="spawn export" @click.stop="exportCanvasState">Export</button>
    <div class="svg-layer">
    <svg class="connections">
    <line
      v-for="c in connectionLines"
      :key="c.id"
      :x1="c.x1"
      :y1="c.y1"
      :x2="c.x2"
      :y2="c.y2"
      stroke="black"
      stroke-width="2"
    />
    </svg>
  </div>
    <!-- renders element for all items in const nodes -->
    <DraggableNode
      v-for="n in nodes"
      :key="n.id"
      :ref="el => nodeComponents[n.id] = el"
      :node="n"
      @updatePosition="updatePosition(n.id, $event)"
      @startConnect="startConnect(n)"
      @remove="removeNode"
      @stopMove="logState"
    />
  </div>
  
</template>

<script setup>
import { ref, computed } from 'vue';
import DraggableNode from './deprecated/DraggableNode.vue';

const nodes = ref([]);
const connections = ref([]);
const nodeComponents = ref({});

const connectState = ref({
  active: false,
  fromNode: null
});

const connectionLines = computed(() =>
  connections.value.map(c => {
    const from = nodes.value.find(n => n.id === c.from);
    const to = nodes.value.find(n => n.id === c.to);
    // if connection lines break with irregular window sizes this is probably it
    return {
      id: c.id,
      x1: from.x + 75,
      y1: from.y + 40,
      x2: to.x + 75,
      y2: to.y + 40
    };
  })
);


function addNode(type) {
  nodes.value.push({
    id: crypto.randomUUID(),
    type, // 'oval' or 'rect'
    x: 100,
    y: 100,
    label: type === 'oval' ? 'Oval' : 'Rect'
  });
  logState();
}

function updatePosition(id, pos) {
  const n = nodes.value.find(n => n.id === id);
  n.x = pos.x;
  n.y = pos.y;
}

function startConnect(node) {
  if (!connectState.value.active) {
    //currently connections must start from oval
    if (node.type !== 'oval') return;
    connectState.value = { active: true, fromNode: node };
    return;
  }

  // Second click must be a rectangle
  if (node.type !== 'rect') return;

  // Rectangle can only have one connection
  // this is scuffed and i will change this later
  const already = connections.value.find(c => c.to === node.id);
  if (already) return;

  connections.value.push({
    id: crypto.randomUUID(),
    from: connectState.value.fromNode.id,
    to: node.id
  });
  logState();

  connectState.value = { active: false, fromNode: null };
  console.log("Connect state:", connectState.value);
  console.log("Clicked node:", node);
  console.log("Connections:", connections.value);
}

function clearConnectMode() {
  connectState.value = { active: false, fromNode: null };
}

function removeNode(id) {
  // Remove the node
  nodes.value = nodes.value.filter(n => n.id !== id);

  // Remove any connections involving it
  connections.value = connections.value.filter(
    c => c.from !== id && c.to !== id
  );

  // Remove component ref
  delete nodeComponents.value[id];
  logState();
}

function removeConnection(){
  TODO
}

function getCanvasState() {
  return {
    timestamp: Date.now(),
    nodes: nodes.value.map(n => ({
      id: n.id,
      type: n.type,
      x: n.x,
      y: n.y,
      label: n.label
    })),
    connections: connections.value.map(c => ({
      id: c.id,
      from: c.from,
      to: c.to
    }))
  };
}

function exportCanvasState() {
  const data = JSON.stringify(history, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "canvas-state.json";
  a.click();

  URL.revokeObjectURL(url);
}

const history = ref([]);

function logState() {
  history.value.push(getCanvasState());
}

function addLinkNode({ title, link }) {
  nodes.value.push({
    id: crypto.randomUUID(),
    type: 'rect',
    x: 120,
    y: 120,
    label: title || link || 'Link'
  });

  logState();
}

defineExpose({
  addLinkNode
});


</script>

<style>
.canvas {
  z-index: 3;
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  background: #fafafa;
  flex: 1 1 auto;
}

.spawn {
  position: absolute;
  top: 10px;
  padding: 6px 12px;
  z-index: 10;
}

.spawn.oval { left: 10px; }
.spawn.rect { left: 100px; }
.spawn.export {left: 190px;}


.svg-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.connections {
  position: absolute;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
  z-index: 5;
  border: 2px solid red;
  color: black;
}
</style>