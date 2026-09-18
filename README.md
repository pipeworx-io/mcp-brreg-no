# mcp-brreg-no

Brønnøysund Register Centre (BRREG) MCP — Norway's official business register.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search_entities` | Search Norwegian companies/organisations (Enhetsregisteret) by name + filters. Results under _embedded.enheter. navn=name, organisasjonsform=org form (e.g. ASA, AS, ENK), naeringskode=industry, forretningsadresse=business address. e.g. {navn:"equinor"} or {navn:"bank", organisasjonsform:"ASA", kommunenummer:"0301"}. |
| `get_entity` | Full record for one entity by 9-digit org number. e.g. {orgnr:"923609016"} (Equinor ASA). Returns navn, organisasjonsform, naeringskode1, forretningsadresse, antallAnsatte, stiftelsesdato, etc. |
| `search_sub_entities` | Search sub-entities/branches (underenheter) — e.g. local establishments of a parent company. Results under _embedded.underenheter. Filter by overordnetEnhet (parent org number) and/or navn. e.g. {overordnetEnhet:"923609016"} lists Equinor branches. |
| `get_sub_entity` | Full record for one sub-entity/branch (underenhet) by 9-digit org number. e.g. {orgnr:"973861883"} (Equinor ASA AVD CCB SOTRA). |
| `get_roles` | Roles for an entity — board members (styre), CEO (daglig leder), chair (styreleder), auditor, etc. by 9-digit org number. e.g. {orgnr:"923609016"}. |
| `get_accounts` | Annual financial statements (Regnskapsregisteret) for an entity by 9-digit org number. Returns an array, one element per filed year, with resultatregnskapResultat (income statement), eiendeler (assets), egenkapitalGjeld (equity & liabilities), valuta (currency), regnskapsperiode (period). e.g. {orgnr:"923609016"}. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "brreg-no": {
      "url": "https://gateway.pipeworx.io/brreg-no/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/brreg-no/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Brreg No data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/brreg_no_search_entities \
  -H 'Content-Type: application/json' \
  -d '{"navn":"equinor"}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/brreg_no_search_entities`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.
