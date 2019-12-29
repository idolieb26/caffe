import * as React from "react";
import styles from "./App.module.css";

const App: React.FC = () => {
  return <div className={styles.app}>env: {process.env.NODE_ENV}</div>;
};

export default App;
