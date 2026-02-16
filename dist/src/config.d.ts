/**
 * Config resolution for seks-tools CLIs.
 *
 * Order:
 * 1. Env vars (SEKS_BROKER_URL + SEKS_BROKER_TOKEN)
 * 2. ~/.openclaw/openclaw.json → seks.broker.primary / seks.broker.secondary
 * 3. ~/.openclaw/openclaw.json → seks.broker.url / seks.broker.token (legacy)
 */
import type { BrokerConfig } from '@seksbot/broker-client';
export declare function loadConfig(): BrokerConfig;
