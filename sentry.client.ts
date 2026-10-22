import * as Sentry from '@sentry/nextjs';

const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

const isEnabled = !!sentryDsn && process.env.NODE_ENV === 'production';

Sentry.init({
  dsn: sentryDsn,
  enabled: isEnabled,
  environment: process.env.NODE_ENV,
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  // ...
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the `--release` flag or the `sentry-cli` release
  // subcommand.
  // Tracing is automatically initialized for the App Router and pages.
  // If you're using the Pages Router, you need to manually add Sentry to your
  // `_app.tsx` file.
});

export default Sentry;