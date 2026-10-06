-- =============================================================================
-- Keto Thai: 002 — zapis własnego przepisu w jednej transakcji
-- Etap 5 z PLAN.md §1a, wariant A (decyzja 2026-10-06).
--
-- Uruchomienie: Supabase → SQL Editor → New query → wklej całość → Run.
-- Wymaga 001 (schema.sql). Jednorazowy: drugie uruchomienie zgłosi "already exists".
-- =============================================================================
--
-- Problem: przepis to 1 wiersz w custom_recipes + N wierszy w
-- custom_recipe_ingredients. Dwa osobne zapytania z przeglądarki to dwie
-- osobne transakcje — zerwane połączenie między nimi zostawia przepis bez
-- składników albo w połowie zmieniony.
--
-- Rozwiązanie: jedna funkcja. Wywołanie supabase.rpc(...) to JEDNA transakcja:
-- jeśli którakolwiek instrukcja w środku się nie uda, Postgres cofa wszystkie
-- ("wszystko albo nic").
--
-- Ta sama funkcja tworzy i edytuje (upsert): przeglądarka nadaje id (uuid)
-- jeszcze przed zapisem, tak jak przy posiłkach.

create function public.save_custom_recipe(
    p_id          uuid,
    p_title       text,
    p_category    text,
    p_calories    numeric,
    p_protein     numeric,
    p_fats        numeric,
    p_carbs       numeric,
    p_fiber       numeric,
    p_ingredients jsonb   -- [{ "productId": "…", "grams": 120 }, …] — kolejność = kolejność na liście
)
returns void
language plpgsql
-- SECURITY INVOKER (domyślne, zapisane jawnie): funkcja działa z uprawnieniami
-- WYWOŁUJĄCEGO, więc reguły RLS z 001 obowiązują w środku tak samo jak przy
-- zwykłych zapytaniach. Inaczej niż delete_my_account(), które musiało sięgnąć
-- do auth.users i dlatego jest SECURITY DEFINER.
security invoker
set search_path = ''
as $$
begin
    if auth.uid() is null then
        raise exception 'Brak zalogowanego użytkownika';
    end if;

    if jsonb_typeof(p_ingredients) <> 'array' or jsonb_array_length(p_ingredients) = 0 then
        raise exception 'Przepis musi mieć co najmniej jeden składnik';
    end if;

    -- Nowy przepis: INSERT (user_id wpisze default auth.uid()).
    -- Istniejący: UPDATE samych danych. Cudzego przepisu nie da się tak
    -- nadpisać: RLS (using) nie pokaże cudzego wiersza, więc UPDATE zgłosi błąd.
    insert into public.custom_recipes (id, title, category, calories, protein, fats, carbs, fiber)
    values (p_id, p_title, p_category, p_calories, p_protein, p_fats, p_carbs, p_fiber)
    on conflict (id) do update set
        title    = excluded.title,
        category = excluded.category,
        calories = excluded.calories,
        protein  = excluded.protein,
        fats     = excluded.fats,
        carbs    = excluded.carbs,
        fiber    = excluded.fiber;

    -- Skład podmieniamy w całości: łatwiej i pewniej niż wyliczać, które
    -- składniki doszły, zniknęły albo zmieniły kolejność.
    delete from public.custom_recipe_ingredients where recipe_id = p_id;

    -- jsonb_array_elements rozkłada listę na wiersze, WITH ORDINALITY dokłada
    -- numer pozycji (od 1). CHECK z 001 (grams > 0) i reguła RLS "przepis też
    -- jest Twój" pilnują każdego wiersza osobno.
    insert into public.custom_recipe_ingredients (recipe_id, product_id, grams, position)
    select p_id,
           item ->> 'productId',
           (item ->> 'grams')::numeric,
           (ordinality - 1)::int
    from jsonb_array_elements(p_ingredients) with ordinality as t(item, ordinality);
end;
$$;

revoke execute on function public.save_custom_recipe(uuid, text, text, numeric, numeric, numeric, numeric, numeric, jsonb)
    from public, anon;
grant execute on function public.save_custom_recipe(uuid, text, text, numeric, numeric, numeric, numeric, numeric, jsonb)
    to authenticated;
