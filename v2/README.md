# COMMERCEbox V2

Copie isolée de l’app (ne modifie pas V1 à la racine du repo).

- **Auth** e-mail/mot de passe obligatoire
- **Cloud-first** : pull cloud au démarrage avant affichage
- **Verrou 1 appareil** (heartbeat cloud + prise forcée si appareil perdu)
- **Autosave cloud** debounced (~1,2 s) vers un projet Supabase Free dédié
- **Hors ligne** : lecture seule (pas de file locale)
- **Anti-écrasement** : refuse de pousser une base vide si un snapshot cloud existe ; en conflit le cloud gagne
- **SYNC** : révision + « à jour » / « en retard »
- **Secours** : export JSON manuel
- **Import one-shot** JSON v9 V1 → V2
- Stockage local préfixé `daf_v2_*` (pas de collision avec V1 sur le même domaine Pages)

## Docs

- [Guide utilisateur](docs/guide-utilisateur-v2.md)
- [SQL + RLS](docs/supabase-v2-rls.sql)

## Config cloud

Projet V2 déjà renseigné dans `index.html` (`URL_` + clé publishable `sb_publishable_…`).  
Client = `fetch` REST (pas supabase-js) — même modèle que V1 ; la publishable key suffit.

SheetJS est chargé depuis `../xlsx.full.min.js` (partagé avec V1).
