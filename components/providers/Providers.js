"use client";
import ToastProvider from "./ToastProvider";
import ConfirmProvider from "./ConfirmProvider";
import NotificationsProvider from "./NotificationsProvider";

export default function Providers({ children }) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <NotificationsProvider>{children}</NotificationsProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}
