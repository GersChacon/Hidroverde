export function getTrim(id) {
    const el = document.getElementById(id);
    return (el?.value ?? "").trim();
}

export function getNumber(id, { nullable = false } = {}) {
    const v = getTrim(id);
    if (v === "") return nullable ? null : NaN;
    return Number(v);
}

export function getDecimal(id, { nullable = false } = {}) {
    return getNumber(id, { nullable });
}

export function getBool(id) {
    const el = document.getElementById(id);
    return String(el?.value) === "true";
}

export function nullableString(s) {
    return s === "" ? null : s;
}
