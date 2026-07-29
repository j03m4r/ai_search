// composables/useParticipant.ts
import { ref } from "vue";
import { apiFetch } from "@/lib/api";

const participantId = ref<number | null>(null);
const condition = ref<string | null>(null);
const phase = ref<string | null>("loading");

async function initParticipant() {
    const stored = localStorage.getItem("participant_id");

    if (!stored) {
        const res = await apiFetch("/api/participant", { method: "POST" });
        const data = await res.json();
        localStorage.setItem("participant_id", String(data.participant_id));
        localStorage.setItem("participant_token", data.token);
        participantId.value = data.participant_id;
        condition.value = data.condition;
        phase.value = "pre_task";
        return;
    }

    participantId.value = parseInt(stored, 10);
    const res = await apiFetch(`/api/participant/${participantId.value}`);
    if (res.status === 404) {
        localStorage.removeItem("participant_id");
        localStorage.removeItem("participant_token");
        return initParticipant();
    }

    const status = await res.json();
    condition.value = status.condition;
    phase.value = status.phase;

    const isScreenout = localStorage.getItem("so")
    if (isScreenout === "yes") {
        phase.value = "screenout";
    }

    const numFailedAttentionChecks = parseInt(localStorage.getItem("fac") || "0", 10)
    if (numFailedAttentionChecks >= 2) {
        phase.value = "rejected";
    }
}

async function submitPreTaskData(payload: object) {
    const res = await apiFetch("/api/pre_task_data", {
        method: "POST",
        body: JSON.stringify({ participant_id: participantId.value, ...payload }),
    });

    if (res.status !== 201) return

    phase.value = "main"
}

async function screenout() {
    localStorage.setItem("so", "yes")
    phase.value = "screenout"
    await apiFetch(`/api/participant/${participantId.value}/status`, {
        method: "POST",
        body: JSON.stringify({ status: "screened_out" }),
    });
}

async function reject() {
    phase.value = "rejected"
    await apiFetch(`/api/participant/${participantId.value}/status`, {
        method: "POST",
        body: JSON.stringify({ status: "rejected" }),
    });
}

async function submitPostTaskData(payload: object) {
    const res = await apiFetch("/api/post_task_data", {
        method: "POST",
        body: JSON.stringify({ participant_id: participantId.value, ...payload }),
    });

    if (res.status !== 201) return;

    phase.value = "completion_code"
}

async function submitLog( type: string, timestamp: number, data: object) {
    // console.log({ participant_id: participantId.value, type: type, timestamp: timestamp, data: data })
    const res = await apiFetch("/api/log", {
        method: "POST",
        body: JSON.stringify({ participant_id: participantId.value, type: type, timestamp: timestamp, data: data }),
    });

    if (res.status !== 201) return

    if (type === "final-state-snapshot") {
        phase.value = "post_task"
    }
}

async function fetchSubmittedAt() {
    const res = await apiFetch(`/api/pre_task_data/${participantId.value}/created_at`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.created_at ?? null;
}

export function useParticipant() {
    return { participantId, condition, phase, initParticipant, submitPreTaskData, submitPostTaskData, submitLog, fetchSubmittedAt, screenout, reject };
}