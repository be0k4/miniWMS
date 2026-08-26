import { useCallback } from "react";
import { useSetRecoilState } from "recoil";
import { noticeState, type NoticeSeverity } from "../states/messageInfoState";
import { loadingCountState } from "../states/loadingState";

/**
 * withLoading: 非同期処理をラップし、処理中はグローバルローディング状態を表示する
 * @param task 非同期処理の関数
 */
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

/**
 * showMessage: グローバル通知を表示する
 * @param message 通知メッセージ
 * @param severity 通知の重要度（success, info, warning, error）
 * @param autoHideDuration 自動で非表示にするまでの時間（ミリ秒）
 */
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
