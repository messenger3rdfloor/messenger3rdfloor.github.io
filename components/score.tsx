import { GameContext } from "@/context/game-context";
import styles from "@/styles/score.module.css";
import { useContext } from "react";

export default function Score() {
  const { score, highScore } = useContext(GameContext);

  return (
    <div className={styles.score}>
      <div className={styles.block}>
        Score
        <div>{score}</div>
      </div>
      <div className={styles.block}>
        Best
        <div>{highScore}</div>
      </div>
    </div>
  );
}
