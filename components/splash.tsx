import { GameContext } from "@/context/game-context";
import styles from "@/styles/splash.module.css";
import { useContext, useState } from "react";
import html2canvas from "html2canvas";

export default function Splash({ heading = "You won!", type = "" }) {
  const { startGame, score } = useContext(GameContext);
  const [isSharing, setIsSharing] = useState(false);
  const showScore = type === "won" || type === "lost";

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const target = document.querySelector(
        "[data-game-capture='true']",
      ) as HTMLElement | null;

      if (!target) return;

      const clone = target.cloneNode(true) as HTMLElement;
      clone.setAttribute("data-share-mode", "true");
      clone.style.position = "fixed";
      clone.style.left = "-9999px";
      clone.style.top = "0";

      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        backgroundColor: "#faf8ef",
        scale: 2,
        logging: false,
        ignoreElements: (element) =>
          element.hasAttribute("data-capture-ignore"),
      });

      document.body.removeChild(clone);

      canvas.toBlob((blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `12288-score-${score}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Try to share via Web Share API if available
        if (navigator.share) {
          const file = new File([blob], `12288-score-${score}.png`, {
            type: "image/png",
          });
          navigator.share({
            title: "12288 Game",
            text: `I scored ${score} points in 12288!`,
            files: [file],
          }).catch(() => {
            // Silently fail if sharing is cancelled
          });
        }
      });
    } catch (error) {
      console.error("Failed to capture screenshot:", error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className={`${styles.splash} ${type === "won" && styles.win}`}>
      <div className={styles.content}>
        <h1>{heading}</h1>
        {showScore && (
          <div className={styles.scoreDisplay}>
            <p className={styles.scoreLabel}>Final Score</p>
            <p className={styles.scoreValue}>{score}</p>
          </div>
        )}
        <div className={styles.buttonGroup} data-capture-ignore="true">
          <button
            className={`${styles.button} ${styles.shareButton}`}
            onTouchEnd={handleShare}
            onClick={handleShare}
            disabled={isSharing}
          >
            {isSharing ? "Sharing..." : "Share Score"}
          </button>
          <button
            className={styles.button}
            onTouchEnd={startGame}
            onClick={startGame}
          >
            Play again
          </button>
        </div>
      </div>
    </div>
  );
}
