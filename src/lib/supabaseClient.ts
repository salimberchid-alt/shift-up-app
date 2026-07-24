import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://doeyyowptbnrqfcherdk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_p8ik-qVHxBX-HTjFsVA4Tg_jf_Gn8Fa";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
