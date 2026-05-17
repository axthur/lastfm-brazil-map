import { useEffect, useRef } from "react";

export function LoadingBar({ loaded }) {
  const previousLoadedRef = useRef(loaded);
  const LIMIT = import.meta.env.VITE_LASTFM_LIMIT;
  const percentage = Math.min((loaded / LIMIT) * 100, 100);

  useEffect(() => {
    // Só loga quando o valor realmente mudar
    if (previousLoadedRef.current !== loaded) {
      console.log(
        `[LoadingBar] ${loaded} de ${LIMIT} artistas (${percentage.toFixed(2)}%)`,
      );
      previousLoadedRef.current = loaded;
    }
  }, [loaded, LIMIT, percentage]);

  return (
    <div className="loading-bar">
      <div
        className="loading-bar-fill"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
}
