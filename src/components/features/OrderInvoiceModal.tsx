import type { FC } from "react";
import { HiXMark } from "react-icons/hi2";
import type { FavoriteEntry, Food } from "../../types/menu";
import { formatPrice, toPersianDigits } from "../../lib/menu/utils";

interface OrderInvoiceModalProps {
  isOpen: boolean;
  items: Array<FavoriteEntry & { food: Food }>;
  onClose: () => void;
}

const OrderInvoiceModal: FC<OrderInvoiceModalProps> = ({
  isOpen,
  items,
  onClose,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.food.price * item.quantity,
    0,
  );
  const taxAmount = Math.round(subtotal * 0.1);
  const total = subtotal + taxAmount;

  const handleDownloadPdf = () => {
    if (typeof window === "undefined") return;

    const printWindow = window.open("", "_blank", "width=900,height=1200");

    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`<!DOCTYPE html>
      <html lang="fa" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <title>فاکتور سفارش</title>
          <style>
            body {
              font-family: Tahoma, Arial, sans-serif;
              margin: 0;
              padding: 24px;
              color: #111827;
              background: white;
            }
            .container { max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
            .title { font-size: 22px; font-weight: 700; }
            .sub { color: #6b7280; font-size: 13px; }
            .card { border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px; margin-bottom: 14px; }
            .item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
            .item:last-child { border-bottom: none; }
            .summary { border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 12px; }
            .row { display: flex; justify-content: space-between; margin-top: 8px; font-size: 14px; }
            .total { font-weight: 700; font-size: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div>
                <div class="title">فاکتور سفارش</div>
                <div class="sub">رایو - سفارش آنلاین</div>
              </div>
              <div class="sub">تاریخ: ${new Date().toLocaleDateString("fa-IR")}</div>
            </div>
            <div class="card">
              <div class="row"><span>نام رستوران</span><strong>رایو</strong></div>
              <div class="row"><span>تعداد آیتم‌ها</span><strong>${items.reduce((sum, item) => sum + item.quantity, 0)}</strong></div>
            </div>
            <div class="card">
              ${items
                .map(
                  (item) => `
                    <div class="item">
                      <div>
                        <div>${item.food.name}</div>
                        <div class="sub">تعداد: ${item.quantity}</div>
                      </div>
                      <div><strong>${formatPrice(item.food.price * item.quantity)}</strong></div>
                    </div>
                  `,
                )
                .join("")}
              <div class="summary">
                <div class="row"><span>جمع کل</span><span>${formatPrice(subtotal)}</span></div>
                <div class="row"><span>مالیات (۱۰٪)</span><span>${formatPrice(taxAmount)}</span></div>
                <div class="row total"><span>قابل پرداخت</span><span>${formatPrice(total)}</span></div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-zinc-950/70 p-2 sm:items-center sm:p-3">
      <div className="flex max-h-[98vh] w-full max-w-2xl flex-col rounded-[28px] bg-white p-4 shadow-2xl print:shadow-none sm:p-6">
        <div className="flex items-start justify-between gap-3 print:hidden">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">فاکتور سفارش</h2>
            <p className="mt-1 text-sm text-zinc-500">
              فاکتور شما آماده است؛ برای ذخیره نسخه PDF، روی گزینه دانلود کلیک
              کنید.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex w-10 items-center justify-center rounded-full bg-zinc-100"
            aria-label="بستن فاکتور"
          >
            <HiXMark className="h-5 w-5 text-zinc-700" />
          </button>
        </div>

        <div className="mt-2 rounded-[24px] border border-zinc-200 bg-zinc-50 p-4 sm:p-5">
          <div className="flex gap-3 border-b border-zinc-200 pb-2 sm:flex-row sm:items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">نام رستوران</p>
              <p className="text-lg font-bold text-zinc-900">رایو</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-zinc-500">تاریخ</p>
              <p className="text-sm font-semibold text-zinc-900">
                {new Date().toLocaleDateString("fa-IR")}
              </p>
            </div>
          </div>

          <div className="mt-2 overflow-y-auto pr-1">
            <div className="space-y-3 !max-h-[180px]">
              {items.map((item) => (
                <div
                  key={item.foodId}
                  className="flex items-center justify-between gap-1 rounded-2xl bg-white p-2 shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-zinc-900">
                      {item.food.name}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      تعداد: {toPersianDigits(item.quantity)}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-zinc-900">
                      {formatPrice(item.food.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 space-y-2 rounded-[20px] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-sm text-zinc-600">
              <span>جمع کل</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-zinc-600">
              <span>مالیات (۱۰٪)</span>
              <span>{formatPrice(taxAmount)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-200 pt-3 text-base font-bold text-zinc-900">
              <span>قابل پرداخت</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-2 flex shrink-0 flex-col gap-2 print:hidden sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="rounded-full bg-[#7a394a] px-4 py-2.5 text-sm font-semibold text-white"
          >
            دانلود PDF
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderInvoiceModal;
