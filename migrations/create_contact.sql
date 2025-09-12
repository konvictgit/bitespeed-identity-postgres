CREATE TABLE IF NOT EXISTS public.contact
(
    id SERIAL PRIMARY KEY,
    phonenumber text,
    email text,
    linkedid integer REFERENCES public.contact(id),
    linkprecedence VARCHAR(10) NOT NULL CHECK (linkprecedence IN ('primary','secondary')),
    createdat TIMESTAMPTZ NOT NULL,
    updatedat TIMESTAMPTZ NOT NULL,
    deletedat TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_contact_email ON public.contact(email);
CREATE INDEX IF NOT EXISTS idx_contact_phone ON public.contact(phonenumber);
CREATE INDEX IF NOT EXISTS idx_contact_linkedid ON public.contact(linkedid);
