import { Link } from "react-router-dom";
import Logo from "@/assets/logo/LogoNew.svg";
import DeliveryButton from "@/assets/main/delivery.png";
import RestaurantButton from "@/assets/main/resturant.png";
import Pictograms from "@/assets/main/picto.svg";
import { getMenuPath } from "../lib/menu/utils";

const menuChoiceClass =
  "block w-1/2 transition duration-300 hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6d1e39] active:scale-[0.98]";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col bg-[#f7f1f0] px-6 pt-12 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex justify-center w-full max-w-md flex-1 flex-col">
        <header className="flex flex-col items-center">
          <p className="text-[18px] font-normal text-[#525252] uppercase italic text-nowrap">
            welcome to
          </p>
          <img
            src={Logo}
            alt="Rayo Coffee"
            width={246}
            height={178}
            className="mt-2 h-auto w-32 object-contain opacity-70"
          />
        </header>

        <section className="mb-10 mt-16 flex gap-2 w-full items-center justify-center">
          <Link
            to={getMenuPath("dineIn")}
            aria-label="ورود به منوی کافه و رستوران"
            className={menuChoiceClass}
          >
            <img
              src={RestaurantButton}
              alt=""
              width={1605}
              height={1565}
              className="h-auto w-full object-contain"
            />
          </Link>

          <Link
            to={getMenuPath("delivery")}
            aria-label="ورود به منوی بیرون‌بر"
            className={menuChoiceClass}
          >
            <img
              src={DeliveryButton}
              alt=""
              width={1609}
              height={1565}
              className="h-auto w-full object-contain"
            />
          </Link>
        </section>

        <footer className="mt-12 pt-4">
          <img
            src={Pictograms}
            alt=""
            width={722}
            height={214}
            className="mx-auto w-full max-w-sm object-contain opacity-40"
          />
        </footer>
      </div>
    </main>
  );
}
