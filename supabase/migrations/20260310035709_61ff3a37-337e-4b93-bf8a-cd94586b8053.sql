CREATE POLICY "Users can insert own feedback" ON public.suggestion_feedback FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own feedback" ON public.suggestion_feedback FOR SELECT TO authenticated USING (auth.uid() = user_id);