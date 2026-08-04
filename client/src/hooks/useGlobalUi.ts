import { useCallback } from "react";
import { useSetRecoilState } from "recoil";
import { noticeState, type NoticeSeverity } from "../states/messageInfoState";
import { loadingCountState } from "../states/loadingState";

export const useGlobalLoading = () => {
  const setLoadingCount = useSetRecoilState(loadingCountState);

  const startLoading = useCallback(() => {
    setLoadingCount((prev) => prev + 1);
  }, [setLoadingCount]);

  const endLoading = useCallback(() => {
    setLoadingCount((prev) => Math.max(0, prev - 1));
  }, [setLoadingCount]);

  const withLoading = useCallback(
    async <T>(task: () => Promise<T>) => {
      startLoading();
      try {
        return await task();
      } finally {
        endLoading();
      }
    },
    [startLoading, endLoading],
  );

  return { startLoading, endLoading, withLoading };
};

export const useGlobalMessage = () => {
  const setNotice = useSetRecoilState(noticeState);

  const showMessage = useCallback(
    (
      message: string,
      severity: NoticeSeverity = "info",
      autoHideDuration = 3000,
    ) => {
      setNotice({
        open: true,
        message,
        severity,
        autoHideDuration,
      });
    },
    [setNotice],
  );

  return { showMessage };
};
