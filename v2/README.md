# COMMERCEbox V2

Copie isolée de l’app (ne modifie pas V1 à la racine du repo).

- **Auth** e-mail/mot de passe obligatoire
- **Autosave cloud** debounced (~1,2 s) vers un projet Supabase Free dédié
- **Hors ligne** : file locale + retry + bandeau
- **Import one-shot** JSON v9 V1 → V2
- Stockage local préfixé `daf_v2_*` (pas de collision avec V1 sur le même domaine Pages)

## Docs

- [Guide utilisateur](docs/guide-utilisateur-v2.md)
- [SQL + RLS](docs/supabase-v2-rls.sql)

## Placeholders

Dans `index.html`, remplacer :

```js
var URL_='YOUR_SUPABASE_URL';
var KEY='YOUR_SUPABASE_ANON_KEY';
```

SheetJS est chargé depuis `../xlsx.full.min.js` (partagé avec V1).
