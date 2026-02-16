/**
 * Config resolution for seks-tools CLIs.
 * 
 * Order:
 * 1. Env vars (SEKS_BROKER_URL + SEKS_BROKER_TOKEN)
 * 2. ~/.openclaw/openclaw.json → seks.broker.primary / seks.broker.secondary
 * 3. ~/.openclaw/openclaw.json → seks.broker.url / seks.broker.token (legacy)
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { BrokerConfig } from '@seksbot/broker-client';

export function loadConfig(): BrokerConfig {
  // 1. Env vars
  const envUrl = process.env['SEKS_BROKER_URL'];
  const envToken = process.env['SEKS_BROKER_TOKEN'];
  if (envUrl && envToken) {
    return { primary: { url: envUrl, token: envToken } };
  }

  // 2-3. openclaw.json
  const configPath = join(homedir(), '.openclaw', 'openclaw.json');
  let raw: string;
  try {
    raw = readFileSync(configPath, 'utf-8');
  } catch {
    throw new Error(
      'No broker config found. Set SEKS_BROKER_URL + SEKS_BROKER_TOKEN or configure ~/.openclaw/openclaw.json'
    );
  }

  const json = JSON.parse(raw) as Record<string, unknown>;
  const seks = json['seks'] as Record<string, unknown> | undefined;
  const broker = seks?.['broker'] as Record<string, unknown> | undefined;
  if (!broker) {
    throw new Error('No seks.broker section in ~/.openclaw/openclaw.json');
  }

  // Primary/secondary pattern
  const primary = broker['primary'] as { url?: string; token?: string; tokenCommand?: string } | undefined;
  if (primary?.url && (primary.token || primary.tokenCommand)) {
    const config: BrokerConfig = {
      primary: { url: primary.url, ...(primary.token ? { token: primary.token } : { tokenCommand: primary.tokenCommand! }) },
    };
    const secondary = broker['secondary'] as { url?: string; token?: string; tokenCommand?: string } | undefined;
    if (secondary?.url && (secondary.token || secondary.tokenCommand)) {
      config.secondary = { url: secondary.url, ...(secondary.token ? { token: secondary.token } : { tokenCommand: secondary.tokenCommand! }) };
    }
    return config;
  }

  // Legacy single-broker
  const url = broker['url'] as string | undefined;
  const token = broker['token'] as string | undefined;
  if (url && token) {
    return { primary: { url, token } };
  }

  throw new Error('Invalid broker config in ~/.openclaw/openclaw.json');
}
