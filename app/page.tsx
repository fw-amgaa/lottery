import Image from "next/image";
import Link from "next/link";
import { getLotteryItems } from "./dashboard/lottery-items/actions";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { connection } from "next/server";

export default async function Page() {
  await connection();
  const items = await getLotteryItems();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="Азтай Монгол"
              width={36}
              height={36}
              className="rounded-full"
            />
            <span className="text-sm font-semibold tracking-tight">
              Азтай Монгол
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-white/50">
            <a href="#lottery" className="transition hover:text-white">
              Сугалаа
            </a>
            <a href="#how-to" className="transition hover:text-white">
              Заавар
            </a>
            <a href="#rules" className="transition hover:text-white">
              Нөхцөл
            </a>
          </nav>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-6">
        {/* bg glow */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[160px]" />

        <div className="relative mb-8 h-32 w-32 sm:h-40 sm:w-40">
          <Image
            src="/logo.jpg"
            alt="Азтай Монгол Сугалаа"
            fill
            className="rounded-3xl object-cover shadow-2xl shadow-amber-900/30 ring-1 ring-white/10"
            priority
          />
        </div>

        <h1 className="max-w-3xl text-center text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-7xl">
          <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-transparent">
            Азтай Монгол
          </span>
          <br />
          <span className="text-white/90">Сугалаа</span>
        </h1>

        <p className="mt-6 max-w-lg text-center text-lg leading-relaxed text-white/40">
          Азтай монгол сугалаанд оролцож, хүссэн бүтээгдэхүүнээ хожоорой.
          Тасалбараа авч, хожлоо шалгаарай.
        </p>

        <a
          href="#lottery"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3.5 text-sm font-semibold text-black transition hover:brightness-110"
        >
          Сугалаа үзэх
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="mt-px"
          >
            <path
              d="M8 3v10m0 0l4-4m-4 4L4 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>

        {/* subtle scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="h-8 w-5 rounded-full border border-white/20 p-1">
            <div className="mx-auto h-2 w-1 animate-bounce rounded-full bg-white/40" />
          </div>
        </div>
      </section>

      {/* ============ LOTTERY ITEMS ============ */}
      <section id="lottery" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
            Идэвхтэй сугалаанууд
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Сугалаанд оролцох
          </h2>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-24 text-center">
            <p className="text-lg text-white/30">
              Одоогоор идэвхтэй сугалаа байхгүй байна
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const pct =
                item.total_tickets > 0
                  ? Math.round(
                      (item.sold_tickets / item.total_tickets) * 100,
                    )
                  : 0;
              const remaining = item.total_tickets - item.sold_tickets;

              return (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition hover:border-white/10 hover:bg-white/[0.04]"
                >
                  {/* image */}
                  {item.image_url ? (
                    <div className="relative aspect-[16/10] w-full overflow-hidden">
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                    </div>
                  ) : (
                    <div className="flex aspect-[16/10] w-full items-center justify-center bg-white/[0.03]">
                      <span className="text-4xl">🎫</span>
                    </div>
                  )}

                  <div className="space-y-4 p-5">
                    {/* title + price */}
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold leading-snug">
                        {item.name}
                      </h3>
                      <span className="shrink-0 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-400">
                        {item.price.toLocaleString()}₮
                      </span>
                    </div>

                    {/* progress */}
                    <div>
                      <Progress
                        value={pct}
                        className="[&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:bg-white/10 [&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-amber-500 [&_[data-slot=progress-indicator]]:to-orange-500"
                      >
                        <ProgressLabel className="text-xs text-white/50">
                          Тасалбар
                        </ProgressLabel>
                        <ProgressValue className="text-xs text-white/50" />
                      </Progress>
                      <p className="mt-2 text-xs text-white/30">
                        {remaining.toLocaleString()} тасалбар үлдсэн
                      </p>
                    </div>

                    {/* bank */}
                    <div className="rounded-xl bg-white/[0.04] p-3">
                      <p className="mb-1 text-[11px] uppercase tracking-wider text-white/30">
                        Дансны дугаар
                      </p>
                      <p className="font-mono text-sm tracking-wider text-white/70">
                        {item.bank_account_number}
                      </p>
                    </div>

                    {/* links */}
                    <div className="flex gap-2">
                      {item.facebook_url && (
                        <a
                          href={item.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-xs font-medium text-white/50 transition hover:border-white/10 hover:text-white/80"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-3.5 w-3.5"
                          >
                            <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
                          </svg>
                          Facebook
                        </a>
                      )}
                      {item.google_sheet_url && (
                        <a
                          href={item.google_sheet_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-xs font-medium text-white/50 transition hover:border-white/10 hover:text-white/80"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-3.5 w-3.5"
                          >
                            <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 2v3H5V5h14ZM5 10h6v4H5v-4Zm8 0h6v4h-6v-4Zm-8 6h6v3H5v-3Zm8 3v-3h6v3h-6Z" />
                          </svg>
                          Хожлоо шалгах
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ============ HOW TO CHECK ============ */}
      <section id="how-to" className="border-t border-white/5 bg-white/[0.01]">
        <div className="mx-auto max-w-4xl px-6 py-24">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              Хэрхэн шалгах вэ?
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Хожлоо шалгах заавар
            </h2>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Тасалбар авах",
                desc: "Сугалааны тасалбарыг дансруу мөнгө шилжүүлж худалдан аваарай. Гүйлгээний утга дээр утасны дугаараа бичнэ үү.",
              },
              {
                step: "02",
                title: "Хожлоо шалгах",
                desc: 'Сугалааны картан дээрх "Хожлоо шалгах" товч дээр дарж Google Sheet-ээс утасны дугаараараа хайлт хийж шалгана уу.',
              },
              {
                step: "03",
                title: "Шагналаа авах",
                desc: "Хэрвээ таны дугаар хожсон бол манай Facebook хуудсаар холбогдон шагналаа авна уу.",
              },
            ].map((s) => (
              <div key={s.step} className="bg-[#0a0a0a] p-8">
                <span className="mb-4 inline-block font-mono text-3xl font-bold text-amber-500/30">
                  {s.step}
                </span>
                <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-white/40">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          {/* detail box */}
          <div className="mt-8 rounded-2xl border border-amber-500/10 bg-amber-500/[0.03] p-6 sm:p-8">
            <div className="flex gap-4">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </span>
              <div>
                <h4 className="mb-1 font-semibold text-amber-200">
                  Анхаарах зүйлс
                </h4>
                <ul className="space-y-1.5 text-sm leading-relaxed text-white/40">
                  <li>
                    Гүйлгээний утга дээр заавал утасны дугаараа бичнэ үү,
                    тэгэхгүй бол тасалбар баталгаажихгүй.
                  </li>
                  <li>
                    Нэг удаагийн шилжүүлгээр олон тасалбар авах бол үнийн
                    дүнг тасалбарын тоогоор үржүүлнэ үү.
                  </li>
                  <li>
                    Хожлын сугалаа Facebook хуудсаар LIVE дамжуулан явагдана.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ RULES / NO REFUND ============ */}
      <section id="rules" className="border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6 py-24">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              Нөхцөл
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Үйлчилгээний нөхцөл
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05]">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white/60"
                >
                  <path d="M9 12l2 2 4-4" />
                  <path d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z" />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold">Оролцох нөхцөл</h3>
              <p className="text-sm leading-relaxed text-white/40">
                Сугалаанд оролцохын тулд заасан дансруу тасалбарын үнийн дүнг
                шилжүүлж, гүйлгээний утганд утасны дугаараа бичнэ. Тасалбар
                батлагдсан тохиолдолд Google Sheet дээр таны мэдээлэл бүртгэгдэнэ.
              </p>
            </div>

            <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.03] p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-red-400"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold">Буцаалтгүй</h3>
              <p className="text-sm leading-relaxed text-white/40">
                Тасалбар худалдан авсны дараа буцаалт хийгдэхгүй болохыг
                анхаарна уу. Сугалаанд оролцсон тохиолдолд та энэхүү нөхцөлийг
                хүлээн зөвшөөрсөнд тооцно.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-white/5 bg-white/[0.01]">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.jpg"
                alt="Азтай Монгол"
                width={28}
                height={28}
                className="rounded-full"
              />
              <span className="text-sm font-semibold text-white/70">
                Азтай Монгол Сугалаа
              </span>
            </div>

            <div className="text-center text-xs leading-relaxed text-white/25 sm:text-right">
              <p>
                &copy; {new Date().getFullYear()} Азтай Монгол. Бүх эрх
                хуулиар хамгаалагдсан.
              </p>
              <p className="mt-1">
                Энэхүү вэбсайт нь Монгол Улсын хуулийн дагуу сугалааны
                үйл ажиллагаа эрхлэх албан ёсны зөвшөөрөлтэй.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
