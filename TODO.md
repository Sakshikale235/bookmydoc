# TODO: Fix Doctor Registration and Login Issues

## Issues
1. Medical license and certificates not saved to storage buckets during doctor registration.
2. Doctor registration email/password not saved in users table for authentication.
3. Login not redirecting doctors to /doctor_selfprofile.

## Plan
1. **Create users table** for custom authentication.
2. **Install bcryptjs** for password hashing.
3. **Modify DoctorRegistration.tsx**:
   - Add password hashing and insert into users table.
   - Add upload logic for medicalLicenseFile to 'medical_license' bucket.
   - Add upload logic for medicalCertificatesFile to 'certificates' bucket.
   - Update doctors insert to include medical_license and medical_certificates URLs.
4. **Modify LoginPage.tsx**:
   - Add logic to check users table first for authentication.
   - If found, verify password and redirect based on role.
   - Fallback to Supabase auth for patients.
5. **Test** doctor registration and login.

## Steps
- [ ] Create users table in Supabase: id (uuid pk), email (text unique), password_hash (text), role (text), created_at (timestamp).
- [ ] Install bcryptjs in react-frontend.
- [ ] Update DoctorRegistration.tsx handleSubmitAsync.
- [ ] Update LoginPage.tsx handleLogin.
- [ ] Test registration: files uploaded, profile created, users inserted.
- [ ] Test login: doctors redirect to /doctor_selfprofile.
