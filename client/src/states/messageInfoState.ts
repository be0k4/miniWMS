import { atom } from "recoil";

export type NoticeSeverity = "success" | "info" | "warning" | "error";

export type NoticeState = {
  open: boolean;
  message: string;
  severity: NoticeSeverity;
  autoHideDuration: number;
};

export const noticeState = atom<NoticeState>({
  key: "noticeState",
  default: {
    open: false,
    message: "",
    severity: "info",
    autoHideDuration: 3000,
  },
});
