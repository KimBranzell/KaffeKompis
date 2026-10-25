---
title: "Klassisk pour over"
description: "Ett basrecept för V60 med fyra tydliga hällningar, justerbar dos och en ren, balanserad kopp."
method: "pour-over"
difficulty: "Medel"
featured: true
brew:
  version: 1
  coffeeGrams: 20
  ratio: 16
  temperatureC: 94
  grind: "Medelfin malning för filterkaffe. Börja här och justera efter flöde och smak."
  minDoseGrams: 15
  maxDoseGrams: 40
  maxWaterGrams: 640
  targetTime:
    minSeconds: 210
    maxSeconds: 240
  taste: "Ren kopp med tydlig sötma, balanserad syra och lätt kropp."
  yieldNote: "En stor eller två små koppar. Färdigt kaffe väger mindre än bryggvattnet eftersom vatten stannar i kaffet och filtret."
  equipment:
    - "V60 i storlek 02 och passande pappersfilter"
    - "Kanna som rymmer minst 700 ml för hela dosintervallet"
    - "Våg med gramvisning och en kaffekvarn"
    - "Vattenkokare, gärna med smal pip"
  preparation:
    - "Värm vattnet till angiven temperatur och ha extra vatten för att skölja filtret."
    - "Vik filtrets söm, placera filtret i bryggaren och skölj med varmt vatten."
    - "Häll bort sköljvattnet. Ställ bryggaren på kannan och hela uppställningen på vågen."
    - "Mal kaffet, häll det i filtret och jämna ut bädden försiktigt. Nollställ vågen."
  steps:
    - kind: pour
      atSeconds: 0
      title: "Blomma kaffet"
      waterGrams: 50
      instruction: "Starta timern när det första vattnet träffar kaffet. Blöt hela bädden, snurra bryggaren försiktigt och vänta till nästa hällning."
    - kind: pour
      atSeconds: 30
      title: "Andra hällningen"
      waterGrams: 90
      instruction: "Häll lugnt i små cirklar över kaffet. Undvik att hälla direkt på filtrets kanter. Låt vattennivån sjunka mellan hällningarna."
    - kind: pour
      atSeconds: 75
      title: "Tredje hällningen"
      waterGrams: 90
      instruction: "Häll med samma lugna rörelse och håll bädden jämnt genomvåt. Sänk hällhastigheten om vattennivån stiger för högt."
    - kind: pour
      atSeconds: 120
      title: "Sista hällningen"
      waterGrams: 90
      instruction: "Häll till receptets sista totalvikt och ge bryggaren en försiktig snurr för att jämna till bädden."
    - kind: wait
      atSeconds: 155
      title: "Låt kaffet rinna igenom"
      instruction: "Vänta tills vattnet runnit igenom. Lyft bort bryggaren, rör om kaffet i kannan och servera. Bekräfta själv när bryggningen är klar."
  relatedGuides:
    - "rostningsgrader"
    - "valja-kaffekvarn"
  sources:
    - title: "Hario: Expert V60 Brew Guide"
      url: "https://www.hario.co.uk/pages/brew-guides-v60-expert"
      note: "Referens för utrustning, filtersköljning, blomning och grundteknik. Kaffekompis dos, bryggförhållande och fyra hällningar är en egen anpassning, inte Harios originalrecept."
  reviewedOn: "2026-10-25"
---

## Justera en sak i taget

Börja med att smaka när kaffet svalnat lite. Jämför nästa kopp med samma bönor och dos, så blir det lättare att förstå vad ändringen gjorde.

- **Surt och tunt:** prova ett litet steg finare malning. Om flödet redan är långsamt, behåll malningen och höj temperaturen ett par grader i stället.
- **Bittert eller torrt:** prova ett litet steg grövre malning eller mindre kraftiga snurrningar. Om kaffet är mörkrostat kan lägre temperatur vara nästa försök.
- **Tunt men inte surt:** prova ett annat recept med mindre vatten per gram kaffe. Att ändra dosen här behåller bryggförhållandet 1:16 och ändrar mängden kaffe, inte koncentrationen i sig.

## Tiderna är riktmärken

Hällningsschemat är en utgångspunkt. Anpassa flödet så att bryggaren inte svämmar över. Vid grunddosen är 3:30–4:00 ett rimligt mål; en större bryggning kan behöva längre tid. Smaken och ett jämnt flöde avgör nästa justering.

Receptet har förtydligats från Kaffekompis tidigare 20 g / 320 g-basrecept. Det är en startpunkt att prova med ditt kaffe, inte ett löfte om samma bryggtid med varje kvarn eller böna.
