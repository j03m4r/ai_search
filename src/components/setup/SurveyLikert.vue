<script setup lang="ts">
    import { ref, useId } from 'vue';
    const props = defineProps(['likertOptions', 'statements', 'ratings']);
    const instanceId = useId();
    const valHovered = ref(null);

    const emit = defineEmits<{
        (e: 'update:ratings', ratings: number[]): void;
    }>();

    const onSelect = (scaleIdx: number, val: number) => {
        const updatedRatings = [...props.ratings];
        updatedRatings[scaleIdx] = val;
        emit('update:ratings', updatedRatings);
    };
</script>

<template>
    <div class="w-full flex flex-col text-gray-600">
        <div class="w-full flex flex-col">
            <div className="flex w-full justify-between">
                <div className="min-w-87.5"></div>
                <div className="flex w-full justify-between items-center h-full gap-x-4 pl-4">
                    <div
                        v-for="option in props.likertOptions"
                        :key="`val_${option.val}`"
                        class="w-full flex justify-center py-4 h-full text-lg border-b-2 font-semibold! text-center"
                        :class="valHovered === option.val ? 'border-indigo-500' : 'border-transparent'"
                    >
                        {{ option.label }}
                    </div>
                </div>
            </div>
        </div>
        <div v-for="(statement, idx) in props.statements" class="flex w-full gap-x-4 justify-center h-full items-center">
            <p class="font-semibold! text-wrap min-w-87.5 max-w-87.5 pl-4 text-xl">
            {{ statement }}
            </p>
            <div class="flex w-full justify-between items-center h-full gap-x-4 py-2">
            <label
                v-for="option in props.likertOptions"
                :key="`${statement}_${option.label}`"
                class="flex flex-col gap-y-2 items-center justify-center cursor-pointer w-full h-full rounded-lg hover:bg-indigo-500/10 py-12"
                @mouseenter="valHovered = option.val"
                @mouseleave="valHovered = null"
            >
                <input
                    type="radio"
                    :name="`likert-${instanceId}-${idx}`"
                    :value="option.val"
                    :checked="props.ratings[idx] === option.val"
                    class="cursor-pointer w-5! h-5!"
                    @change="() => onSelect(Number(idx), option.val)"
                />
            </label>
            </div>
        </div>
    </div>
</template>