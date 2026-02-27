import Image from "next/image";
import PrayerForm from "@/components/prayer-form";

export default function HomePage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg flex flex-col items-center">
        <Image
          src="/favicon.png"
          alt="Prayer Wall"
          width={180}
          height={180}
          className="mb-8 w-[120px] h-[120px] sm:w-[180px] sm:h-[180px]"
          priority
        />
        <PrayerForm />
      </div>
    </div>
  );
}
