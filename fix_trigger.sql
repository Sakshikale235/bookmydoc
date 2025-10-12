-- Drop the existing trigger and function if they exist
DROP TRIGGER IF EXISTS notify_doctor_on_appointment_trigger ON appointments;
DROP FUNCTION IF EXISTS notify_doctor_on_appointment();

-- Create the corrected function
CREATE OR REPLACE FUNCTION notify_doctor_on_appointment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (receiver_id, message, sender_id, type)
  SELECT
    d.auth_id,  -- doctor's auth_id for receiver_id
    'New appointment booked for ' || to_char(NEW.appointment_date, 'Mon DD, YYYY at HH12:MI AM'),
    p.auth_id,  -- patient's auth_id for sender_id
    'appointment'
  FROM doctors d, patients p
  WHERE d.id = NEW.doctor_id AND p.id = NEW.patient_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER notify_doctor_on_appointment_trigger
AFTER INSERT ON appointments
FOR EACH ROW
EXECUTE FUNCTION notify_doctor_on_appointment();
