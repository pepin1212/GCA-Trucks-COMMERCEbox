# Guide court — COMMERCEbox V2 (cloud-first)

V1 continue de tourner à la racine GitHub Pages. V2 vit dans `/v2/` et utilise un **2ᵉ projet Supabase Free** (le plafond Free = 2 projets). Les tables `coffre_*` V1 ne sont **pas** touchées.

## Règles cloud-first (validées)

| # | Règle |
|---|--------|
| 1A | **Hors ligne = lecture seule** — aucune modification locale qui sync plus tard |
| 2A | **Au démarrage** : toujours charger le cloud **avant** d’afficher les données |
| 3A | **Interdit** d’ouvrir / pousser une base vide si un snapshot cloud existe |
| 4A | **En conflit** : le cloud gagne toujours |
| 5A | Indicateur **SYNC** : n° de révision + « à jour » / « en retard » |
| 6A | Secours : **export JSON manuel** suffit |

Une seule base cloud. Chaque appareil charge le cloud d’abord. Chaque clic écrit vers le cloud (debounce ~1,2 s). Le local n’est qu’un cache / secours.

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

1. Créer le compte (e-mail / mot de passe) ou se connecter — **Internet obligatoire**
2. L’app **charge le cloud** avant d’afficher quoi que ce soit
3. S’il n’y a pas encore de snapshot : écran **Import unique V1 → V2** (JSON v9) — ou « base vide » seulement si le cloud est vraiment vide
4. Ensuite : chaque modification part seule vers le cloud (~1,2 s). Pastille SYNC : `R12 · à jour` (révision + état)
5. Hors ligne : bandeau **lecture seule** — consultation du cache possible, **aucune écriture** (ni locale à sync plus tard, ni cloud)

## 4. Un seul appareil à la fois (verrou)

V2 enregistre un **deviceId** local + un **heartbeat** cloud (~10 s) sur `v2_store` (`active_device_id`, `heartbeat_at`).

- Si un autre appareil a un heartbeat **récent (&lt; 3 min)**, la connexion est refusée avec un message clair.
- Bouton **« Utiliser cet appareil à la place »** : force la prise tout de suite. L’**ancien** appareil détecte le vol (poll ~10 s), **synchronise** ses dernières modifs (sauf base vide), puis **se déconnecte** avec le message « Session reprise ailleurs ».
- **Se déconnecter** (Plus → Cloud) libère le verrou tout de suite.
- Sans activité pendant ~3 min, le verrou expire tout seul → un autre appareil peut entrer sans forcer.
- Deux onglets sur **le même** navigateur = même appareil (OK).

## 5. Comportement sync (résumé)

| Moment | Comportement |
|--------|----------------|
| **Démarrage** | Auth → verrou appareil → **pull cloud** → puis affichage. Jamais d’affichage sur une base locale seule si le cloud est joignable. |
| **Écriture** | Chaque clic → debounce ~1,2 s → upsert cloud. Révision incrémentée. Indicateur `R… · à jour`. |
| **Conflit** | Si le cloud a une révision plus haute : **pull** (cloud gagne), pas de push local. |
| **Base vide** | Si le local est vide et le cloud a un snapshot : **refus d’écraser** + rechargement cloud. |
| **Hors ligne** | Lecture seule. Au retour réseau : reclaim verrou + **rechargement cloud** (pas de file locale). |
| **Secours** | Nav Sync → **Exporter JSON** (manuel). |

## 6. Ce qui ne change pas / secours

- V1 reste intacte (plan B) tant que vous ne la désinstallez pas
- Export JSON reste dispo comme **secours manuel** (nav Sync → Exporter JSON)
- Un seul utilisateur métier + un seul appareil actif

## 7. Dépannage rapide

| Symptôme | Action |
|----------|--------|
| « Config Supabase V2 manquante » | `URL_` / `KEY` encore en `YOUR_…` dans `v2/index.html` |
| « Invalid JWT » | Rare avec ce client ; sinon coller la legacy anon JWT (View legacy API keys) à la place de `KEY` |
| « Tables V2 absentes » | Relancer `supabase-v2-rls.sql` |
| « Autre appareil actif » | Attendre ~3 min **ou** taper « Utiliser cet appareil à la place » (l’ancien sync puis se déconnecte) |
| « Session reprise ailleurs » | Normal après prise forcée sur un autre appareil — se reconnecter seulement si celui-ci doit reprendre |
| Verrou ne bloque pas le 2ᵉ appareil | Rejouer le SQL (colonnes `active_device_id` / `heartbeat_at`) + forcer la mise à jour app |
| Projet Free en pause (7 j) | Dashboard Supabase → Restore / unpause |
| « Hors ligne — lecture seule » | Normal sans réseau ; reconnectez-vous pour modifier. Le cloud n’est pas touché. |
| `R… · en retard` / cloud préservé | Le cloud a gagné ou une base vide a été refusée — l’app recharge le cloud |
| Base locale vide qui écrasait le cloud | Corrigé (3A) : push vide refusé si snapshot cloud présent |
| « véhicules non enregistrés » / import échoué | Bug corrigé (IndexedDB avant import). Forcer la mise à jour V2 (Plus → Forcer la mise à jour, ou Safari → recharger `/v2/?v=…`). Puis réimporter le JSON. Si ça continue : Safari pas en navigation privée, libérer de l’espace iPhone. |

## Fichiers utiles

| Fichier | Rôle |
|---------|------|
| `v2/index.html` | App V2 + URL/KEY projet V2 |
| `v2/docs/supabase-v2-rls.sql` | Tables + RLS |
| `v2/docs/guide-utilisateur-v2.md` | Ce guide |
| `index.html` (racine) | **V1 — ne pas modifier** |
