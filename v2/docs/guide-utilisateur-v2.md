# Guide court — COMMERCEbox V2 (cloud temps réel)

V1 continue de tourner à la racine GitHub Pages. V2 vit dans `/v2/` et utilise un **2ᵉ projet Supabase Free** (le plafond Free = 2 projets). Les tables `coffre_*` V1 ne sont **pas** touchées.

## 1. Projet Supabase V2 (déjà branché dans le code)

Dans `v2/index.html` :

- **URL** : `https://ksikuebjwwttijkqgenw.supabase.co`
- **Clé** : publishable `sb_publishable_…` (nouvelle UI Supabase)

V2 n’utilise **pas** supabase-js : comme V1, elle appelle Auth/REST en `fetch` avec l’en-tête `apikey`. La clé publishable est acceptée (vérifié : Auth + `GET /rest/v1/v2_store` OK). Pas besoin de la legacy anon JWT `eyJ…` pour ce client.

Si un jour un outil exige encore le JWT anon : Dashboard → **Project Settings → API Keys → View legacy API keys** → clé `anon` `public`.

### Checklist projet (si nouveau clone / reset)

1. [supabase.com/dashboard](https://supabase.com/dashboard) → projet V2
2. **Authentication → Providers → Email** activé (Confirm email optionnel pour 1 user)
3. **SQL Editor** → Run `v2/docs/supabase-v2-rls.sql` (tables `v2_store` / `v2_parts` + colonnes verrou appareil + RLS). **À rejouer** si le projet existait déjà avant le verrou 1 appareil.

## 2. Déployer V2 (GitHub Pages)

Après merge de la branche V2 :

- V1 : `https://pepin1212.github.io/GCA-Trucks-COMMERCEbox/`
- V2 : `https://pepin1212.github.io/GCA-Trucks-COMMERCEbox/v2/`

Sur iPhone : ouvrir V2 dans Safari une fois, puis « Sur l’écran d’accueil » si besoin (icône distincte de V1).

## 3. Premier lancement

1. Créer le compte (e-mail / mot de passe) ou se connecter
2. Écran **Import unique V1 → V2** : choisir le JSON v9 exporté depuis V1 (Plus → Exporter sauvegarde JSON, ou fichier iCloud)
3. Contrôler les compteurs clients / véhicules
4. Ensuite : chaque modification part seule vers le cloud (~1,2 s après la dernière frappe). Plus besoin du bouton Sauvegarder pour le cloud.
5. Hors ligne : bandeau orange + file locale ; retry auto au retour réseau

## 4. Un seul appareil à la fois (verrou)

V2 enregistre un **deviceId** local + un **heartbeat** cloud (~45 s) sur `v2_store` (`active_device_id`, `heartbeat_at`).

- Si un autre appareil a un heartbeat **récent (&lt; 3 min)**, la connexion est refusée avec un message clair.
- Bouton **« Utiliser cet appareil à la place »** : force la prise (téléphone perdu / app fermée ailleurs). L’autre session sera bloquée au prochain sync.
- **Se déconnecter** (Plus → Cloud) libère le verrou tout de suite.
- Sans activité pendant ~3 min, le verrou expire tout seul → un autre appareil peut entrer sans forcer.
- Deux onglets sur **le même** navigateur = même appareil (OK).

## 5. Ce qui ne change pas / secours

- V1 reste intacte (plan B) tant que vous ne la désinstallez pas
- Export JSON reste dispo comme **secours** (nav Sync → Exporter JSON)
- Un seul utilisateur métier + un seul appareil actif

## 6. Dépannage rapide

| Symptôme | Action |
|----------|--------|
| « Config Supabase V2 manquante » | `URL_` / `KEY` encore en `YOUR_…` dans `v2/index.html` |
| « Invalid JWT » | Rare avec ce client ; sinon coller la legacy anon JWT (View legacy API keys) à la place de `KEY` |
| « Tables V2 absentes » | Relancer `supabase-v2-rls.sql` |
| « Autre appareil actif » | Attendre ~3 min **ou** taper « Utiliser cet appareil à la place » |
| Verrou ne bloque pas le 2ᵉ appareil | Rejouer le SQL (colonnes `active_device_id` / `heartbeat_at`) + forcer la mise à jour app |
| Projet Free en pause (7 j) | Dashboard Supabase → Restore / unpause |
| Sync en attente | Vérifier le réseau ; la file repart seule |
| « véhicules non enregistrés » / import échoué | Bug corrigé (IndexedDB avant import). Forcer la mise à jour V2 (Plus → Forcer la mise à jour, ou Safari → recharger `/v2/?v=…`). Puis réimporter le JSON. Si ça continue : Safari pas en navigation privée, libérer de l’espace iPhone. |

## Fichiers utiles

| Fichier | Rôle |
|---------|------|
| `v2/index.html` | App V2 + URL/KEY projet V2 |
| `v2/docs/supabase-v2-rls.sql` | Tables + RLS |
| `v2/docs/guide-utilisateur-v2.md` | Ce guide |
| `index.html` (racine) | **V1 — ne pas modifier** |
