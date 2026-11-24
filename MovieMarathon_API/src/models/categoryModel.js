import { getSupabase } from "../config/supabaseClient.js";

export const CategoryModel = {
  async getAll() {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create({ name, description = "" }) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("categories")
      .insert([{ name, description }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, { name, description }) {
    const supabase = getSupabase();
    const payload = {};
    if (name !== undefined) payload.name = name;
    if (description !== undefined) payload.description = description;

    const { data, error } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const supabase = getSupabase();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
    return { message: "Category deleted successfully" };
  },
};
