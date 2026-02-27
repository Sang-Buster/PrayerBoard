import Image from "next/image";
import PrayerForm from "@/components/prayer-form";

export default function HomePage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg flex flex-col items-center">
        <Image
          src="/favicon.png"
          alt="Prayer Wall"
          width={120}
          height={120}
          className="mb-8 w-20 h-20 sm:w-[120px] sm:h-[120px]"
          priority
        />
        <PrayerForm />
      </div>
    </div>
  );
}
