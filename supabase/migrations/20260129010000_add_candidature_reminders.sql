-- Create a function to send reminders for old candidatures
CREATE OR REPLACE FUNCTION public.send_candidature_reminders()
RETURNS void AS $$
DECLARE
  candidature_record RECORD;
  opportunite_record RECORD;
  contact_email TEXT;
  user_id_to_notify UUID;
BEGIN
  -- Find candidatures that are 14 days old or more and have a pending status
  FOR candidature_record IN
    SELECT * FROM public.candidatures
    WHERE created_at <= now() - interval '14 days'
    AND (statut = 'en attente' OR statut = 'nouveau')
  LOOP
    -- Get the opportunite associated with the candidature
    SELECT * INTO opportunite_record FROM public.opportunites WHERE id = candidature_record.opportunite_id;

    -- Loop through the contact emails and send notifications
    FOREACH contact_email IN ARRAY opportunite_record.contacts
    LOOP
      -- Find the user ID for the contact email
      SELECT id INTO user_id_to_notify FROM auth.users WHERE email = contact_email;

      -- If a user is found, insert a notification
      IF user_id_to_notify IS NOT NULL THEN
        INSERT INTO public.notifications (recipient_user_id, title, message, data, type)
        VALUES (
          user_id_to_notify,
          'Rappel de candidature en attente',
          'La candidature pour l''opportunité "' || opportunite_record.titre || '" est en attente depuis plus de 14 jours.',
          jsonb_build_object('candidature_id', candidature_record.id, 'opportunite_id', candidature_record.opportunite_id),
          'candidature_reminder'
        );
      END IF;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule the function to run once a day at midnight
-- This needs to be run in the Supabase dashboard's SQL editor
-- Go to Database -> Functions -> Create a new function, and then run the following:
-- SELECT cron.schedule('daily-candidature-reminder', '0 0 * * *', 'SELECT public.send_candidature_reminders()');
