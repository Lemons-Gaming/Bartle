// צבעי הפסים לכל טיפוס במסך הסיכום
const BAR_COLORS = { A: "#b8860b", E: "#386641", S: "#a23b6a", K: "#7a2e2e" };

// תצוגת פיקסל-ארט חדה
function PixelImg({ src, className, alt }) {
  return (
    <img
      src={src}
      alt={alt || ""}
      className={(className || "") + " pixelated"}
      draggable={false}
    />
  );
}

function App() {
  const [gameState, setGameState] = useState("intro"); // intro | playing | loading | result
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState({ A: 0, E: 0, S: 0, K: 0 });
  const [result, setResult] = useState(null); // אובייקט analyze
  const [shuffledOptions, setShuffledOptions] = useState([]);

  // ערבוב סדר התשובות בכל שאלה
  useEffect(() => {
    if (gameState === "playing" && questions[currentQuestion]) {
      const opts = [...questions[currentQuestion].options];
      setShuffledOptions(opts.sort(() => Math.random() - 0.5));
    }
  }, [currentQuestion, gameState]);

  const startGame = () => {
    setScores({ A: 0, E: 0, S: 0, K: 0 });
    setCurrentQuestion(0);
    setResult(null);
    setGameState("playing");
  };

  const handleAnswer = (type) => {
    const newScores = { ...scores, [type]: scores[type] + 1 };
    setScores(newScores);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finish(newScores);
    }
  };

  const finish = (finalScores) => {
    setResult(analyze(finalScores));
    setGameState("loading");
    setTimeout(() => setGameState("result"), 1600);
  };

  const progressPct = Math.round((currentQuestion / questions.length) * 100);

  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: STYLES }} />
    <div dir="rtl" className="min-h-screen flex items-center justify-center p-4 selection:bg-[#d8bc8a]">
      <div className="w-full max-w-2xl parchment-box p-6 md:p-12">
        <div className="nail" style={{ top: 12, left: 12 }}></div>
        <div className="nail" style={{ top: 12, right: 12 }}></div>
        <div className="nail" style={{ bottom: 12, left: 12 }}></div>
        <div className="nail" style={{ bottom: 12, right: 12 }}></div>

        {/* ===== מסך פתיחה ===== */}
        {gameState === "intro" && (
          <div className="text-center animate-fade-in">
            <div className="flex justify-center gap-3 md:gap-4 mb-6">
              {["A", "E", "S", "K"].map((t) => (
                <div key={t} className="w-14 h-14 md:w-20 md:h-20 image-frame">
                  <PixelImg src={icons[t]} className="w-full h-full" />
                </div>
              ))}
            </div>
            <h1 className="rpg-title text-4xl md:text-6xl font-black mb-3 leading-tight text-[#4a3320]">
              איזה סוג שחקן <br />
              <span className="text-[#8b2500]">אתה?</span>
            </h1>
            <h2 className="text-lg md:text-2xl font-bold mb-5 text-[#5a3c22]">
              גלו את טיפוס השחקן שלכם · מבוסס על מודל ברטל
            </h2>
            <p className="text-base md:text-xl mb-8 leading-relaxed font-semibold">
              חוקרים סודות? כובשים פסגות? אוהבים חברה, או נולדתם לתחרות?
              ענו על 12 שאלות קצרות וגלו <span className="underline decoration-[#8b2500]">את הדמות שמייצגת אתכם</span> — עם דיוקן פיקסל-ארט אישי.
            </p>
            <button
              onClick={startGame}
              className="parchment-btn rpg-title text-3xl px-12 py-4 bg-[#8b2500] hover:bg-[#a63000] border-[#3e2723]"
              style={{ color: "#f7c948", textShadow: "2px 2px 0 #3a1400, 0 0 1px #3a1400" }}
            >
              בואו נתחיל ⚔️
            </button>
          </div>
        )}

        {/* ===== מסך שאלות ===== */}
        {gameState === "playing" && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2 font-black text-[#4a3320] text-lg">
                <span>שאלה {currentQuestion + 1} מתוך {questions.length}</span>
                <span>{progressPct}%</span>
              </div>
              <div className="rpg-progress">
                <div className="rpg-progress-bar" style={{ width: progressPct + "%" }}></div>
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="text-5xl md:text-6xl mb-5 drop-shadow-md">{questions[currentQuestion].icon}</div>
              <h2 className="rpg-title text-2xl md:text-4xl font-black leading-snug text-[#3e2723]">
                {questions[currentQuestion].text}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {shuffledOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option.type)}
                  className="parchment-btn text-lg md:text-2xl p-4 md:p-5 text-right flex items-center leading-tight"
                >
                  <span className="opacity-50 ml-3 text-sm">♦</span>
                  <span>{option.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===== מסך טעינה (קוסמטי) ===== */}
        {gameState === "loading" && (
          <div className="text-center py-24 flex flex-col items-center justify-center animate-fade-in">
            <div className="text-7xl mb-8 blink drop-shadow-lg">✨🧙‍♂️</div>
            <h2 className="rpg-title text-4xl font-black mb-4 text-[#4a3320]">מגלים את טיפוס השחקן שלך...</h2>
            <p className="mt-2 text-[#8b2500] font-bold blink">רק רגע אחד...</p>
          </div>
        )}

        {/* ===== מסך תוצאה ===== */}
        {gameState === "result" && result && (
          <div className="text-center animate-fade-in">
            <h2 className="text-xl md:text-2xl font-bold text-[#5a3c22] mb-4">טיפוס השחקן שלך:</h2>

            <div className="mb-5 flex justify-center">
              <div className="w-44 h-44 md:w-60 md:h-60 image-frame">
                <PixelImg src={portraits[result.primary]} className="w-full h-full" />
              </div>
            </div>

            <h1 className={"rpg-title text-5xl md:text-6xl font-black mb-1 drop-shadow-sm " + resultData[result.primary].textColor}>
              {resultData[result.primary].title}
            </h1>
            <p className="text-lg md:text-xl font-bold text-[#5a3c22] mb-1">{resultData[result.primary].subtitle}</p>
            {result.combo && (
              <p className="text-base md:text-lg font-semibold text-[#8b2500] mb-4">{result.combo}</p>
            )}

            <div className="bg-[#e6ce9e] border-2 border-dashed border-[#5a3c22] p-5 my-5 text-right">
              <p className="text-lg md:text-2xl leading-relaxed font-bold text-[#3e2723]">
                {resultData[result.primary].description}
              </p>
            </div>

            {/* נקודות חוזק */}
            <div className="bg-[#d8bc8a] border-2 border-[#4a3320] p-4 mb-5 text-right shadow-inner">
              <h3 className="rpg-title text-xl font-black text-[#4a3320] mb-2">⭐ נקודות החוזק שלך</h3>
              <ul className="space-y-1">
                {resultData[result.primary].strengths.map((s, i) => (
                  <li key={i} className="text-base md:text-lg font-semibold text-[#3e2723] flex items-start">
                    <span className="ml-2 text-[#8b2500]">✦</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* התפלגות באחוזים */}
            <div className="bg-[#d8bc8a] border-2 border-[#4a3320] p-4 mb-5 text-right shadow-inner">
              <h3 className="rpg-title text-xl font-black text-[#4a3320] mb-3">התפלגות הטיפוסים שלך</h3>
              <div className="space-y-3">
                {result.ranked.map((r) => (
                  <div key={r.type}>
                    <div className="flex justify-between text-sm md:text-base font-bold text-[#3e2723] mb-1">
                      <span>{TYPE_NAMES[r.type]}</span>
                      <span>{r.pct}%</span>
                    </div>
                    <div className="rpg-bar-track">
                      <div
                        className="rpg-bar-fill"
                        style={{
                          width: r.pct + "%",
                          background: BAR_COLORS[r.type],
                          opacity: r.type === result.primary ? 1 : 0.7,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* טיפ */}
            <div className="bg-[#e6ce9e] border-2 border-[#4a3320] p-4 mb-7 text-right">
              <p className="text-base md:text-lg font-bold text-[#3e2723]">
                <span className="text-[#8b2500]">💡 טיפ: </span>
                {resultData[result.primary].tip}
              </p>
            </div>

            <button
              onClick={startGame}
              className="parchment-btn rpg-title px-10 py-4 text-2xl bg-[#4a3320] hover:bg-[#3e2723]"
              style={{ color: "#f7c948", textShadow: "2px 2px 0 #1a0f06" }}
            >
              לשחק שוב ↻
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
