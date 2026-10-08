-- =============================================================================
-- Keto Thai: 003 — zapis zgód (dowód zgody, art. 7 ust. 1 RODO)
-- PRAWO.md §2.3 i §14 (wariant C, decyzja 2026-10-08), PLAN.md §1a luka nr 8.
--
-- Uruchomienie: Supabase → SQL Editor → New query → wklej całość → Run.
-- Wymaga 001 (schema.sql). Jednorazowy: drugie uruchomienie zgłosi "already exists".
-- =============================================================================
--
-- Problem: checkbox `required` w formularzu tylko blokuje wysyłkę — po
-- rejestracji nie zostaje żaden ślad, że ktoś się zgodził. Gdy użytkownik
-- powie UODO "nigdy się nie zgadzałem", to MY musimy wykazać zgodę.
--
-- Rozwiązanie: dziennik zgód. Każdy wiersz odpowiada na pytania dowodowe:
--   kto        → user_id
--   na co      → kind (rodzaj zgody)
--   na jaki tekst → version (treść każdej wersji zostaje w historii gita,
--                   src/services/consentService.js)
--   kiedy      → granted_at (czas serwera, nie przeglądarki — zegar
--                   w przeglądarce użytkownik może przestawić)
--   jak        → source (formularz e-mail, rejestracja Google, ekran zgód)
--
-- Tylko dopisywanie: brak reguł RLS dla UPDATE i DELETE, więc z przeglądarki
-- nie da się zmienić ani skasować dowodu. Nowa wersja regulaminu = nowy wiersz.
--
-- ⚠️ on delete cascade: usunięcie konta kasuje też zgody. Czy dowód zgody ma
-- przetrwać usunięcie konta (i jak długo), to otwarte pytanie do prawnika
-- (PRAWO.md §15, pkt 7). Zmiana na później: osobna tabela archiwum albo
-- kolumna bez klucza obcego.

create table public.consents (
    id          bigint generated always as identity primary key,
    user_id     uuid not null default auth.uid()
                references auth.users (id) on delete cascade,
    kind        text not null check (kind in ('terms', 'health')),
    version     text not null check (char_length(version) between 1 and 40),
    source      text not null check (source in ('email_signup', 'google_signup', 'consent_screen')),
    granted_at  timestamptz not null default now()
);

create index consents_user_kind_idx on public.consents (user_id, kind);

revoke all on public.consents from anon;
grant select, insert on public.consents to authenticated;

alter table public.consents enable row level security;

create policy "Własne zgody: odczyt"
    on public.consents for select to authenticated
    using ((select auth.uid()) = user_id);

-- with check: nie da się dopisać zgody w cudzym imieniu.
create policy "Własne zgody: dopisanie"
    on public.consents for insert to authenticated
    with check ((select auth.uid()) = user_id);
