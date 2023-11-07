import { notifications } from "@mantine/notifications";
/**
 * Handles chat errors and shows notifications.
 *
 */
export function handleChatError(error: any) {
  console.error(error);
  if (error?.error?.message === "Network Error") {
    notifications.show({
      title: "Error",
      color: "red",
      message: "No internet connection.",
    });
    return;
  }
  const message = error?.error?.message;
  if (message) {
    notifications.show({
      title: `Error: ${error.error.code}`,
      color: "red",
      message,
    });
    return;
  }
  notifications.show({
    title: "Error",
    color: "red",
    message: error?.message ?? error,
  });
}
