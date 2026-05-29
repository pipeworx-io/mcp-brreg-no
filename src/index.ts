interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Brønnøysund Register Centre (BRREG) MCP — Norway's official business register.
 * Enhetsregisteret (entities) + Regnskapsregisteret (annual accounts). Keyless.
 *
 * orgnr = 9-digit Norwegian organisation number (e.g. Equinor 923609016).
 * Response fields are in Norwegian: navn=name, organisasjonsform=org form,
 * naeringskode1=industry code (NACE), forretningsadresse=business address,
 * postadresse=postal address, antallAnsatte=employee count.
 */


const ENHET = 'https://data.brreg.no/enhetsregisteret/api';
const REGNSKAP = 'https://data.brreg.no/regnskapsregisteret/regnskap';
const UA = 'pipeworx-mcp-brreg-no/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search_entities',
    description:
      'Search Norwegian companies/organisations (Enhetsregisteret) by name + filters. Results under _embedded.enheter. navn=name, organisasjonsform=org form (e.g. ASA, AS, ENK), naeringskode=industry, forretningsadresse=business address. e.g. {navn:"equinor"} or {navn:"bank", organisasjonsform:"ASA", kommunenummer:"0301"}.',
    inputSchema: {
      type: 'object',
      properties: {
        navn: { type: 'string', description: 'Full-text name search, e.g. "equinor".' },
        organisasjonsform: { type: 'string', description: 'Org form code, e.g. "ASA", "AS", "ENK".' },
        kommunenummer: { type: 'string', description: 'Municipality number, e.g. "0301" (Oslo).' },
        size: { type: 'number', description: 'Results per page (default 20, max 10000).' },
        page: { type: 'number', description: 'Zero-based page number (default 0).' },
      },
    },
  },
  {
    name: 'get_entity',
    description:
      'Full record for one entity by 9-digit org number. e.g. {orgnr:"923609016"} (Equinor ASA). Returns navn, organisasjonsform, naeringskode1, forretningsadresse, antallAnsatte, stiftelsesdato, etc.',
    inputSchema: {
      type: 'object',
      properties: { orgnr: { type: 'string', description: '9-digit org number, e.g. "923609016".' } },
      required: ['orgnr'],
    },
  },
  {
    name: 'search_sub_entities',
    description:
      'Search sub-entities/branches (underenheter) — e.g. local establishments of a parent company. Results under _embedded.underenheter. Filter by overordnetEnhet (parent org number) and/or navn. e.g. {overordnetEnhet:"923609016"} lists Equinor branches.',
    inputSchema: {
      type: 'object',
      properties: {
        navn: { type: 'string', description: 'Full-text name search.' },
        overordnetEnhet: { type: 'string', description: 'Parent entity org number, e.g. "923609016".' },
        kommunenummer: { type: 'string', description: 'Municipality number, e.g. "0301".' },
        size: { type: 'number', description: 'Results per page (default 20).' },
        page: { type: 'number', description: 'Zero-based page number (default 0).' },
      },
    },
  },
  {
    name: 'get_sub_entity',
    description:
      'Full record for one sub-entity/branch (underenhet) by 9-digit org number. e.g. {orgnr:"973861883"} (Equinor ASA AVD CCB SOTRA).',
    inputSchema: {
      type: 'object',
      properties: { orgnr: { type: 'string', description: '9-digit sub-entity org number, e.g. "973861883".' } },
      required: ['orgnr'],
    },
  },
  {
    name: 'get_roles',
    description:
      'Roles for an entity — board members (styre), CEO (daglig leder), chair (styreleder), auditor, etc. by 9-digit org number. e.g. {orgnr:"923609016"}.',
    inputSchema: {
      type: 'object',
      properties: { orgnr: { type: 'string', description: '9-digit org number, e.g. "923609016".' } },
      required: ['orgnr'],
    },
  },
  {
    name: 'get_accounts',
    description:
      'Annual financial statements (Regnskapsregisteret) for an entity by 9-digit org number. Returns an array, one element per filed year, with resultatregnskapResultat (income statement), eiendeler (assets), egenkapitalGjeld (equity & liabilities), valuta (currency), regnskapsperiode (period). e.g. {orgnr:"923609016"}.',
    inputSchema: {
      type: 'object',
      properties: { orgnr: { type: 'string', description: '9-digit org number, e.g. "923609016".' } },
      required: ['orgnr'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search_entities': {
      const qs = buildQuery(args, ['navn', 'organisasjonsform', 'kommunenummer', 'size', 'page']);
      return brregGet(`${ENHET}/enheter${qs}`);
    }
    case 'get_entity':
      return brregGet(`${ENHET}/enheter/${encodeURIComponent(orgnr(args))}`);
    case 'search_sub_entities': {
      const qs = buildQuery(args, ['navn', 'overordnetEnhet', 'kommunenummer', 'size', 'page']);
      return brregGet(`${ENHET}/underenheter${qs}`);
    }
    case 'get_sub_entity':
      return brregGet(`${ENHET}/underenheter/${encodeURIComponent(orgnr(args))}`);
    case 'get_roles':
      return brregGet(`${ENHET}/enheter/${encodeURIComponent(orgnr(args))}/roller`);
    case 'get_accounts':
      return brregGet(`${REGNSKAP}/${encodeURIComponent(orgnr(args))}`);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function brregGet(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`BRREG: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

function buildQuery(args: Record<string, unknown>, keys: string[]): string {
  const p = new URLSearchParams();
  for (const k of keys) {
    const v = args[k];
    if (v === undefined || v === null || (typeof v === 'string' && !v.trim())) continue;
    p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : '';
}

function orgnr(args: Record<string, unknown>): string {
  const v = args.orgnr;
  if (typeof v !== 'string' || !v.trim())
    throw new Error('Required argument "orgnr" is missing. Pass a 9-digit org number like "923609016".');
  return v.trim();
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
