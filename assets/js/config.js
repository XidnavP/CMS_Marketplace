const SUPABASE_URL = "https://lktanoblozjgrhgnytvq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrdGFub2Jsb3pqZ3JoZ255dHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4OTM2MzQsImV4cCI6MjA4NDQ2OTYzNH0.sK6KVHGCTQ8knLRl2j-ur3LBhEr3rtH_fN2LbH6uuEE";


window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log("✅ Supabase client initialized");