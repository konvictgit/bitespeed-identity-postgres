INSERT INTO public.contact (phonenumber, email, linkedid, linkprecedence, createdat, updatedat)
VALUES
  -- Lorraine (primary)
  ('123456', 'lorraine@hillvalley.edu', NULL, 'primary', NOW(), NOW()),

  -- Marty (secondary, same phone, new email)
  ('123456', 'mcfly@hillvalley.edu', 1, 'secondary', NOW(), NOW()),

  -- George (primary, different phone)
  ('919191', 'george@hillvalley.edu', NULL, 'primary', NOW(), NOW()),

  -- Biff (primary, different phone)
  ('717171', 'biffsucks@hillvalley.edu', NULL, 'primary', NOW(), NOW());
