-- JACHETE.CI - Migration Script
-- Version: 1.0.0
-- Platform: InsForge (PostgreSQL)

-- 1. SET UP EXTENSIONS (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CLEAN UP (WARNING: Only for fresh setup)
-- DROP TABLE IF EXISTS produit_photos CASCADE;
-- DROP TABLE IF EXISTS produits CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS parametres CASCADE;
-- DROP TABLE IF EXISTS zones_livraison CASCADE;

-- 3. CREATE TABLES

-- Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Produits
CREATE TABLE produits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    prix INTEGER NOT NULL,
    prix_barre INTEGER,
    categorie_id UUID REFERENCES categories(id),
    quantite INTEGER DEFAULT 0,
    seuil_alerte INTEGER DEFAULT 5,
    actif BOOLEAN DEFAULT true,
    ordre INTEGER DEFAULT 0,
    meta_title TEXT,
    meta_desc TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Produit Photos
CREATE TABLE produit_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produit_id UUID REFERENCES produits(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    est_principale BOOLEAN DEFAULT false,
    ordre INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Parametres
CREATE TABLE parametres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom_boutique TEXT DEFAULT 'JACHETE.CI',
    logo_url TEXT,
    whatsapp_principal TEXT,
    whatsapp_backup TEXT,
    paiements_actifs TEXT[] DEFAULT ARRAY['livraison'::text, 'wave'::text, 'orange_money'::text],
    message_bienvenue_wa TEXT,
    horaires_livraison TEXT,
    message_rupture_stock TEXT,
    pixel_id TEXT,
    google_analytics_id TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Zones Livraison
CREATE TABLE zones_livraison (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    frais INTEGER DEFAULT 0,
    delai_estime TEXT,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. INSERT DATA

-- Categories
INSERT INTO categories (id, establishment_id, name, description, created_at) VALUES
('3923332a-28c0-4f6b-8b5b-38bdd676387e', 'b5efd226-2b0f-4576-82c5-6f044948fe4a', 'Mode & Accessoires', 'Vêtements, chaussures et accessoires de mode', '2026-03-28T13:28:09.131Z'),
('62ffa5fc-b8e2-4062-adf2-38191510834e', 'b5efd226-2b0f-4576-82c5-6f044948fe4a', 'Électronique', 'Smartphones, tablettes et gadgets high-tech', '2026-03-28T13:28:09.131Z'),
('cb04c072-b220-4924-882d-6fbf8ad20b23', 'b5efd226-2b0f-4576-82c5-6f044948fe4a', 'Beauté & Santé', 'Produits cosmétiques, soins et bien-être', '2026-03-28T13:28:09.131Z'),
('010f5efd-da67-4303-98c5-e31d4b59b3bf', 'b5efd226-2b0f-4576-82c5-6f044948fe4a', 'Maison & Cuisine', 'Articles pour la maison et petit électroménager', '2026-03-28T13:28:09.131Z')
ON CONFLICT (id) DO NOTHING;

-- Produits
INSERT INTO produits (id, nom, slug, description, prix, prix_barre, categorie_id, quantite, seuil_alerte, actif, ordre, created_at, updated_at) VALUES
('ba3d0dca-f804-4e94-b62c-17f043ac0de0', 'Organisateur d’Épices pour Cuisine (6 pots inclus)', 'organisateur-dpices-pour-cuisine-6-pots-inclus', '✅ Support mural rotatif sous étagère\n\n✅ Livré avec 6 bocaux à épices en verre avec couvercle inox\n\n✅ Gain de place optimal pour votre cuisine\n\n✅ Facile à installer et à utiliser\n\n✅ Design moderne et pratiqu', 7500, 15000, '010f5efd-da67-4303-98c5-e31d4b59b3bf', 100, 5, true, 0, '2026-03-27T22:56:15.660Z', '2026-03-27T22:56:15.660Z'),
('b5efd226-2b0f-4576-82c5-6f044948fe4d', 'Produit de Test Premium', 'produit-test', 'Ceci est un produit de test pour vérifier l''interface et le processus de commande. Qualité supérieure et livraison rapide.', 25000, 35000, '3923332a-28c0-4f6b-8b5b-38bdd676387e', 10, 5, true, 0, '2026-03-27T20:52:22.537Z', '2026-03-27T20:52:22.537Z')
ON CONFLICT (id) DO NOTHING;

-- Photos
INSERT INTO produit_photos (id, produit_id, url, est_principale, ordre, created_at) VALUES
('d638e022-e49d-4354-bd90-690964b776ef', 'b5efd226-2b0f-4576-82c5-6f044948fe4d', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800', true, 0, '2026-03-27T20:52:22.537Z')
ON CONFLICT (id) DO NOTHING;

-- Parametres
INSERT INTO parametres (id, nom_boutique, whatsapp_principal, message_bienvenue_wa, horaires_livraison, updated_at) VALUES
('2711ddb2-bce0-4976-9131-604f09fefe63', 'JACHETE.CI', '0504306229', 'Bonjour ! Bienvenue sur JACHETE.CI. Comment pouvons-nous vous aider ?', 'Lundi - Samedi : 08h - 19h', '2026-03-28T13:28:08.701Z')
ON CONFLICT (id) DO NOTHING;

-- Zones
INSERT INTO zones_livraison (id, nom, frais, delai_estime, actif, created_at) VALUES
('02da6459-1921-415b-bb5a-9f6f922855bc', 'Zone 1 (Cocody, Plateau, Angré)', 1500, '24h', true, '2026-03-28T13:28:10.168Z'),
('b98cdd12-8db0-4eeb-bd56-2ba1afab4402', 'Zone 2 (Yopougon, Adjamé, Treichville)', 2000, '24h - 48h', true, '2026-03-28T13:28:10.168Z'),
('8cc7df79-1ab6-46fd-840e-9d8aeee5bf97', 'Zone 3 (Abobo, Koumassi, Marcory)', 2000, '24h - 48h', true, '2026-03-28T13:28:10.168Z'),
('0afe37d9-66aa-48f7-88e9-8bde7d7165e5', 'Zone 4 (Bingerville, Bassam, Anyama)', 3000, '48h - 72h', true, '2026-03-28T13:28:10.168Z')
ON CONFLICT (id) DO NOTHING;
