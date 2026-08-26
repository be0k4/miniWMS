import { useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import axios, { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGlobalLoading, useGlobalMessage } from "../../hooks/useGlobalUi";
import { authTokenStorage } from "../../utils/accessTokenStorage";

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
  token?: {
    accessToken: string;
  };
};

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { withLoading } = useGlobalLoading();
  const { showMessage } = useGlobalMessage();

  const whsCd = searchParams.get("whs_cd")?.trim() ?? "";
  const agentCd = searchParams.get("agent_cd")?.trim() ?? "";
  const hasRlsParams = whsCd.length > 0 && agentCd.length > 0;

  // !!!!!axiosは今後シングルトン化するので仮おき
  const api = useMemo(
    () =>
      axios.create({
        timeout: 10000,
        // Cookieの送信を有効化する
        // 同一オリジンの通信を想定しているが、フロント側は必須
        withCredentials: true,
      }),
    [],
  );

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
          await api.get<OneTimeTokenResponse>("/login");

        const loginResponse = await api.post<LoginResponse>(
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

        if (
          !loginResponse.data.result ||
          !loginResponse.data.token?.accessToken
        ) {
          authTokenStorage.clear();
          showMessage("ユーザーIDまたはパスワードが不正です。", "error");
          return;
        }

        authTokenStorage.set({
          accessToken: loginResponse.data.token.accessToken,
        });
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
        display: "grid",
        placeItems: "center",
        px: 2,
        background:
          "radial-gradient(circle at 10% 20%, #e3f2fd 0%, #f5f7fb 45%, #ffffff 100%)",
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 460 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Stack: 子要素を縦方向に等間隔で並べるレイアウト補助 */}
          <Stack spacing={2.5} component="form" onSubmit={onSubmit} noValidate>
            <Box>
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
                  value: 8,
                  message: "パスワードは8文字以上で入力してください。",
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
              disabled={!isValid || isSubmitting || !hasRlsParams}
              sx={{ height: 42, fontWeight: 700 }}
            >
              {isSubmitting ? "ログイン中..." : "ログイン"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
