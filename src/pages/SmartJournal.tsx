
import JournalTemplatesHero from "@/components/ui/journal-templates-hero";

export default function SmartJournal() {
    return (
        <div className="h-screen w-full overflow-hidden bg-[#0a0a0a]">
            {/* 
              JournalTemplatesHero handles its own internal virtual scrolling. 
              We just provide the container. 
            */}
            <JournalTemplatesHero />
        </div>
    );
}
