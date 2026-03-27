-- EXTENSIONS
create extension if not exists "uuid-ossp";

-- CATEGORIES
create table categories (
  id         uuid default gen_random_uuid() primary key,
  nom        text not null,
  slug       text unique not null,
  actif      boolean default true,
  created_at timestamptz default now()
);

-- PRODUITS
create table produits (
  id            uuid default gen_random_uuid() primary key,
  nom           text not null,
  slug          text unique not null,
  description   text,
  prix          integer not null,
  prix_barre    integer,
  categorie_id  uuid references categories(id),
  quantite      integer default 0,
  seuil_alerte  integer default 5,
  actif         boolean default true,
  ordre         integer default 0,
  meta_title    text,
  meta_desc     text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- PHOTOS PRODUITS
create table produit_photos (
  id              uuid default gen_random_uuid() primary key,
  produit_id      uuid references produits(id) on delete cascade,
  url             text not null,
  est_principale  boolean default false,
  ordre           integer default 0,
  created_at      timestamptz default now()
);

-- CLIENTS
create table clients (
  id               uuid default gen_random_uuid() primary key,
  nom              text not null,
  telephone        text unique not null,
  quartier         text,
  total_commandes  integer default 0,
  total_depense    integer default 0,
  statut           text default 'nouveau', -- nouveau / regulier / vip / blackliste
  notes            text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ZONES LIVRAISON
create table zones_livraison (
  id              uuid default gen_random_uuid() primary key,
  nom             text not null,
  frais           integer default 0,
  delai_estime    text,
  actif           boolean default true,
  created_at      timestamptz default now()
);

-- LIVREURS
create table livreurs (
  id         uuid default gen_random_uuid() primary key,
  nom        text not null,
  telephone  text not null,
  zone_id    uuid references zones_livraison(id),
  statut     text default 'disponible', -- disponible / en_course / inactif
  created_at timestamptz default now()
);

-- COMMANDES
create table commandes (
  id              uuid default gen_random_uuid() primary key,
  client_id       uuid references clients(id),
  produit_id      uuid references produits(id),
  client_nom      text not null,
  client_tel      text not null,
  client_quartier text not null,
  quantite        integer default 1,
  montant_total   integer not null,
  paiement_mode   text default 'livraison', -- livraison / wave / orange_money / mtn_momo
  statut          text default 'nouveau', -- nouveau / confirme / en_cours / livre / annule
  zone_id         uuid references zones_livraison(id),
  livreur_id      uuid references livreurs(id),
  code_promo_id   uuid,
  notes           text,
  event_id        text, -- pour déduplication pixel Facebook
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- PAIEMENTS
create table paiements (
  id                uuid default gen_random_uuid() primary key,
  commande_id       uuid references commandes(id) on delete cascade,
  montant_attendu   integer not null,
  montant_recu      integer,
  mode              text not null,
  statut            text default 'en_attente', -- en_attente / recu / partiel / rembourse
  reference_mobile  text,
  notes             text,
  created_at        timestamptz default now()
);

-- PROMOTIONS / CODES PROMO
create table promotions (
  id              uuid default gen_random_uuid() primary key,
  code            text unique not null,
  type_remise     text not null, -- pourcentage / montant_fixe / livraison_gratuite
  valeur          integer not null,
  usage_max       integer,
  usage_par_client integer default 1,
  usage_actuel    integer default 0,
  date_debut      timestamptz,
  date_fin        timestamptz,
  actif           boolean default true,
  created_at      timestamptz default now()
);

-- TEMOIGNAGES
create table temoignages (
  id          uuid default gen_random_uuid() primary key,
  nom_client  text not null,
  photo_url   text,
  note        integer default 5,
  commentaire text not null,
  produit_id  uuid references produits(id),
  position    text default 'produit', -- produit / accueil / les_deux
  actif       boolean default true,
  created_at  timestamptz default now()
);

-- BANNIERES
create table bannieres (
  id         uuid default gen_random_uuid() primary key,
  image_url  text not null,
  titre      text,
  sous_titre text,
  lien_cta   text,
  position   text default 'haut',
  actif      boolean default true,
  ordre      integer default 0,
  created_at timestamptz default now()
);

-- RETOURS SAV
create table retours (
  id              uuid default gen_random_uuid() primary key,
  commande_id     uuid references commandes(id),
  motif           text not null,
  statut          text default 'demande', -- demande / en_cours / accepte / refuse
  solution        text, -- remboursement / echange / avoir
  montant_rembourse integer,
  notes           text,
  created_at      timestamptz default now()
);

-- CONFIG PIXEL FACEBOOK
create table pixel_config (
  id              uuid default gen_random_uuid() primary key,
  pixel_id        text not null,
  capi_token      text not null,
  actif           boolean default true,
  mode_test       boolean default false,
  test_event_code text,
  updated_at      timestamptz default now()
);

-- EVENEMENTS PIXEL
create table pixel_evenements (
  id          uuid default gen_random_uuid() primary key,
  nom         text not null,
  actif       boolean default true,
  description text
);

-- LOGS PIXEL
create table pixel_logs (
  id          uuid default gen_random_uuid() primary key,
  event_name  text not null,
  event_id    text not null,
  source      text not null, -- browser / server
  produit_id  uuid,
  commande_id uuid,
  montant     integer,
  statut      text default 'envoye',
  erreur      text,
  created_at  timestamptz default now()
);

-- NOTIFICATIONS INTERNES
create table notifications (
  id         uuid default gen_random_uuid() primary key,
  type       text not null, -- stock_bas / rupture / commande_attente / nouveau_vip
  message    text not null,
  lue        boolean default false,
  lien       text,
  created_at timestamptz default now()
);

-- PARAMETRES GENERAUX
create table parametres (
  id                    uuid default gen_random_uuid() primary key,
  nom_boutique          text default 'JACHETE.CI',
  logo_url              text,
  whatsapp_principal    text,
  whatsapp_backup       text,
  paiements_actifs      text[] default array['livraison','wave','orange_money'],
  message_bienvenue_wa  text,
  horaires_livraison    text,
  message_rupture_stock text,
  pixel_id              text,
  google_analytics_id   text,
  updated_at            timestamptz default now()
);

-- UTILISATEURS ADMIN
create table utilisateurs_admin (
  id         uuid references auth.users primary key,
  nom        text not null,
  email      text not null,
  role       text default 'gestionnaire', -- super_admin / gestionnaire / livreur / comptable
  actif      boolean default true,
  created_at timestamptz default now()
);
