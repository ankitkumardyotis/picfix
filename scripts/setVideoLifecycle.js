/**
 * Adds an R2 lifecycle rule that deletes generated videos 1 day after upload.
 * Videos are stored under the "video-tmp/" prefix (see lib/videoJobs.js).
 * Existing lifecycle rules on the bucket are kept; only the "expire-video-tmp" rule is replaced.
 *
 * Usage: node scripts/setVideoLifecycle.js
 * Needs R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME in the environment.
 * The key needs permission to edit bucket settings (Admin Read & Write).
 */

const {
  S3Client,
  GetBucketLifecycleConfigurationCommand,
  PutBucketLifecycleConfigurationCommand,
} = require('@aws-sdk/client-s3');

const RULE_ID = 'expire-video-tmp';
const PREFIX = 'video-tmp/';
const EXPIRE_AFTER_DAYS = 1;

const client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function main() {
  const Bucket = process.env.R2_BUCKET_NAME;
  if (!Bucket) throw new Error('R2_BUCKET_NAME is not set');

  let existing = [];
  try {
    const current = await client.send(new GetBucketLifecycleConfigurationCommand({ Bucket }));
    existing = current.Rules || [];
  } catch (error) {
    if (error.name !== 'NoSuchLifecycleConfiguration') throw error;
  }

  const rules = [
    ...existing.filter((rule) => rule.ID !== RULE_ID),
    {
      ID: RULE_ID,
      Status: 'Enabled',
      Filter: { Prefix: PREFIX },
      Expiration: { Days: EXPIRE_AFTER_DAYS },
    },
  ];

  await client.send(new PutBucketLifecycleConfigurationCommand({
    Bucket,
    LifecycleConfiguration: { Rules: rules },
  }));

  console.log(`Lifecycle set on ${Bucket}: delete "${PREFIX}" objects after ${EXPIRE_AFTER_DAYS} day(s).`);
  console.log(`Rules on the bucket now: ${rules.map((rule) => rule.ID).join(', ')}`);
}

main().catch((error) => {
  console.error('Failed to set lifecycle rule:', error.message);
  process.exit(1);
});
