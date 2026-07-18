import { Bounce, ToastContainer, toast } from "react-toastify";

import { useEffect, useRef } from "react";
import { subscribeToToast } from "../../lib/toast";

const ToastViewport = () => {
  const lastToastMessageRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToToast((toastItem) => {
      if (lastToastMessageRef.current === toastItem.message) {
        return;
      }

      lastToastMessageRef.current = toastItem.message;

      toast.success(toastItem.message, {
        position: "top-center",
        autoClose: 1600,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        closeButton: false,
        theme: "dark",
        transition: Bounce,
        className:
          "!min-h-0 !px-3 !py-3 !text-[13px] !font-medium !shadow-md !text-white !bg-[#7a394a] !border !border-[#7a394a] !shadow-[#7a394a]/50",
        style: {
          fontFamily: "var(--font-vazir)",
        },
      });

      window.setTimeout(() => {
        lastToastMessageRef.current = null;
      }, 1800);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ToastContainer
      position="top-center"
      autoClose={1600}
      hideProgressBar
      newestOnTop={false}
      closeOnClick
      rtl
      pauseOnFocusLoss={false}
      draggable
      pauseOnHover={false}
      theme="light"
      toastClassName="!shadow-none"
      limit={1}
    />
  );
};

export default ToastViewport;
