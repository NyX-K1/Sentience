import JournalTemplatesHero from "@/components/ui/journal-templates-hero";
import NeuralBackground from "@/components/ui/flow-field-background";

export default function SmartJournal() {
    return (
        <div className="h-screen w-full overflow-hidden bg-[#0a0a0a] relative">
            <div className="absolute inset-0 z-0">
                <NeuralBackground
                    color="#818cf8"
                    trailOpacity={0.1}
                    speed={0.8}
                />
            </div>
            {/* 
              JournalTemplatesHero handles its own internal virtual scrolling. 
              We just provide the container. 
            */}
            <div className="relative z-10 w-full h-full">
                <JournalTemplatesHero />
            </div>
        </div>
    );
}
