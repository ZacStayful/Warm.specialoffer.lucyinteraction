# Delay Signal and Green Light Reference

Quick reference for all standardised delay codes and green light signals used in the Stayful knowledge base.

---

## Delay Signals

Delay signals indicate why a lead cannot start immediately. A lead may have multiple delay signals.

| Code | Name | Meaning | Typical Timeline | Full file |
|---|---|---|---|---|
| DLY-TEN | Tenant in Place | Has an active tenancy that prevents STR listing | 1-6 months | by-delay-type/DLY-TEN.json |
| DLY-FUR | Unfurnished | Property needs to be furnished before listing | 1-3 months | by-delay-type/DLY-FUR.json |
| DLY-PUR | Purchasing | Not yet completed on property purchase | 2-6 months | by-delay-type/DLY-PUR.json |
| DLY-MOV | Moving Out | Lead lives in the property and has not yet vacated | 1-4 months | by-delay-type/DLY-MOV.json |
| DLY-OTH | Other | Does not fit standard codes | Variable | by-delay-type/DLY-OTH.json |

### DLY-OTH Sub-codes

| Sub-code | Meaning |
|---|---|
| DLY-OTH-BUILD | Waiting for renovation or building work |
| DLY-OTH-PART | Waiting for partner or spouse agreement |
| DLY-OTH-FIN | Waiting for financial situation to stabilise |
| DLY-OTH-PLAN | Waiting for planning permission |
| DLY-OTH-PERS | Personal circumstances |

---

## Green Light Signals

Green light signals indicate conversion accelerators present in the lead's situation. A lead may have multiple green lights.

| Code | Name | Meaning | Conversion Impact |
|---|---|---|---|
| GL-SELF | Self-Managing Ready | Self-managing STR and ready to hand over | +15% conversion likelihood |
| GL-MGMT | Management Switching | Currently with management company and ready to switch | +20% conversion likelihood |
| GL-TIME | Near Timeline | Ready to start within 2 months | +25% conversion likelihood |

---

## Interpretation Guide

### High priority combination
GL-TIME + GL-MGMT = highest conversion probability. Lead is ready now and already committed to managed STR. Act immediately.

### Watch combination
DLY-TEN + DLY-OTH-PART = tenant not yet leaving AND partner not yet on board. Two blockers. Lower priority until one resolves.

### R2R caution
No green light code applies to R2R leads without verified landlord consent. The lead is structurally unqualified until the landlord is involved.

---

## Delay to Green Light Transitions

Monitor these transitions in active pipeline:

| Previous state | Transition event | New state |
|---|---|---|
| DLY-TEN | Tenant gives notice | DLY-TEN ends → GL-TIME begins |
| DLY-FUR | Furnishing complete | DLY-FUR ends → GL-TIME begins |
| DLY-PUR | Exchange of contracts | DLY-PUR → DLY-MOV begins |
| DLY-MOV | Lead moves out | DLY-MOV ends → GL-TIME begins |
| DLY-OTH-PART | Partner agrees | Blocker removed → assess remaining delays |
