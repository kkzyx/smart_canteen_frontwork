import EmployeeAPI, { LoginData } from "@/api/employee";
import { resetRouter } from "@/router";
import { store } from "@/store";
import { TOKEN_KEY } from "@/enums/CacheEnum";

export const useUserStore = defineStore("user", () => {
  /** 用户登录 */
  function login(loginData: LoginData) {
    return new Promise<void>((resolve, reject) => {
      EmployeeAPI.login(loginData)
        .then((res) => {
          const { token } = res.data as any;
          token && localStorage.setItem(TOKEN_KEY, token);
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /** 用户退出 */
  function logout() {
    return new Promise<void>((resolve, reject) => {
      EmployeeAPI.logout()
        .then(() => {
          localStorage.setItem(TOKEN_KEY, "");
          location.reload(); // 清空路由
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /** 移除token */
  function resetToken() {
    console.log("resetToken");
    return new Promise<void>((resolve) => {
      localStorage.setItem(TOKEN_KEY, "");
      resetRouter();
      resolve();
    });
  }

  return {
    login,
    logout,
    resetToken,
  };
});

export function useUserStoreHook() {
  return useUserStore(store);
}
