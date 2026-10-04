// Poziomy aktywności — JEDNO źródło liczb: mnożnik PAL (FAO/WHO/UNU) i białko
// w g/kg masy referencyjnej. Białko rośnie z aktywnością: dolny koniec to górna
// granica VLCKD (1,5 g/kg masy idealnej), górny to zakres ISSN dla aktywnych
// (1,4–2,2 g/kg). Teksty dla użytkownika żyją w onboarding.js — tu tylko liczby.
// Klucze celowo INNE niż stare "low/medium/high" — patrz userService.js.
export const ACTIVITY_LEVELS = {
    sedentary: { pal: 1.2, proteinPerKg: 1.4 },
    light: { pal: 1.375, proteinPerKg: 1.6 },
    moderate: { pal: 1.55, proteinPerKg: 1.8 },
    active: { pal: 1.725, proteinPerKg: 2.0 },
    very_active: { pal: 1.9, proteinPerKg: 2.0 },
};

export const isKnownActivity = (activity) => Object.hasOwn(ACTIVITY_LEVELS, activity);

// Zmiana względem TDEE jako procent, nie sztywne ±500 kcal — ta sama kwota
// to 18% deficytu dla dużej osoby i 48% dla małej (PROGRES.md, sesja 18.09).
const GOAL_MULTIPLIERS = {
    reduction: 0.85,
    still: 1,
    mass: 1.1,
};

// Docelowy deficyt redukcji w % — do komunikatu "X% zamiast Y%".
export const TARGET_DEFICIT_PERCENT = Math.round((1 - GOAL_MULTIPLIERS.reduction) * 100);

export const isKnownGoal = (goal) => Object.hasOwn(GOAL_MULTIPLIERS, goal);

// Dolne granice redukcji wg AHA/ACC/TOS 2013 (1200–1500 K / 1500–1800 M).
const CALORIE_FLOOR = {
    male: 1500,
    female: 1200,
};

// Węgle NETTO, traktowane jako sufit dzienny (ISSN: keto = < 50 g/dobę).
const NET_CARBS_LIMIT = 50;

const REFERENCE_BMI = 25;

const KCAL_PER_GRAM = { protein: 4, carbs: 4, fats: 9 };

const calculateBMR = (weight, height, age, gender) => {
    if (gender === "male") {
        return 10 * weight + 6.25 * height - 5 * age + 5;
    }

    if (gender === "female") {
        return 10 * weight + 6.25 * height - 5 * age - 161;
    }
    throw new Error("Niezdefiniowana płeć");
};

const getActivityLevel = (activity) => {
    const level = ACTIVITY_LEVELS[activity];
    if (!level) {
        throw new Error(`Niezdefiniowana aktywność: ${activity}`);
    }
    return level;
};

// Białko liczone od masy przy BMI 25, jeśli ktoś waży więcej — przy otyłości
// g/kg masy całkowitej wypycha tłuszcz poniżej progu keto (150 kg → 300 g białka).
// Przy prawidłowej masie nic się nie zmienia, bo wygrywa realna waga.
const calculateReferenceWeight = (weight, height) => {
    const heightInMeters = height / 100;
    const weightAtReferenceBMI = REFERENCE_BMI * heightInMeters ** 2;
    return Math.min(weight, weightAtReferenceBMI);
};

// Wartości `floorLimit` — czy i jak podłoga kaloryczna zmieniła redukcję.
// Dashboard musi to powiedzieć wprost: bez tego "redukcja" po cichu robi coś
// innego, niż obiecuje (ok. 3,7% profili w siatce testowej, PROGRES.md 02.10).
export const FLOOR_LIMIT = {
    reduced: "reduced", // deficyt mniejszy niż docelowy, ale jest
    maintenance: "maintenance", // TDEE poniżej podłogi — deficytu nie ma wcale
};

// Zwraca kalorie RAZEM z informacją o podłodze — tylko ta funkcja wie, że
// zadziałała. Gdyby wiedza wyciekała gdzie indziej, widok musiałby liczyć TDEE
// drugi raz i rozjechałby się przy pierwszej zmianie progów.
const calculateTargetCalories = (tdee, goal, gender) => {
    const multiplier = GOAL_MULTIPLIERS[goal];
    if (multiplier === undefined) {
        throw new Error("Niezdefiniowany cel");
    }

    const target = tdee * multiplier;

    if (goal !== "reduction" || target >= CALORIE_FLOOR[gender]) {
        return { calories: target, floorLimit: null };
    }

    // Podłoga nie może przebić TDEE — inaczej małej osobie "redukcja"
    // dałaby nadwyżkę. Wtedy dostaje po prostu utrzymanie.
    if (CALORIE_FLOOR[gender] >= tdee) {
        return { calories: tdee, floorLimit: FLOOR_LIMIT.maintenance };
    }
    return { calories: CALORIE_FLOOR[gender], floorLimit: FLOOR_LIMIT.reduced };
};

// Plan zwraca `netCarbs`, nie `carbs`: w przepisach i wpisach `carbs` to węgle
// CAŁKOWITE (z błonnikiem). Inna nazwa nie pozwala ich przypadkiem porównać.
const calculateKetoMacros = (calories, referenceWeight, proteinPerKg) => {
    const netCarbs = NET_CARBS_LIMIT;
    const protein = Math.round(referenceWeight * proteinPerKg);

    const usedCalories = netCarbs * KCAL_PER_GRAM.carbs + protein * KCAL_PER_GRAM.protein;
    const fats = Math.round((calories - usedCalories) / KCAL_PER_GRAM.fats);

    return {
        netCarbs,
        protein,
        fats,
    };
};

export const generateDietPlan = (userProfile) => {
    const { age, gender, height, weight, activity, goal } = userProfile;
    const { pal, proteinPerKg } = getActivityLevel(activity);

    const bmr = calculateBMR(weight, height, age, gender);
    const tdee = bmr * pal;
    const target = calculateTargetCalories(tdee, goal, gender);
    const calories = Math.round(target.calories);

    const referenceWeight = calculateReferenceWeight(weight, height);
    const macros = calculateKetoMacros(calories, referenceWeight, proteinPerKg);

    // Faktyczny deficyt w % — komunikat podaje konkretną liczbę ("10% zamiast 15%").
    // Dwa brzegi zaokrąglenia: "0%" to w praktyce utrzymanie, a "15% zamiast 15%"
    // (podłoga podniosła cel o ułamek procenta) nie jest warte komunikatu.
    let { floorLimit } = target;
    let deficitPercent = null;
    if (floorLimit === FLOOR_LIMIT.reduced) {
        deficitPercent = Math.round((1 - calories / tdee) * 100);
        if (deficitPercent === 0) {
            floorLimit = FLOOR_LIMIT.maintenance;
            deficitPercent = null;
        } else if (deficitPercent >= TARGET_DEFICIT_PERCENT) {
            floorLimit = null;
            deficitPercent = null;
        }
    }

    return {
        calories,
        ...macros,
        floorLimit,
        deficitPercent,
    };
};
