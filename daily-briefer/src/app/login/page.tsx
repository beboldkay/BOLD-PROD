import LoginButton from "./LoginButton";

const ERRORS: Record<string, string> = {
  not_allowed: "החשבון הזה לא מורשה להיכנס לאפליקציה הזו.",
  no_code: "החיבור ל-Google לא הושלם. נסה שוב.",
  exchange_failed: "לא הצלחנו לאמת את הכניסה מול Google. נסה שוב.",
  access_denied: "ביטלת את ההרשאה ב-Google. בלי זה אי אפשר להיכנס.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="login-shell">
      <div className="login-card">
        <h1>יומן BOLD</h1>
        <p>
          הכדורים, המים, המשימות, הפרויקטים והדואר — הכול במקום אחד.
          <br />
          הכניסה דרך Google, עם הרשאות קריאה בלבד ל-Gmail וליומן.
        </p>
        {error && <div className="login-error">{ERRORS[error] ?? "משהו השתבש בכניסה."}</div>}
        <LoginButton />
      </div>
    </div>
  );
}
