-- Migration: Add unique constraint to reveals table
-- Prevents duplicate reveals for the same (user_id, contact_id) pair,
-- enabling INSERT IGNORE to work correctly and blocking race-condition double-deductions.

-- Remove duplicate rows first (keep earliest reveal per pair)
DELETE r1 FROM reveals r1
INNER JOIN reveals r2
WHERE r1.id > r2.id
  AND r1.user_id = r2.user_id
  AND r1.contact_id = r2.contact_id;

-- Add unique constraint
ALTER TABLE reveals
    ADD UNIQUE KEY unique_user_contact (user_id, contact_id);
