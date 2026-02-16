#!/usr/bin/env node
/**
 * listseks — list available secrets/capabilities from the SEKS broker
 */
import { getClient } from '../client.js';
function usage() {
    console.error(`Usage: listseks [options]

List available secrets and capabilities from the SEKS broker.

Options:
  --capabilities       List by capability
  --provider <name>    Filter by provider
  --json               JSON output
  --help               Show this help`);
    process.exit(1);
}
function parseArgs(argv) {
    const opts = { capabilities: false, json: false };
    for (let i = 0; i < argv.length; i++) {
        switch (argv[i]) {
            case '--capabilities':
                opts.capabilities = true;
                break;
            case '--provider':
                opts.provider = argv[++i];
                break;
            case '--json':
                opts.json = true;
                break;
            case '--help':
                usage();
            default:
                console.error(`Unknown option: ${argv[i]}`);
                usage();
        }
    }
    return opts;
}
async function main() {
    const opts = parseArgs(process.argv.slice(2));
    const client = getClient();
    const caps = await client.listCapabilities();
    if (opts.json) {
        let output = caps;
        if (opts.provider) {
            output = {
                ...caps,
                providers: caps.providers.filter(p => p === opts.provider || p.startsWith(`${opts.provider}/`)),
            };
        }
        if (opts.capabilities) {
            output = {
                providers: caps.providers,
                channels: caps.channels,
                features: caps.features,
            };
        }
        console.log(JSON.stringify(output, null, 2));
        return;
    }
    // Human-readable output
    if (opts.capabilities) {
        console.log('Capabilities:');
        console.log(`  Providers: ${caps.providers.join(', ') || '(none)'}`);
        console.log(`  Channels:  ${caps.channels.join(', ') || '(none)'}`);
        console.log(`  Features:  ${caps.features.join(', ') || '(none)'}`);
        return;
    }
    if (opts.provider) {
        const matching = caps.providers.filter(p => p === opts.provider || p.startsWith(`${opts.provider}/`));
        if (matching.length === 0) {
            console.log(`No providers matching: ${opts.provider}`);
        }
        else {
            console.log(`Providers matching "${opts.provider}":`);
            for (const p of matching) {
                console.log(`  ${p}`);
            }
        }
        return;
    }
    // Default: list all
    console.log(`Agent: ${caps.agent_name} (${caps.agent_id})`);
    console.log();
    console.log('Providers:');
    for (const p of caps.providers) {
        console.log(`  ${p}`);
    }
    if (caps.channels.length > 0) {
        console.log();
        console.log('Channels:');
        for (const c of caps.channels) {
            console.log(`  ${c}`);
        }
    }
    if (caps.features.length > 0) {
        console.log();
        console.log('Features:');
        for (const f of caps.features) {
            console.log(`  ${f}`);
        }
    }
}
main().catch(err => {
    console.error(`Error: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
});
//# sourceMappingURL=listseks.js.map