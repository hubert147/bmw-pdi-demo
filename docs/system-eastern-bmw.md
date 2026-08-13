# Eastern BMW — system kontroli przygotowania aut (analiza ze screenów, 2026-08-13)

Źródło: 17 screenów systemu produkcyjnego w salonie BMW (Eastern Western Motor Group / Eastern Holdings).
Stack obecny: Microsoft Power Apps ("Eastern App™") + Excel na SharePoint ("Control Sheet 1.xlsx", "PDI New Car Control.xlsx") + Outlook (automatyczne maile przez Power Automate) + Pinewood DMS.

## Cel systemu

Śledzenie każdego auta (STOCK / SOLD) od przyjazdu do salonu do gotowości sprzedażowej:
przygotowanie techniczne (PDI), naprawa felg (TLC), blacharka/lakiernia (Bodyshop / EWARC),
mycie i detailing (Valet), zdjęcia do ogłoszenia (Photos).

## Encje (model danych)

### Vehicle (auto)
- Stock/Sold: STOCK | SOLD | TRADE (przycisk "MOVE TO TRADE")
- Make (marka): BMW, MINI
- Model: 320, X1, X3, 118i, M3, iX, Cooper, Countryman, Hatch, 5 Series, 530e, M240i...
- Registration (rejestracja): np. AB51 ABC, YA25 DMZ, OY21 ZSU, SL73 HNA
- Chassis (VIN — last 7 only): np. AB12345, N338479, 5T59678
- Bodywork Notes: opis uszkodzeń, np. "Polish rear bumper and polish OSF bumper corner",
  "Dent driver's door and OSR 1/4", "Front splitter needs replaced", "Smart repair NSF corner,
  polish bonnet and touch in. PDR NS 1/4 panel. Full polish"
- Valeting notes
- Wheels / Alloys to be refurbished: które felgi (NSF, OSF, NSR, OSR) + typ (Diamond Cut | Normal)
- AUC Line: toggle On/Off (BMW Approved Used Cars)
- MOT: toggle On/Off
- Photos of damaged bodywork: załączniki
- Email the drivers?: toggle przy dodawaniu auta

### Timeline / audyt etapów (każdy etap = timestamp)
1. To go to PDI (oczekuje)
2. Arrived at PDI
3. Job Card Raised
4. Workshop Started (Date Started in workshop)
5. Authority Requested (prośba o autoryzację kosztów naprawy)
6. Authority Received
7. Workshop Complete
8. Sent to TLC (felgi — zewnętrzny vendor TLC Car Care)
9. TLC Completed
10. Date sent to EWARC (Eastern Western Accident Repair Centre — blacharka)
11. EWARC Completed
12. Valeted (Date Valeted)
13. Photographed (Photos)

Etapy TLC/EWARC bywają NA (not applicable) — auto może ominąć felgi lub blacharkę.
Przykładowy rekord testowy: AB12345 / 320 / "TEST ONLY" — pełny timeline 07/08/2026 15:00→15:04, Photographed 10/08/2026.

## Widoki aplikacji Power Apps (do odtworzenia w demo)

### 1. Dashboard z zakładkami (kanban-lista)
- Zakładki z licznikami: PDI (4-6), TLC (10), Bodyshop (8), Valet/Photos (5-6)
- Wiersz auta: STOCK | Model | Reg | Chassis | badge dni w etapie ("0 day", "1 day" — zielony) |
  chip aktualnego statusu (kolor wg pilności: szary "To go to PDI", czerwony "Arrived at PDI",
  bordowy "Job Card Raised", pomarańczowy "Started"/"Authority requested"/"Authority received") |
  strzałka → | przycisk następnej akcji (przejście do kolejnego etapu jednym kliknięciem)
- Ikony w wierszu: komentarz, ustawienia (edycja), info (i — timeline), ruch pojazdu (movement)
- Search bar + filtr, przycisk odświeżenia, przycisk "Movement request"
- Tło: zdjęcie BMW M2

### 2. Karta akcji auta (Field/Value + Attachments)
- Pola: Stock/Sold, Model, Reg, Chassis, Alloys to be refurbished (NSF OSF), Bodywork Note (NSF BUMPER)
- Przyciski akcji (aktywne/wyszarzone zależnie od etapu): Send to TLC, Send to Bodyshop,
  Add to valet sheet, AUC Completed
