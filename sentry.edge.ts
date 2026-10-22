import * as Sentry from '@sentry/nextjs';

const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

const isEnabled = !!sentryDsn && process.env.NODE_ENV === 'production';

Sentry.init({
  dsn: sentryDsn,
  enabled: isEnabled,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

export default Sentry;