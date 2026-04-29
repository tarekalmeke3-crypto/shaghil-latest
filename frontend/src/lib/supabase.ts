import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://msmhmpfdrklzilkxqdpd.supabase.co';
const supabaseAnonKey = 'sb_publishable_VHSLA9o0MpNx4s3dDoLTdQ_MKfT53Ad';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);