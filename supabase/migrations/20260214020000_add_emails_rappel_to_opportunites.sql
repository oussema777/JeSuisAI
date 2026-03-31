-- Migration: Add emails_rappel column to opportunites table
ALTER TABLE public.opportunites 
ADD COLUMN IF NOT EXISTS emails_rappel TEXT;

-- Update the comment to describe the column
COMMENT ON COLUMN public.opportunites.emails_rappel IS 'Additional emails for sending reminders after 14 days of pending candidatures';
