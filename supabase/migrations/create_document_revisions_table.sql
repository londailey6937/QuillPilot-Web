-- Revision History Table
-- Run this SQL in Supabase SQL Editor to create the document_revisions table

CREATE TABLE IF NOT EXISTS public.document_revisions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    content TEXT NOT NULL,
    plain_text TEXT NOT NULL,
    word_count INTEGER NOT NULL DEFAULT 0,
    note TEXT,
    auto_saved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_document_revisions_user_id ON public.document_revisions(user_id);
CREATE INDEX IF NOT EXISTS idx_document_revisions_created_at ON public.document_revisions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_revisions_auto_saved ON public.document_revisions(auto_saved);

-- Enable Row Level Security
ALTER TABLE public.document_revisions ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can only see their own revisions
CREATE POLICY "Users can view their own revisions"
    ON public.document_revisions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own revisions
CREATE POLICY "Users can insert their own revisions"
    ON public.document_revisions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own revisions (for notes)
CREATE POLICY "Users can update their own revisions"
    ON public.document_revisions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own revisions
CREATE POLICY "Users can delete their own revisions"
    ON public.document_revisions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
CREATE TRIGGER update_document_revisions_updated_at
    BEFORE UPDATE ON public.document_revisions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Function to clean up old auto-saved revisions (can be called periodically)
CREATE OR REPLACE FUNCTION cleanup_old_autosaves(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.document_revisions
    WHERE auto_saved = true
    AND created_at < NOW() - (days_old || ' days')::INTERVAL
    AND user_id = auth.uid();

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
