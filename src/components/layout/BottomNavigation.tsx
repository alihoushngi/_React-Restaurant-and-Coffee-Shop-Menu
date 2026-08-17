import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import {
  HiBars3,
  HiClipboardDocumentList,
  HiMagnifyingGlass,
} from "react-icons/hi2";

import { AnimatePresence, motion } from "framer-motion";

const items = [
  // { href: "/", label: "خانه", icon: HiHome },
  { href: "/favorites", label: "لیست سفارش", icon: HiClipboardDocumentList },
  { href: "/search", label: "جستجو", icon: HiMagnifyingGlass },
];

const BottomNavigation = () => {
  const pathname = useLocation().pathname;
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 p-2 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-1">
          {items.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                to={href}
                className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-semibold leading-4 transition ${
                  isActive ? "text-white bg-[#7a394a]" : "text-zinc-500"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setIsInfoOpen(true)}
            className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-semibold leading-4 text-zinc-500"
          >
            <HiBars3 className="h-5 w-5" />
            <span>اطلاعات</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isInfoOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950/55"
            onClick={() => setIsInfoOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-xl rounded-t-[28px] bg-white p-5 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-zinc-200" />
              <h3 className="text-lg font-bold text-zinc-900">
                اطلاعات و نشانی
              </h3>
              <div className="mt-4 space-y-4 text-sm leading-7 text-zinc-700">
                <p>
                  فقط پنج‌شنبه و جمعه شب‌ها، مدت استفاده از میز حداکثر ۲ ساعته.
                  در سایر زمان‌ها محدودیتی که نداریم هیچ، خوشحال می‌شیم بیشتر
                  میزبانتون باشیم ☺️
                </p>
                <div className="rounded-2xl bg-zinc-50 p-4">
                  <p className="font-semibold text-zinc-900">نشانی</p>
                  <p className="mt-1">
                    لواسان، بعد از میدان گلندوک، کافه رستوران رایو
                  </p>
                  <p className="mt-1">تلفن: 26550072-021</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://map.google.com/?q=35.82458085337998,%2051.638400225813804"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-amber-500 px-3 py-2 font-semibold text-white"
                  >
                    گوگل مپ
                  </a>
                  <a
                    href="https://waze.com/ul/htnkez19u7"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-amber-500 px-3 py-2 font-semibold text-white"
                  >
                    Waze
                  </a>
                  <a
                    href="https://instagram.com/rayo.restaurant"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-amber-500 px-3 py-2 font-semibold text-white"
                  >
                    اینستاگرام
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default BottomNavigation;
