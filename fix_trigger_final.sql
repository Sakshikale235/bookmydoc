-- Drop the function first to avoid conflicts
DROP FUNCTION IF EXISTS public.handle_new_appointment();

-- Recreate the handle_new_appointment function with corrected receiver_id
CREATE OR REPLACE FUNCTION public.handle_new_appointment()
 RETURNS trigger
 LANGUAGE plpgsql
AS $trigger_function$
DECLARE
  patient_name TEXT;
  patient_auth_id UUID;
BEGIN
  -- Get the patient's name and auth_id from the patients table
  SELECT full_name, auth_id
  INTO patient_name, patient_auth_id
  FROM patients
  WHERE id = NEW.patient_id;

  -- Insert a new notification for the doctor using doctor's auth_id
  INSERT INTO notifications (
    sender_id,
    receiver_id,
    message,
    type,
    created_at
  )
  SELECT
    patient_auth_id,  -- patient's auth_id as sender_id
    d.auth_id,        -- doctor's auth_id as receiver_id
    '🩺 New appointment request from ' || COALESCE(patient_name, 'Unknown Patient'),
    'appointment_request',
    NOW()
  FROM doctors d
  WHERE d.id = NEW.doctor_id;

  RETURN NEW;
END;
$trigger_function$
