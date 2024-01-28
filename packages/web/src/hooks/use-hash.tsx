import { useCallback, useEffect, useState } from "react";

type HashRecord = Record<string, string | null>;

const fromObject = (obj: HashRecord) =>
  Object.entries(obj)
    .filter(([_, value]) => value != null)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

const toObject = (hash: string) =>
  hash
    .slice(1)
    .split("&")
    .reduce((acc, curr) => {
      const [key, value] = curr.split("=");
      return { ...acc, [key]: value };
    }, {});

export function useHash(): [HashRecord, (newHash: HashRecord) => void] {
  const [hash, setHash] = useState<HashRecord>(() =>
    toObject(window.location.hash)
  );

  const hashChangeHandler = useCallback(() => {
    setHash(toObject(window.location.hash));
  }, []);

  useEffect(() => {
    window.addEventListener("hashchange", hashChangeHandler);
    return () => {
      window.removeEventListener("hashchange", hashChangeHandler);
    };
  }, []);

  const updateHash = useCallback(
    (newHash: HashRecord) => {
      if (newHash != hash) window.location.hash = fromObject(newHash);
    },
    [hash]
  );

  return [hash, updateHash];
}
