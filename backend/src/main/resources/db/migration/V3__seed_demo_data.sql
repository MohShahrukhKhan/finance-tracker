-- Seed demo data for shahrukh@gmail.com (user_id = 1)
DO $$
DECLARE
  uid CONSTANT BIGINT := 1;
  cat_home UUID := 'a92f6d84-5ecf-46e3-8b27-4e3e9e167ce0';
  cat_office UUID := 'e8cc1715-0e95-463b-adff-34d205edb4a2';
  cat_salary UUID := 'dafc8346-608f-46c7-8251-64d6f04bb176';
  cat_food UUID := 'b7892f4d-f8e0-4234-905f-5b49cd5505f7';
  cat_rent UUID := '972726e4-4654-4acb-87e1-d709d6dafd45';
  cat_freelance UUID := 'b875eccd-407b-45ff-a684-99499cf103eb';
  cat_transport UUID := '25b5b8e9-7d97-405f-8a53-92263299a706';
  cat_shopping UUID := 'f1a2b3c4-d5e6-7890-abcd-ef0123456789';
  cat_health UUID := 'f2a2b3c4-d5e6-7890-abcd-ef0123456789';
BEGIN

-- Skip if already seeded
IF EXISTS (SELECT 1 FROM categories WHERE user_id = uid AND name = 'Salary') THEN
  RETURN;
END IF;

-- Categories
INSERT INTO categories (uuid, user_id, name, type, icon) VALUES
  (cat_home, uid, 'Home', 'EXPENSE', '🏠'),
  (cat_office, uid, 'Office', 'INCOME', '🏢'),
  (cat_salary, uid, 'Salary', 'INCOME', '💰'),
  (cat_food, uid, 'Food', 'EXPENSE', '🍔'),
  (cat_rent, uid, 'Rent', 'EXPENSE', '🏡'),
  (cat_freelance, uid, 'Freelance', 'INCOME', '💻'),
  (cat_transport, uid, 'Transport', 'EXPENSE', '🚗'),
  (cat_shopping, uid, 'Shopping', 'EXPENSE', '🛍️'),
  (cat_health, uid, 'Health', 'EXPENSE', '🏥');

-- January 2026
INSERT INTO transactions (uuid, user_id, category_id, amount, note, transaction_date) VALUES
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_salary), 80000.00, 'January salary', '2026-01-01'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_rent), 18000.00, 'January rent', '2026-01-01'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_food), 5000.00, 'Monthly groceries', '2026-01-05'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_transport), 1500.00, 'Cab & metro', '2026-01-10'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_food), 3000.00, 'Dining out', '2026-01-20');

-- February 2026
INSERT INTO transactions (uuid, user_id, category_id, amount, note, transaction_date) VALUES
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_salary), 80000.00, 'February salary', '2026-02-01'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_rent), 18000.00, 'February rent', '2026-02-01'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_food), 4500.00, 'Groceries', '2026-02-08'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_transport), 1200.00, 'Metro pass', '2026-02-12'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_freelance), 10000.00, 'Freelance website project', '2026-02-15'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_home), 2500.00, 'Home maintenance', '2026-02-20');

-- March 2026
INSERT INTO transactions (uuid, user_id, category_id, amount, note, transaction_date) VALUES
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_salary), 85000.00, 'March salary', '2026-03-01'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_rent), 18000.00, 'March rent', '2026-03-01'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_food), 5500.00, 'Groceries & dining', '2026-03-07'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_transport), 1000.00, 'Fuel', '2026-03-14'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_food), 2000.00, 'Restaurant', '2026-03-22');

-- April 2026
INSERT INTO transactions (uuid, user_id, category_id, amount, note, transaction_date) VALUES
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_salary), 85000.00, 'April salary', '2026-04-01'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_rent), 20000.00, 'April rent (increase)', '2026-04-01'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_food), 5000.00, 'Groceries', '2026-04-06'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_transport), 2000.00, 'Travel & metro', '2026-04-11'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_freelance), 12000.00, 'Freelance mobile app', '2026-04-18'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_home), 1800.00, 'Electrician visit', '2026-04-25');

-- May 2026
INSERT INTO transactions (uuid, user_id, category_id, amount, note, transaction_date) VALUES
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_salary), 85000.00, 'May salary', '2026-05-01'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_rent), 20000.00, 'May rent', '2026-05-01'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_food), 5500.00, 'Groceries', '2026-05-09'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_transport), 1000.00, 'Metro card', '2026-05-15'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_food), 2500.00, 'Birthday dinner', '2026-05-23'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_shopping), 4000.00, 'New clothes', '2026-05-20'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_health), 1500.00, 'Doctor visit', '2026-05-12');

-- June 2026
INSERT INTO transactions (uuid, user_id, category_id, amount, note, transaction_date) VALUES
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_salary), 85000.00, 'June salary', '2026-06-01'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_rent), 20000.00, 'June rent', '2026-06-01'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_food), 500.00, 'Groceries', '2026-06-02'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_transport), 200.00, 'Metro card', '2026-06-03'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_freelance), 15000.00, 'Freelance project', '2026-06-05'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_food), 800.00, 'Dinner out', '2026-06-10'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_transport), 500.00, 'Cab to airport', '2026-06-15'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_food), 1200.00, 'Monthly groceries', '2026-06-20'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_freelance), 8000.00, 'Freelance website revamp', '2026-06-25'),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_office), 5000.00, 'Office expense reimbursement', '2026-06-28');

-- Budgets
INSERT INTO budgets (uuid, user_id, category_id, month, amount) VALUES
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_food), '2026-06-01'::date, 8000.00),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_rent), '2026-06-01'::date, 20000.00),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_transport), '2026-06-01'::date, 3000.00),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_shopping), '2026-06-01'::date, 5000.00),
  (gen_random_uuid(), uid, (SELECT id FROM categories WHERE uuid = cat_health), '2026-06-01'::date, 2000.00);

END $$;
