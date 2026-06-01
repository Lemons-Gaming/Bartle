// ============================================================================
//  מודל ברטל — לוגיקת חישוב תוצאה
//  פונקציות טהורות: דירוג טיפוסים, אחוזים, טיפוס ראשי/משני וטקסט שילוב.
// ============================================================================

const TYPE_ORDER = ["A", "E", "S", "K"];

// שמות הטיפוס (לתצוגת התפלגות) ושמות התכונה (לטקסט השילוב)
export const TYPE_NAMES  = { A: "כובש",  E: "חוקר",   S: "חברותי",   K: "לוחם" };
export const TRAIT_NAMES = { A: "הישגיות", E: "חקרנות", S: "חברותיות", K: "תחרותיות" };

// מחזיר מערך {type, score, pct} ממוין מהגבוה לנמוך.
// אם אין ניקוד כלל — סדר ברירת מחדל A,E,S,K עם 0%.
export function getRanked(scores) {
  const total = TYPE_ORDER.reduce((s, t) => s + (scores[t] || 0), 0);
  const arr = TYPE_ORDER.map((t) => ({
    type: t,
    score: scores[t] || 0,
    pct: total > 0 ? Math.round(((scores[t] || 0) / total) * 100) : 0,
  }));
  // מיון יורד; שובר שוויון לפי סדר הטיפוסים הקבוע ליציבות
  arr.sort((a, b) => b.score - a.score || TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type));
  return arr;
}

// מחזיר את הטיפוס הראשי והמשני (שני הגבוהים).
export function getPrimarySecondary(scores) {
  const ranked = getRanked(scores);
  return { primary: ranked[0].type, secondary: ranked[1].type };
}

// טקסט שילוב: אם המשני חזק וקרוב לראשי — "עם נטייה חזקה ל...".
// אחרת מחזיר מחרוזת ריקה (טיפוס מובהק יחיד).
export function comboLabel(ranked) {
  const [first, second] = ranked;
  if (!second) return "";
  const gap = first.pct - second.pct;
  if (second.pct >= 25 && gap <= 17) {
    return `עם נטייה חזקה ל${TRAIT_NAMES[second.type]}`;
  }
  return "";
}

// פונקציית עזר אחת שמרכזת את כל ניתוח התוצאה.
export function analyze(scores) {
  const ranked = getRanked(scores);
  return {
    ranked,
    primary: ranked[0].type,
    secondary: ranked[1].type,
    combo: comboLabel(ranked),
  };
}