- Zamknięcie: X w rogu

### 3. Formularz edycji auta (zielony gradient)
- Stock (dropdown), Model, Wheels (dropdown), Registration, AUC Line (toggle), Chassis, MOT (toggle),
  Bodywork Notes, Valeting notes
- Przyciski: Delete (czerwony), Save (niebieski), MOVE TO TRADE (czerwony)

### 4. Formularz dodania auta (Add Vehicle)
- Stock*, Make* (Find items dropdown), Model*, Registration*, Chassis - Last 7 only*,
  Bodywork Notes*, Valeting notes, Wheels (dropdown), Photos of damaged bodywork (Attach file),
  Email the drivers? (toggle), przycisk Add Vehicle

### 5. Timeline auta (Field/Value, "Current Stage" podświetlony)
- Wszystkie 13 etapów z datami i godzinami (DD/MM/YYYY HH:mm)

### 6. Modal wyceny felg (TLC) z cennikiem
| Typ | 1 Wheel | 2 Wheels | 3 Wheels | 4 Wheels |
|---|---|---|---|---|
| Diamond Cut | £87.50 | £175.00 | £262.50 | £350.00 |
| Normal | £45.00 | £90.00 | £135.00 | £180.00 |
- Pole: Purchase order number (wymagane), Notes to TLC
- Przycisk: "Submit PO and Send Email to TLC"

## Automatyczne powiadomienia e-mail (Power Automate → Outlook)

1. "Car to go to bodyshop - 320- AB51 ABC - AB12345"
   → do: ARC - Reception, ARC - Estimators Shared (+ kopia do nadawcy, Craig Lamb)
   → tabela Field/Value: Stock/Sold, Model, Reg, Chassis, Bodywork
2. "STOCK car ready for refurbishment - AB51 ABC"
   → do: alloy@tlccarcare.co.uk (zewnętrzny vendor felg)
   → tabela: Stock/Sold, Model, Reg, Chassis, Wheels to be refurbished (NSF,OSF), Purchase order (12345), Notes

## Excel Control Sheet (SharePoint) — równoległy rejestr

Kolumny: Stock | Model | VIN | Registration | Bodywork Notes | Arrived at PDI | Job Card Raised |
Date Started in workshop | Authority Requested | Authority Received | Workshop Complete |
Date Sent to TLC | Date TLC Completed | Date sent to EWARC | Date EWARC Completed | Date Valeted | Photos

Kodowanie kolorami: żółty = w trakcie, czerwony = brak/zaległe, zielony wiersz = ukończone,
różowe nagłówki = etapy warsztatowe, fioletowe = Valet/Photos. ~300 wierszy aut.
Wartości specjalne: NA, MANUAL, POLISH, "EXHAUST LONDON", "Tyres here done 7/8".
Wielu użytkowników jednocześnie (widoczny "Norbert Szente has this workbook open").

## Otoczenie / integracje widoczne w zakładkach

- Pinewood DMS (dealer management system)
- PDI New Car Control.xlsx, Used Control Sheet (osobne rejestry nówki/używane)
- TIM COMPOUND, NEW COMPOUND (place składowe)
- PitStop 360 Checks, Macadam CarCheck, MOT Check (inspekcje)
- TLC Car Care Delivery (vendor felg)
- Druga aplikacja Power Apps: "Delivery / Stock / Service Slots"

## Wnioski dla demo PWA

- Rdzeń: pipeline statusów z one-click advance + licznik dni w etapie + kolory pilności
- Timeline z timestampami = pełny audyt
- Trzy strumienie pracy: warsztat (PDI), felgi (TLC + cennik + PO), blacharka (EWARC), finisz (Valet/Photos)
- Automatyczne maile do vendorów przy zmianie etapu (w demo: podgląd wygenerowanego maila)
- Role: PDI technician, Sales admin, TLC vendor, Bodyshop estimator, Valeter, Photographer
- Demo: Next.js PWA, dane seed w localStorage, deploy Vercel, repo GitHub hubert147
