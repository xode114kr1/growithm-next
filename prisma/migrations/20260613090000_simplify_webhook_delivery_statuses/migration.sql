-- AlterEnum
BEGIN;

CREATE TYPE "WebhookDeliveryStatus_new" AS ENUM (
  'received',
  'queued',
  'processing',
  'ignored',
  'processed',
  'failed'
);

ALTER TABLE "webhook_deliveries"
ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "webhook_deliveries"
ALTER COLUMN "status" TYPE "WebhookDeliveryStatus_new"
USING (
  CASE "status"::text
    WHEN 'no_readme' THEN 'processed'
    WHEN 'parse_failed' THEN 'failed'
    WHEN 'fetch_failed' THEN 'failed'
    WHEN 'retry_pending' THEN 'failed'
    ELSE "status"::text
  END
)::"WebhookDeliveryStatus_new";

DROP TYPE "WebhookDeliveryStatus";

ALTER TYPE "WebhookDeliveryStatus_new"
RENAME TO "WebhookDeliveryStatus";

ALTER TABLE "webhook_deliveries"
ALTER COLUMN "status" SET DEFAULT 'received';

COMMIT;
