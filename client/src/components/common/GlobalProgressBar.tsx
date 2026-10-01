import { LinearProgress } from "@mui/material";
import { useRecoilValue } from "recoil";
import { isLoadingState } from "../../states/loadingState";
import type { FC } from "react";

const GlobalProgressBar: FC = () => {
  const isLoading = useRecoilValue(isLoadingState);

  if (!isLoading) return null;

  return (
    <LinearProgress
      color="primary"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: (theme) => theme.zIndex.snackbar + 1,
      }}
    />
  );
};

export default GlobalProgressBar;
