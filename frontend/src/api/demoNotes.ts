import { apiClient } from "./client";

export interface DemoNote {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const demoNotesApi = {
  async list(): Promise<DemoNote[]> {
    const r = await apiClient.get("/api/v1/demo/notes");
    return r.data;
  },

  async create(data: { title: string; content: string }): Promise<DemoNote> {
    const r = await apiClient.post("/api/v1/demo/notes", data);
    return r.data;
  },

  async update(
    id: string,
    data: { title?: string; content?: string },
  ): Promise<DemoNote> {
    const r = await apiClient.patch(`/api/v1/demo/notes/${id}`, data);
    return r.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/demo/notes/${id}`);
  },
};
