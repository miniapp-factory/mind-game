import { generateMetadata } from "@/lib/farcaster-embed";
import GemSlideFusion from "@/components/gem-slide-fusion";

export { generateMetadata };

export default function Home() {
  return (
    <main className="flex flex-col gap-3 place-items-center place-content-center px-4 grow">
      <GemSlideFusion />
    </main>
  );
}
