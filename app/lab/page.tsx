import { CanvasBoundary } from "@/components/suit/three/CanvasBoundary";
import { Stage3D } from "@/components/suit/three/Stage3D";

export const metadata = { robots: { index: false, follow: false } };

export default function Lab() {
  return (
    <main className="h-[100svh] w-full">
      <CanvasBoundary>
        <Stage3D />
      </CanvasBoundary>
    </main>
  );
}
