-- =============================================================================
-- Keto Thai: schemat bazy (Supabase / PostgreSQL)
-- Etap 3 z PLAN.md §1a: tabele + Row Level Security.
--
-- Uruchomienie: Supabase → SQL Editor → New query → wklej całość → Run.
-- Skrypt jest jednorazowy: drugie uruchomienie zgłosi "already exists".
-- Każda kolejna zmiana schematu = nowy plik (np. 002_…sql), a nie edycja tego.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 0. Pomocnik: automatyczne updated_at
-- -----------------------------------------------------------------------------
-- Trigger ustawia datę zmiany przy każdym UPDATE, więc frontend nie musi
-- o niej pamiętać (i nie może jej podrobić).
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;


-- -----------------------------------------------------------------------------
-- 1. Tabele
-- -----------------------------------------------------------------------------
-- Wspólne zasady:
--   • user_id → auth.users(id) ON DELETE CASCADE: usunięcie konta kasuje
--     wszystkie dane tej osoby (RODO), bez sprzątania w kodzie.
--   • DEFAULT auth.uid(): baza sama wpisuje właściciela z sesji; frontend
--     nie musi (i nie powinien) go wysyłać.
--   • CHECK: te same granice co w formularzach. Formularz da się obejść,
--     bazy nie.

-- Profil: relacja 1:1 z kontem, więc user_id jest jednocześnie kluczem głównym.
-- Bez kolumny "weight": bieżąca waga = najnowszy wpis w weight_entries.
create table public.profiles (
    user_id     uuid primary key default auth.uid()
                references auth.users (id) on delete cascade,
    gender      text not null check (gender in ('male', 'female')),
    age         int  not null check (age between 18 and 99),
    height      numeric(4, 1) not null check (height between 130 and 210),
    activity    text not null check (activity in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    goal        text not null check (goal in ('reduction', 'still', 'mass')),
    sport       text check (sport in ('combat', 'gym', 'endurance', 'recreation')),
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create trigger profiles_set_updated_at
    before update on public.profiles
    for each row execute function public.set_updated_at();


-- Historia wagi: osobna tabela, bo rośnie bez końca i jest zapisywana
-- niezależnie od profilu (jeden pomiar = jeden mały INSERT).
create table public.weight_entries (
    id           bigint generated always as identity primary key,
    user_id      uuid not null default auth.uid()
                 references auth.users (id) on delete cascade,
    measured_on  date not null,
    weight_kg    numeric(5, 2) not null check (weight_kg between 35 and 200),
    created_at   timestamptz not null default now()
);

create index weight_entries_user_date_idx on public.weight_entries (user_id, measured_on);


-- Dziennik posiłków. Dane przepisu to KOPIA (snapshot) z chwili dodania:
-- historia tego, co zjedzono, nie zmienia się po edycji przepisu.
-- recipe_id bez klucza obcego: może wskazywać przepis z src/data, którego
-- baza nie zna.
create table public.meals (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null default auth.uid()
                references auth.users (id) on delete cascade,
    eaten_on    date not null,
    eaten_at    timestamptz not null default now(),
    recipe_id   text,
    title       text not null check (char_length(title) between 1 and 120),
    category    text check (category in ('śniadanie', 'obiad', 'kolacja')),
    image_url   text,
    calories    numeric(7, 1) not null check (calories >= 0),
    protein     numeric(6, 1) not null default 0 check (protein >= 0),
    fats        numeric(6, 1) not null default 0 check (fats >= 0),
    carbs       numeric(6, 1) not null default 0 check (carbs >= 0),  -- całkowite (z błonnikiem)
    fiber       numeric(6, 1) not null default 0 check (fiber >= 0),
    created_at  timestamptz not null default now()
);

-- Najczęstsze zapytanie aplikacji: "posiłki tej osoby z tego dnia".
create index meals_user_date_idx on public.meals (user_id, eaten_on);


-- Własne przepisy. Sumy makro zapisane w wierszu, bo baza nie zna produktów
-- z src/data i nie przeliczy ich sama.
create table public.custom_recipes (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null default auth.uid()
                references auth.users (id) on delete cascade,
    title       text not null check (char_length(title) between 1 and 120),
    category    text not null check (category in ('śniadanie', 'obiad', 'kolacja')),
    calories    numeric(7, 1) not null check (calories >= 0),
    protein     numeric(6, 1) not null default 0 check (protein >= 0),
    fats        numeric(6, 1) not null default 0 check (fats >= 0),
    carbs       numeric(6, 1) not null default 0 check (carbs >= 0),
    fiber       numeric(6, 1) not null default 0 check (fiber >= 0),
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create index custom_recipes_user_idx on public.custom_recipes (user_id);

create trigger custom_recipes_set_updated_at
    before update on public.custom_recipes
    for each row execute function public.set_updated_at();


-- Składniki: jeden składnik = jeden wiersz (to, co w localStorage było
-- tablicą { productId, grams }). Usunięcie przepisu kasuje jego składniki.
-- user_id to celowy dublet: dzięki niemu reguła RLS jest prosta.
create table public.custom_recipe_ingredients (
    id          bigint generated always as identity primary key,
    recipe_id   uuid not null references public.custom_recipes (id) on delete cascade,
    user_id     uuid not null default auth.uid()
                references auth.users (id) on delete cascade,
    product_id  text not null,           -- id produktu z src/data (bez FK)
    grams       numeric(7, 1) not null check (grams > 0),
    position    int  not null check (position >= 0),   -- kolejność na liście
    unique (recipe_id, position)
);

create index custom_recipe_ingredients_recipe_idx on public.custom_recipe_ingredients (recipe_id);


-- -----------------------------------------------------------------------------
-- 2. Uprawnienia ról
-- -----------------------------------------------------------------------------
-- "anon" = ktoś bez zalogowania (sam klucz publishable). Nie ma tu czego
-- szukać, więc odbieramy mu wszystko. "authenticated" = zalogowany:
-- może próbować operacji, a RLS (niżej) zawęża je do JEGO wierszy.
revoke all on public.profiles, public.weight_entries, public.meals,
              public.custom_recipes, public.custom_recipe_ingredients
       from anon;

grant select, insert, update, delete
      on public.profiles, public.weight_entries, public.meals,
         public.custom_recipes, public.custom_recipe_ingredients
      to authenticated;


-- -----------------------------------------------------------------------------
-- 3. Row Level Security
-- -----------------------------------------------------------------------------
-- Po ENABLE tabela jest domyślnie ZAMKNIĘTA: bez pasującej reguły baza zwraca
-- pustą listę i odrzuca zapisy. Reguły niżej otwierają tylko własne wiersze.
--
-- USING      — które istniejące wiersze widać / wolno zmienić / usunąć
-- WITH CHECK — jak musi wyglądać wiersz po INSERT / UPDATE
--              (bez tego dałoby się "przepisać" swój wiersz na cudze user_id)
--
-- (select auth.uid()) w nawiasie: baza liczy go RAZ na zapytanie, a nie
-- osobno dla każdego wiersza (zalecenie Supabase dla wydajności).

alter table public.profiles                  enable row level security;
alter table public.weight_entries            enable row level security;
alter table public.meals                     enable row level security;
alter table public.custom_recipes            enable row level security;
alter table public.custom_recipe_ingredients enable row level security;

create policy "Własny profil"
    on public.profiles for all to authenticated
    using      ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "Własne pomiary wagi"
    on public.weight_entries for all to authenticated
    using      ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "Własny dziennik"
    on public.meals for all to authenticated
    using      ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "Własne przepisy"
    on public.custom_recipes for all to authenticated
    using      ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

-- Składniki: oprócz własnego user_id sprawdzamy, że PRZEPIS też jest nasz.
-- Bez tego ktoś mógłby dopisać "swój" składnik do cudzego przepisu,
-- znając jego id.
create policy "Składniki własnych przepisów"
    on public.custom_recipe_ingredients for all to authenticated
    using ((select auth.uid()) = user_id)
    with check (
        (select auth.uid()) = user_id
        and exists (
            select 1
            from public.custom_recipes r
            where r.id = recipe_id
              and r.user_id = (select auth.uid())
        )
    );


-- -----------------------------------------------------------------------------
-- 4. (zarezerwowane: wgląd trenera w dziennik podopiecznego, /camp)
-- -----------------------------------------------------------------------------


-- -----------------------------------------------------------------------------
-- 5. Usunięcie własnego konta (przycisk "Usuń konto i dane")
-- -----------------------------------------------------------------------------
-- Klucz publishable nie może usunąć konta z auth.users. Zamiast klucza secret
-- na serwerze: funkcja w bazie.
--   SECURITY DEFINER   — działa z uprawnieniami twórcy (właściciela bazy),
--                        więc może usunąć wiersz z auth.users;
--   WHERE id = auth.uid() — ale wyłącznie konto osoby, która ją wywołała.
--   search_path = ''   — chroni przed podstawieniem cudzej tabeli o tej
--                        samej nazwie (dlatego pełne nazwy: auth.users).
-- Kaskada (ON DELETE CASCADE) skasuje resztę danych we wszystkich tabelach.
create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if auth.uid() is null then
        raise exception 'Brak zalogowanego użytkownika';
    end if;

    delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant  execute on function public.delete_my_account() to authenticated;
