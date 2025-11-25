import { description, title } from "@/lib/metadata";
import Quiz from "@/components/quiz";
import { generateMetadata } from "@/lib/farcaster-embed";

export { generateMetadata };

export default function Home() {
  return (
    <main className="flex flex-col gap-3 place-items-center place-content-center px-4 grow">
      <Quiz />
    </main>
  );
}
