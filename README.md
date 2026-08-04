# mcp-brreg-no

Brønnøysund Register Centre (BRREG) MCP — Norway's official business register.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Brreg No data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
