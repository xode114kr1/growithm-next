ALTER TABLE "users" ADD COLUMN "score" DOUBLE PRECISION NOT NULL DEFAULT 0;

UPDATE "problem_submissions"
SET "score" = CASE
    WHEN "platform" = 'baekjoon' AND LOWER("tier") LIKE 'bronze v' THEN 1
    WHEN "platform" = 'baekjoon' AND LOWER("tier") LIKE 'bronze iv' THEN 2
    WHEN "platform" = 'baekjoon' AND LOWER("tier") LIKE 'bronze iii' THEN 3
    WHEN "platform" = 'baekjoon' AND LOWER("tier") LIKE 'bronze ii' THEN 4
    WHEN "platform" = 'baekjoon' AND LOWER("tier") LIKE 'bronze i' THEN 5
    WHEN "platform" = 'baekjoon' AND LOWER("tier") LIKE 'silver v' THEN 50
    WHEN "platform" = 'baekjoon' AND LOWER("tier") LIKE 'silver iv' THEN 100
    WHEN "platform" = 'baekjoon' AND LOWER("tier") LIKE 'silver iii' THEN 150
    WHEN "platform" = 'baekjoon' AND LOWER("tier") LIKE 'silver ii' THEN 200
    WHEN "platform" = 'baekjoon' AND LOWER("tier") LIKE 'silver i' THEN 250
    WHEN "platform" = 'baekjoon' AND LOWER("tier") LIKE 'gold v' THEN 2500
    WHEN "platform" = 'baekjoon' AND LOWER("tier") LIKE 'gold iv' THEN 5000
    WHEN "platform" = 'baekjoon' AND LOWER("tier") LIKE 'gold iii' THEN 7500
    WHEN "platform" = 'baekjoon' AND LOWER("tier") LIKE 'gold ii' THEN 10000
    WHEN "platform" = 'baekjoon' AND LOWER("tier") LIKE 'gold i' THEN 12500
    WHEN "platform" = 'baekjoon' AND LOWER("tier") LIKE 'platinum v' THEN 125000
    WHEN "platform" = 'baekjoon' AND LOWER("tier") LIKE 'platinum iv' THEN 250000
    WHEN "platform" = 'baekjoon' AND LOWER("tier") LIKE 'platinum iii' THEN 375000
    WHEN "platform" = 'baekjoon' AND LOWER("tier") LIKE 'platinum ii' THEN 500000
    WHEN "platform" = 'baekjoon' AND LOWER("tier") LIKE 'platinum i' THEN 625000
    WHEN "platform" = 'baekjoon' AND LOWER("tier") LIKE 'diamond v' THEN 6250000
    WHEN "platform" = 'baekjoon' AND LOWER("tier") LIKE 'diamond iv' THEN 12500000
    WHEN "platform" = 'baekjoon' AND LOWER("tier") LIKE 'diamond iii' THEN 18750000
    WHEN "platform" = 'baekjoon' AND LOWER("tier") LIKE 'diamond ii' THEN 25000000
    WHEN "platform" = 'baekjoon' AND LOWER("tier") LIKE 'diamond i' THEN 31250000
    WHEN "platform" = 'programmers' AND LOWER("tier") ~ '(lv\.?|level)\s*1' THEN 3
    WHEN "platform" = 'programmers' AND LOWER("tier") ~ '(lv\.?|level)\s*2' THEN 150
    WHEN "platform" = 'programmers' AND LOWER("tier") ~ '(lv\.?|level)\s*3' THEN 7500
    WHEN "platform" = 'programmers' AND LOWER("tier") ~ '(lv\.?|level)\s*4' THEN 375000
    WHEN "platform" = 'programmers' AND LOWER("tier") ~ '(lv\.?|level)\s*5' THEN 18750000
    ELSE 0
END;

UPDATE "users"
SET "score" = COALESCE((
    SELECT SUM("score")
    FROM "problem_submissions"
    WHERE "problem_submissions"."user_id" = "users"."id"
), 0);
