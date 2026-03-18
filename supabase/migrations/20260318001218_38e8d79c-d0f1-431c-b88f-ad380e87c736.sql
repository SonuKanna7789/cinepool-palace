CREATE POLICY "Authenticated users can insert movies"
ON public.movies
FOR INSERT
TO authenticated
WITH CHECK (true);