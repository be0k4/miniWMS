import { atom, selector } from "recoil";

// ローディング状態の管理
export const loadingCountState = atom<number>({
  key: "loadingCountState",
  default: 0,
});

export const isLoadingState = selector<boolean>({
  key: "isLoadingState",
  get: ({ get }) => get(loadingCountState) > 0,
});
