import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'your supabase id',           // e.g. https://abcd.supabase.co
  'your supabase service role key'        // NOT anon key
)

async function resetPassword() {
  const { data, error } = await supabase.auth.admin.updateUserById(
    'UID',  // your user id
    { password: 'password' }             // your new password
  )

  console.log("DATA:", data)
  console.log("ERROR:", error)
}

resetPassword()

// const run = async () => {
//   const { data, error } = await supabase.auth.admin.deleteUser(
//     "UID"
//   );
//   console.log("data:", data, "error:", error);
// };

// run();
