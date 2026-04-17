ALTER TABLE recurrences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own recurrences" ON recurrences;
CREATE POLICY "Users can manage their own recurrences" ON recurrences
    FOR ALL USING (auth.uid() = user_id);
