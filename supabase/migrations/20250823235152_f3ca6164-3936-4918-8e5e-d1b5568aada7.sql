-- 1) Add location column to messages
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS location text;

-- 2) Backfill existing rows to "lisbon"
UPDATE public.messages
SET location = 'lisbon'
WHERE location IS NULL;

-- 3) Set a default so current app inserts don’t break
ALTER TABLE public.messages
ALTER COLUMN location SET DEFAULT 'lisbon';

-- 4) Index to speed up location + time queries
CREATE INDEX IF NOT EXISTS idx_messages_location_created_at
ON public.messages (location, created_at);
