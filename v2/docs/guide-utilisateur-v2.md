# Guide court — COMMERCEbox V2 (cloud temps réel)

V1 continue de tourner à la racine GitHub Pages. V2 vit dans `/v2/` et utilise un **2ᵉ projet Supabase Free** (le plafond Free = 2 projets). Les tables `coffre_*` V1 ne sont **pas** touchées.

## 1. Créer le 2ᵉ projet Supabase

1. Ouvrir [supabase.com/dashboard](https://supabase.com/dashboard)
2. **New project** (organization existante) → nom suggéré `commercebox-v2`
3. Noter la région, attendre le provisioning
4. **Project Settings → API** :
   - `Project URL` → coller dans `v2/index.html` à la place de `YOUR_SUPABASE_URL`
   - `anon` `public` key → coller à la place de `YOUR_SUPABASE_ANON_KEY`
5. **Authentication → Providers → Email** : activer Email. Pour un seul utilisateur terrain, vous pouvez décocher **Confirm email**.
6. **SQL Editor** : coller puis Run le fichier `v2/docs/supabase-v2-rls.sql`

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

## 4. Ce qui ne change pas / secours

- V1 reste intacte (plan B) tant que vous ne la désinstallez pas
- Export JSON reste dispo comme **secours** (nav Sync → Exporter JSON)
- Un seul utilisateur à la fois (pas de collab concurrente)

## 5. Dépannage rapide

| Symptôme | Action |
|----------|--------|
| « Config Supabase V2 manquante » | Clés encore en `YOUR_…` dans `v2/index.html` |
| « Tables V2 absentes » | Relancer `supabase-v2-rls.sql` |
| Projet Free en pause (7 j) | Dashboard Supabase → Restore / unpause |
| Sync en attente | Vérifier le réseau ; la file repart seule |

## Fichiers utiles

| Fichier | Rôle |
|---------|------|
| `v2/index.html` | App V2 + placeholders URL/KEY |
| `v2/docs/supabase-v2-rls.sql` | Tables + RLS |
| `v2/docs/guide-utilisateur-v2.md` | Ce guide |
| `index.html` (racine) | **V1 — ne pas modifier** |
