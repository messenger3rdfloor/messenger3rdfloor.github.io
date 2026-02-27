import Head from "next/head";
import Image from "next/image";
import Board from "@/components/board";
import Score from "@/components/score";
import styles from "@/styles/index.module.css";

export default function Home() {
  return (
    <div className={styles.twenty48} data-game-capture="true">
      <Head>
        <title>Play 12288</title>
        <meta
          name="description"
          content="2048 game clone using multiples of three instead of two built in NextJS and TypeScript. Including animations."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="apple-touch-icon.png"
        />
        <link rel="icon" type="image/png" sizes="32x32" href="favicon32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="favicon16.png" />
      </Head>
      <header>
        <h1>12288</h1>
        <Score />
      </header>
      <main>
        <Board />
      </main>
      <footer>
        <div>Forked from Matéush 2048 game</div>
      </footer>
    </div>
  );
}
