-- ============================================================
-- FindYourBet — CHECK constraints de longitud màxima
-- Executar al SQL Editor de Supabase (una sola vegada)
-- Protegeix contra insercions directes a l'API que bypassen el frontend
-- ============================================================

-- profiles
ALTER TABLE profiles
  ADD CONSTRAINT chk_profiles_username_len       CHECK (length(username)       <= 20),
  ADD CONSTRAINT chk_profiles_name_len           CHECK (length(name)           <= 50),
  ADD CONSTRAINT chk_profiles_bio_len            CHECK (length(bio)            <= 160),
  ADD CONSTRAINT chk_profiles_banned_reason_len  CHECK (length(banned_reason)  <= 500),
  ADD CONSTRAINT chk_profiles_admin_warning_len  CHECK (length(admin_warning)  <= 500);

-- channels
ALTER TABLE channels
  ADD CONSTRAINT chk_channels_name_len            CHECK (length(name)            <= 30),
  ADD CONSTRAINT chk_channels_description_len     CHECK (length(description)     <= 200),
  ADD CONSTRAINT chk_channels_deletion_reason_len CHECK (length(deletion_reason) <= 500);

-- channel_messages
-- Nota: content inclou missatges de text (≤2000) i picks en JSON ([BET]:...).
-- El límit és generós per no trencar la inserció de bets generats internament.
ALTER TABLE channel_messages
  ADD CONSTRAINT chk_channel_messages_content_len CHECK (length(content) <= 10000);

-- bets
ALTER TABLE bets
  ADD CONSTRAINT chk_bets_event_len    CHECK (length(event)    <= 100),
  ADD CONSTRAINT chk_bets_pick_len     CHECK (length(pick)     <= 100),
  ADD CONSTRAINT chk_bets_analysis_len CHECK (length(analysis) <= 500);

-- direct_messages
ALTER TABLE direct_messages
  ADD CONSTRAINT chk_direct_messages_content_len CHECK (length(content) <= 2000);

-- post_comments
ALTER TABLE post_comments
  ADD CONSTRAINT chk_post_comments_content_len CHECK (length(content) <= 500);

-- offers
ALTER TABLE offers
  ADD CONSTRAINT chk_offers_name_len        CHECK (length(name)        <= 60),
  ADD CONSTRAINT chk_offers_description_len CHECK (length(description) <= 300);

-- support_tickets
ALTER TABLE support_tickets
  ADD CONSTRAINT chk_support_tickets_title_len   CHECK (length(title)   <= 100),
  ADD CONSTRAINT chk_support_tickets_message_len CHECK (length(message) <= 3000);

-- suggestions
ALTER TABLE suggestions
  ADD CONSTRAINT chk_suggestions_title_len   CHECK (length(title)   <= 100),
  ADD CONSTRAINT chk_suggestions_message_len CHECK (length(message) <= 3000);
