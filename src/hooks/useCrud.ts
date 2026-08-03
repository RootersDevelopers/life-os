"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui";

export type Row = Record<string, any> & { id: string };

export function useList(resource: string) {
  return useQuery<Row[]>({
    queryKey: [resource],
    queryFn: () => api<Row[]>(`/api/data/${resource}`),
  });
}

export function useCrud(resource: string) {
  const qc = useQueryClient();
  const { push } = useToast();
  const list = useList(resource);
  const key = [resource];

  const create = useMutation({
    mutationFn: (body: Record<string, any>) => api<Row>(`/api/data/${resource}`, { method: "POST", body: JSON.stringify(body) }),
    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Row[]>(key);
      const temp: Row = { ...body, id: `tmp-${Date.now()}` };
      qc.setQueryData<Row[]>(key, (old) => [temp, ...(old ?? [])]);
      return { prev };
    },
    onError: (e, _b, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      push("error", e.message || "Could not create item");
    },
    onSuccess: (row, _b, ctx) => {
      qc.setQueryData<Row[]>(key, (old) => (old ?? []).map((r) => (r.id.startsWith("tmp-") ? row : r)));
      push("success", "Saved successfully");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, any> }) =>
      api<Row>(`/api/data/${resource}/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Row[]>(key);
      qc.setQueryData<Row[]>(key, (old) => (old ?? []).map((r) => (r.id === id ? { ...r, ...patch } : r)));
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      push("error", e.message || "Update failed");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/api/data/${resource}/${id}`, { method: "DELETE" }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Row[]>(key);
      qc.setQueryData<Row[]>(key, (old) => (old ?? []).filter((r) => r.id !== id));
      return { prev };
    },
    onError: (e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      push("error", e.message || "Delete failed");
    },
    onSuccess: () => push("success", "Deleted"),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  return { ...list, create, update, remove };
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: () => api("/api/stats"),
  });
}

export function useDaily(date: string) {
  const qc = useQueryClient();
  const { push } = useToast();
  const query = useQuery({
    queryKey: ["daily", date],
    queryFn: () => api<{ water: number }>(`/api/daily?date=${date}`),
  });
  const setWater = useMutation({
    mutationFn: (water: number) => api(`/api/daily`, { method: "PATCH", body: JSON.stringify({ date, water }) }),
    onMutate: async (water) => {
      await qc.cancelQueries({ queryKey: ["daily", date] });
      const prev = qc.getQueryData<{ water: number }>(["daily", date]);
      qc.setQueryData(["daily", date], { water });
      return { prev };
    },
    onError: (e, _w, ctx) => {
      if (ctx?.prev) qc.setQueryData(["daily", date], ctx.prev);
      push("error", e.message);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["daily", date] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
  return { ...query, setWater };
}

export function useToggleHabit() {
  const qc = useQueryClient();
  const { push } = useToast();
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) =>
      api(`/api/habits/${id}/toggle`, { method: "POST", body: JSON.stringify({ date }) }),
    onMutate: async ({ id, date }) => {
      await qc.cancelQueries({ queryKey: ["habits"] });
      const prev = qc.getQueryData<Row[]>(["habits"]);
      qc.setQueryData<Row[]>(["habits"], (old) =>
        (old ?? []).map((h) => {
          if (h.id !== id) return h;
          const logs: string[] = h.logDates ?? [];
          const has = logs.includes(date);
          return { ...h, logDates: has ? logs.filter((d) => d !== date) : [...logs, date] };
        })
      );
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["habits"], ctx.prev);
      push("error", e.message);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["habits"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}
