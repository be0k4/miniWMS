import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGlobalLoading, useGlobalMessage } from "../../hooks/useGlobalUi";
import { authTokenStorage } from "../../utils/accessTokenStorage";
import { httpClient } from "../../utils/httpClient";

type LoginFormValues = {
  user_id: string;
  password: string;
};

type OneTimeTokenResponse = {
  token: string;
};

type LoginResponse = {
  result: boolean;
  user?: {
    user_id: string;
  };
  accessToken?: string;
};

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { withLoading } = useGlobalLoading();
  const { showMessage } = useGlobalMessage();

  const whsCd = searchParams.get("whs_cd")?.trim() ?? "";
  const agentCd = searchParams.get("agent_cd")?.trim() ?? "";
  const hasRlsParams = whsCd.length > 0 && agentCd.length > 0;

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormValues>({
    mode: "onChange",
    defaultValues: {
      user_id: "",
      password: "",
    },
  });

  // ログインボタン押下時の処理
  const onSubmit = handleSubmit(async (values) => {
    if (!hasRlsParams) {
      showMessage(
        "URLにwhs_cdとagent_cdを指定してください。例:\nhttps://example.com?whs_cd=WH001&agent_cd=AG001",
        "warning",
        5000,
      );
      return;
    }

    await withLoading(async () => {
      try {
        const oneTimeTokenResponse =
          await httpClient.get<OneTimeTokenResponse>("/login");

        const loginResponse = await httpClient.post<LoginResponse>(
          "/login",
          {
            user_id: values.user_id,
            password: values.password,
            whs_cd: whsCd,
            agent_cd: agentCd,
          },
          {
            headers: {
              Authorization: `Bearer ${oneTimeTokenResponse.data.token}`,
            },
          },
        );

        if (!loginResponse.data.result || !loginResponse.data.accessToken) {
          authTokenStorage.clear();
          showMessage("ユーザーIDまたはパスワードが不正です。", "error");
          return;
        }

        authTokenStorage.set({
          accessToken: loginResponse.data.accessToken,
        });
        console.log("Access token set:", authTokenStorage.getAccessToken());
        showMessage("ログインしました。", "success");
        navigate("/main");
      } catch (error) {
        authTokenStorage.clear();
        const axiosError = error as AxiosError;
        // 401 Unauthorized ワンタイムトークンの認証エラー
        if (axiosError.response?.status === 401) {
          showMessage("認証に失敗しました", "error");
          return;
        }
        showMessage("ログイン処理中にエラーが発生しました。", "error");
      }
    });
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "stretch",
        backgroundColor: "#f3f6fb",
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "100%",
          maxWidth: 1280,
          mx: "auto",
          py: { xs: 2, md: 3 },
          px: { xs: 1.5, md: 3 },
          gap: { xs: 1.5, md: 0 },
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", md: "55%" },
            position: "relative",
            borderRadius: { xs: 3, md: "20px 0 0 20px" },
            overflow: "hidden",
            color: "common.white",
            p: { xs: 3, md: 5 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background:
              "linear-gradient(160deg, #11355f 0%, #0b2442 45%, #061527 100%)",
            minHeight: { xs: 240, md: "auto" },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 20% 10%, rgba(105, 166, 255, 0.24) 0%, rgba(105, 166, 255, 0) 40%), radial-gradient(circle at 85% 75%, rgba(53, 206, 184, 0.18) 0%, rgba(53, 206, 184, 0) 40%)",
            }}
          />
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography
              variant="overline"
              sx={{
                letterSpacing: 1.6,
                color: "rgba(255,255,255,0.72)",
                fontWeight: 700,
              }}
            >
              WAREHOUSE OPERATIONS SYSTEM
            </Typography>
            <Typography
              component="h2"
              variant="h4"
              sx={{ mt: 1.2, fontWeight: 700, lineHeight: 1.3 }}
            >
              業務オペレーションを
              <br />
              安全に、正確に。
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 2, color: "rgba(255,255,255,0.8)", maxWidth: 430 }}
            >
              Mini WMS
              は倉庫現場の入出荷管理を支える業務アプリケーションです。認証情報を入力してシステムにアクセスしてください。
            </Typography>
          </Box>
          <Box sx={{ position: "relative", zIndex: 1, mt: { xs: 3, md: 0 } }}>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.68)" }}
            >
              © Mini WMS
            </Typography>
          </Box>
        </Box>

        <Card
          sx={{
            width: { xs: "100%", md: "45%" },
            borderRadius: { xs: 3, md: "0 20px 20px 0" },
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 24px 48px rgba(7, 30, 61, 0.12)",
            display: "flex",
          }}
        >
          <CardContent
            sx={{
              p: { xs: 3, md: 5 },
              width: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* Stack: 子要素を縦方向に等間隔で並べるレイアウト補助 */}
            <Stack
              spacing={2.5}
              component="form"
              onSubmit={onSubmit}
              noValidate
              sx={{ width: "100%" }}
            >
              <Box>
                <Box
                  component="img"
                  src="/logo192.png"
                  alt="Mini WMS ロゴ"
                  sx={{ width: 52, height: 52, mb: 1.5 }}
                />
                <Typography
                  component="h1"
                  variant="h5"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  Mini WMS ログイン
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.75 }}
                >
                  ユーザー情報を入力してログインしてください。
                </Typography>
              </Box>

              <Controller
                name="user_id"
                control={control}
                rules={{
                  required: "ユーザーIDは必須です。",
                  maxLength: {
                    value: 10,
                    message: "ユーザーIDは10文字以内で入力してください。",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="ユーザーID"
                    autoComplete="username"
                    error={Boolean(errors.user_id)}
                    helperText={errors.user_id?.message}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                rules={{
                  required: "パスワードは必須です。",
                  minLength: {
                    value: 4,
                    message: "パスワードは4文字以上で入力してください。",
                  },
                  maxLength: {
                    value: 128,
                    message: "パスワードは128文字以内で入力してください。",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="パスワード"
                    type="password"
                    autoComplete="current-password"
                    error={Boolean(errors.password)}
                    helperText={errors.password?.message}
                    fullWidth
                  />
                )}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={!isValid || isSubmitting}
                sx={{ height: 44, fontWeight: 700 }}
              >
                {isSubmitting ? "ログイン中..." : "ログイン"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default LoginPage;
