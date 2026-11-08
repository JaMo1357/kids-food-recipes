# Nákup surovin

Detail receptu obsahuje výběr surovin (nepovinné jsou zpočátku vypnuté), export nákupního seznamu do schránky nebo UTF-8 TXT a odkazy na Košík, Rohlík, foodora a Tesco Online. Seznam obsahuje množství, porce a poznámky. Funkce funguje bez přihlášení a bez serverového API, včetně mobilního statického buildu. Výběr žije po dobu zobrazení receptu; neukládá se do účtu.

Odkazy otevírají obchod, nepřenášejí seznam ani produkty do košíku. Uživatel vybírá produkty a objednává v obchodě. Aplikace nezjišťuje dostupnost, ceny ani doručovací oblast. Neobsahuje neověřené deep linky či neoficiální API.

## Navazující integrace

Ověřeno 8. 11. 2026 v oficiálních zdrojích:

- [Košík MCP](https://www.kosik.cz/stranky/mcp-server): vyhledávání, správa košíku, přihlášení zákazníka a objednávky. Pro napojení vlastní aplikace provozovatel uvádí kontakt ai@kosik.cz; endpoint je `https://mcp.kosik.cz/mcp/`.
- [Rohlík MCP](https://www.rohlik.cz/mcp-docs): OAuth, produkty a správa košíku; endpoint `https://mcp.rohlik.cz/mcp`. Stránka obsahuje podmínky použití a požadavek písemného souhlasu pro jiné než běžné zákaznické využití. Před integrací Lžičky dořešit přístup s provozovatelem.
- [foodora Obchody](https://info.foodora.cz/obchody/): nákup potravin v sekci Obchody; veřejné rozhraní pro předání seznamu z této aplikace nebylo ověřeno.
- [Tesco Online](https://nakup.itesco.cz/): další možnost nákupu; veřejné rozhraní pro předání seznamu nebylo ověřeno.

Přímé plnění košíku vyžaduje registraci aplikace / dohodnuté možnosti autorizace, bezpečné uložení tokenů jednotlivých uživatelů, výběr konkrétních produktů podle dostupnosti pro adresu a potvrzení balení i počtů před změnou košíku. Množství v receptu nelze bez převodu vydávat za počet prodejních balení. Výběr produktů musí zachovat dietní omezení; samotná shoda názvu nestačí. Současná statická aplikace nemá backend pro správu tajných přístupových údajů.
