---
title: "French press för morgonkaffe"
description: "En fyllig presskanna med tydlig dragtid och lugn pressning. Anpassa mängden och servera hela bryggningen när den är färdig."
method: "french-press"
difficulty: "Enkel"
featured: false
brew:
  version: 1
  coffeeGrams: 30
  waterGrams: 500
  brewer: "presskanna på minst 1 liter"
  dosePresets: [15, 30, 45]
  temperatureC: 94
  grind: "Grov, jämn malning. Kolven ska kunna sänkas med lätt tryck."
  minDoseGrams: 15
  maxDoseGrams: 45
  maxWaterGrams: 750
  targetTime:
    minSeconds: 315
    maxSeconds: 345
  taste: "Fyllig, rund kopp med mjuk sötma. Lite sediment är normalt med metallfilter."
  yieldNote: "Ungefär två vanliga koppar. Färdigt kaffe väger mindre än bryggvattnet eftersom vatten stannar i kaffesumpen."
  equipment:
    - "Presskanna på minst 1 liter för hela dosintervallet, med rent och korrekt monterat filter"
    - "Våg, kaffekvarn och vattenkokare"
    - "Sked eller omrörare av trä eller plast"
    - "Koppar eller serveringskanna som rymmer hela bryggningen"
  preparation:
    - "Värm vattnet till angiven temperatur. Förvärm presskannan och häll sedan bort sköljvattnet."
    - "Ställ kannan på ett plant underlag och lyft ur kolven. Mal kaffet grovt och häll det i kannan."
    - "Ställ kannan på vågen och nollställ. Ha omrörare, lock och serveringskanna redo."
    - "Lämna minst 2,5 cm upp till kanten när du häller. En mindre kanna behöver ett eget, lägre dosintervall."
  steps:
    - kind: pour
      atSeconds: 0
      title: "Häll på vattnet"
      waterGrams: 500
      instruction: "Starta timern vid första vattnet. Häll jämnt över kaffet och blöt hela bädden. Lämna utrymme upp till kanten."
    - kind: stir
      atSeconds: 30
      title: "Rör om och sätt på locket"
      instruction: "Rör några lugna varv med en omrörare av trä eller plast så att torrt kaffe blandas med vattnet. Sätt på locket med kolven helt uppdragen och bekräfta när du är redo att låta kaffet dra."
    - kind: steep
      atSeconds: 45
      title: "Låt kaffet dra"
      instruction: "Låt dra i fyra minuter med locket på och kolven helt uppdragen, utan att pressa. I bryggläget räknas hela dragtiden från din bekräftelse efter omrörningen."
    - kind: press
      atSeconds: 285
      title: "Pressa och servera"
      instruction: "Håll i kannans handtag och sänk kolven långsamt med lätt tryck. Tvinga inte ett filter som tar emot. Häll sedan upp allt kaffe i koppar eller serveringskanna och bekräfta att bryggningen är klar."
  relatedGuides:
    - "valja-kaffekvarn"
    - "rostningsgrader"
  sources:
    - title: "Bodum: French Press – Instructions for Use"
      url: "https://d9pl0lig74xnv.cloudfront.net/product_manuals/z/p/zp2019-000001_frenchpress_coffeemakers_v1-20190308_pages.pdf"
      note: "Tillverkarens manual beskriver grov malning, utrymme till kanten, försiktig omrörning, minst fyra minuters dragtid och lätt pressning. Kaffekompis behåller sitt tidigare basrecept och anger en egen tidslinje från första vattnet till servering."
  reviewedOn: "2026-10-25"
---

## Fyra minuters dragtid är inte hela bryggtiden

Den tidigare märkningen 4:00 avsåg dragtiden. Här börjar timern vid första vattnet. Hällning och omrörning följs av fyra minuter med locket på, sedan pressning och servering. Totalt 5:15–5:45 är ett riktmärke vid grunddosen.

Receptet behåller den tidigare grunddosen och vattenmängden. Förhållandet visas avrundat; vattenmängden räknas från de exakta grundmängderna. En större dos ändrar mängden kaffe, inte förhållandet eller dragtiden automatiskt.

## Justera en sak i taget

- **Surt och tunt:** prova lite finare malning, så länge filtret fortfarande går lätt att pressa.
- **Bittert eller torrt:** prova lite grövre malning och servera allt kaffe direkt efter pressningen.
- **Mycket grums:** rör mindre kraftigt och häll försiktigt. Lite sediment hör till ett metallfilter.

Låt inte resten av kaffet stå kvar med sumpen om du vill spara en kopp till senare. Häll över det i en separat kanna.
