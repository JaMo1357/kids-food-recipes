# Zdroje obsahu

## Recepty

Recepty byly staženy 30. 10. 2026 s ohledem na `robots.txt`. Postupy jsou přepsané vlastními slovy a upravené pro děti: bez přidané soli a cukru, do 12 měsíců s mateřským nebo kojeneckým mlékem. Každý recept v aplikaci uvádí odkaz na zdroj. Fotky ze zdrojů receptů nepřebíráme.

## Fotky

Každý ze 45 receptů má vlastní ilustrační fotografii vytvořenou pomocí vestavěného nástroje ImageGen dne 8. 11. 2026 podle surovin a postupu. Obrázky jsou v `public/photos/recipes/<slug>.jpg` (1200 × 900); mapování je v `app/utils/generatedRecipePhotos.ts` a přesné prompty v `docs/generated-recipe-photos.json`. Nejde o fotografie skutečně uvařených jídel. Stránka receptu uvádí, že obrázek vytvořila AI. Tyto obrázky nemají kredit ani licenci Wikimedia.

Pořadí výběru obrázku: osobní fotografie uživatele, fotografie z bucketu `recipe-images`, vlastní AI ilustrace receptu, původní kategoriová fotografie Wikimedia, kresba. Původní fotografie a jejich licence níže zůstávají jako záloha pro recepty bez vlastního obrázku.

Ilustrační fotky v `public/photos` pocházejí z [Wikimedia Commons](https://commons.wikimedia.org/) a mají jen licence, které dovolují i komerční použití: CC0, CC BY a CC BY-SA. Licence se ověřovala přes API Commons 5. 11. 2026. Ke každé ilustraci (`pyre`, `kase` …) patří jedna fotka, takže recepty se stejnou ilustrací sdílejí i fotku. Fotka je jen ilustrační a nezachycuje přesně daný recept.

V `app/utils/recipePhotos.ts` je u každé fotky název, autor, odkaz na originál a licence. Stránka receptu je uvádí pod fotkou, jak licence CC BY a CC BY-SA vyžadují. Fotky jsou oříznuté na 4 : 3 a zmenšené na 1200 × 900, což kredit také uvádí. Upravené fotky pod CC BY-SA zůstávají pod stejnou licencí. Na kód aplikace se to nevztahuje.

Novou fotku přidáte jako `public/photos/<ilustrace>.webp` (1200 × 900) se záznamem v `recipePhotos.ts`. Ilustrace bez fotky se dál zobrazuje jako kresba z `public/illustrations`. Fotka nahraná do bucketu `recipe-images` (`image_path`) má přednost před obojím.

- [Jak na mateřství](https://jaknamaterstvi.cz/prikrmy/)
- [Máma v kuchyni](https://mamavkuchyni.cz/)
- [Máma v zástěře](https://www.mamavzastere.cz/recepty/)
- [Toprecepty](https://www.toprecepty.cz/)
- [Mimibazar](https://www.mimibazar.cz/)

## Věková pravidla

`min_age_months` u suroviny je tvrdá hranice: recept se mladšímu dítěti nezobrazí, ať je u něj uvedeno cokoli. Proto může mít recept vyšší věk než jeho zdroj.

- Med, plnotučné mléko, tvaroh, smetana a tvrdý sýr: od 12 měsíců, podle [průvodce výživou dětí VFN](https://www.vfn.cz/files/vyziva/VFN_Pruvodce_vyzivou_deti_v2.pdf) a [Pediatrie pro praxi](https://www.pediatriepropraxi.cz/pdfs/ped/2018/04/05.pdf).
- Začátek příkrmů mezi 17. a 26. týdnem, podle téhož průvodce VFN.
- Ostatní hranice (jogurt, luštěniny, kakao) jsou opatrný odhad autora obsahu.

**Před veřejným spuštěním musí alergeny a věkové hranice zkontrolovat dětský nutriční terapeut nebo pediatr.**

## Alergeny

Čtrnáct alergenů podle nařízení EU 1169/2011. Oves je veden jako lepek. Mateřské/kojenecké mléko je vedeno jako mléko, proto filtr „Mléko“ skryje i recepty, kde ho lze nahradit vodou. Těstoviny v receptech jsou bez vajec, skutečný výrobek ale vejce obsahovat může, a proto aplikace vyzývá ke čtení etiket.
