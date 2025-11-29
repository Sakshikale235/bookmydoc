// import { createClient } from '@supabase/supabase-js'

// const supabase = createClient(
//   'https://ajtekovqiuatmefyoncu.supabase.co/',           // e.g. https://abcd.supabase.co
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqdGVrb3ZxaXVhdG1lZnlvbmN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU2MzgyMiwiZXhwIjoyMDc0MTM5ODIyfQ.qA37obZaTFcEaTJWkoi_OKorL6jsrBpZNLfT3YRHRHQ'        // NOT anon key
// )

// async function resetPassword() {
//   const { data, error } = await supabase.auth.admin.updateUserById(
//     'UID',  'efdbe6d8-15cd-4e6e-8464-4cc1231afb7d',  // the user's UID
//     { password: 'Sakshikale@123456' }             // your new password
//   )

//   console.log("DATA:", data)
//   console.log("ERROR:", error)
// }

// resetPassword()

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ajtekovqiuatmefyoncu.supabase.co/',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqdGVrb3ZxaXVhdG1lZnlvbmN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU2MzgyMiwiZXhwIjoyMDc0MTM5ODIyfQ.qA37obZaTFcEaTJWkoi_OKorL6jsrBpZNLfT3YRHRHQ'   // Not anon key
)

// async function resetPassword() {
//   const userId = "efdbe6d8-15cd-4e6e-8464-4cc1231afb7d";  // MUST be a string

//   const { data, error } = await supabase.auth.admin.updateUserById(
//     userId,
//     { password: 'Sakshikale@123' }
//   );

//   console.log("DATA:", data);
//   console.log("ERROR:", error);
// }


async function resetPassword() {
  const userId = "4ceb013e-8185-4360-852d-959bdd3a0120";  // MUST be a string

  const { data, error } = await supabase.auth.admin.updateUserById(
    userId,
    { password: 'Sakshikale@123' }
  );

  console.log("DATA:", data);
  console.log("ERROR:", error);
}
resetPassword();
