import { Motorbike, UtensilsCrossed } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Logo from "@/assets/logo/logo.png";

export default function Home() {
  const navigate = useNavigate();

  const menuOptions = [
    {
      id: "tablemenu",
      title: "منو سالن",
      description: "مشاهده منوی سفارش داخل کافه",
      icon: UtensilsCrossed,
      route: "/tablemenu",
    },
    {
      id: "deliverymenu",
      title: "منو بیرون بر",
      description: "مشاهده منوی سفارش بیرون بر",
      icon: Motorbike,
      route: "/deliverymenu",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f6f1eb] px-4 py-8 text-right flex justify-center items-center">
      <div className="mx-auto flex max-w-md flex-col justify-center">
        {/* Logo */}
        <section className="mb-2 flex flex-col items-center">
          <div className="mb-2 overflow-hidden rounded-3xl bg-white p-4 shadow-sm">
            <img
              src={Logo}
              alt="Rayo Cafe"
              width={80}
              height={80}
              sizes="80px"
              className="object-contain"
            />
          </div>

          {/* <h1 className="text-2xl font-bold text-zinc-900">کافه آولی</h1> */}

          <p className="mt-0 text-sm leading-6 text-zinc-500">
            لطفاً نوع منوی مورد نظر خود را انتخاب کنید
          </p>
        </section>

        {/* Notice */}
        <section className="mb-2 rounded-[22px] border border-[#7a394a] bg-[#7a394a]/90 p-4 text-sm leading-6 text-white shadow-sm">
          <p className="font-semibold">به کافه رایو خوش آمدید ✨</p>
          <p className="mt-1 text-[13px] opacity-90">
            برای مشاهده منوی سالن یا سفارش بیرون بر، یکی از گزینه‌های زیر را
            انتخاب کنید.
          </p>
        </section>

        {/* Menu Cards */}
        <section className="flex flex-col gap-4 mt-2">
          {menuOptions.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.route)}
                className="group rounded-[28px] bg-white p-5 text-right shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#496a65]/10">
                    <Icon className="h-6 w-6 text-[#496a65]" />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-base font-bold text-zinc-900">
                      {item.title}
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-zinc-500">
                      {item.description}
                    </p>
                  </div>

                  <div className="text-xl text-zinc-300 transition group-hover:-translate-x-1">
                    ←
                  </div>
                </div>
              </button>
            );
          })}
        </section>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-zinc-400">
          Rayo Cafe Menu © 2026
        </footer>
      </div>
    </main>
  );
}
