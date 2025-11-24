import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ajtekovqiuatmefyoncu.supabase.co',           // e.g. https://abcd.supabase.co
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqdGVrb3ZxaXVhdG1lZnlvbmN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU2MzgyMiwiZXhwIjoyMDc0MTM5ODIyfQ.qA37obZaTFcEaTJWkoi_OKorL6jsrBpZNLfT3YRHRHQ'        // NOT anon key
)

// async function resetPassword() {
//   const { data, error } = await supabase.auth.admin.updateUserById(
//     '6c3ee28b-eb0f-4498-88c1-454c9769ef14',  // your user id
//     { password: 'riya@gdg' }             // your new password
//   )

//   console.log("DATA:", data)
//   console.log("ERROR:", error)
// }

// resetPassword()

const run = async () => {
  const { data, error } = await supabase.auth.admin.deleteUser(
    "6c3ee28b-eb0f-4498-88c1-454c9769ef14"
  );
  console.log("data:", data, "error:", error);
};

run();