import { Alert, Snackbar } from "@mui/material";
import { useRecoilState } from "recoil";
import { noticeState } from "../../states/messageInfoState";
import type { FC } from "react";

const GlobalNotice: FC = () => {
  const [notice, setNotice] = useRecoilState(noticeState);

  const handleClose = () => {
    setNotice((prev) => ({ ...prev, open: false }));
  };

  return (
    <Snackbar
      open={notice.open}
      autoHideDuration={notice.autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={handleClose}
        severity={notice.severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {notice.message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalNotice;
