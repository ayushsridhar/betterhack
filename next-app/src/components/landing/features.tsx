import {
  Layers,
  Sparkles,
  Type,
  Download,
} from "lucide-react"

const features = [
  {
    icon: Layers,
    title: "Timeline Editing",
    description:
      "Multi-track timeline with drag-and-drop clips, trimming, splitting, and precise frame-level control.",
  },
  {
    icon: Sparkles,
    title: "Filters & Effects",
    description:
      "Apply color grading, blur, brightness, and more with real-time preview on the canvas.",
  },
  {
    icon: Type,
    title: "Text Overlays",
    description:
      "Add animated titles, subtitles, and captions with full control over fonts, colors, and positioning.",
  },
  {
    icon: Download,
    title: "Export to MP4",
    description:
      "Render your project to MP4 directly in the browser using WebCodecs. No server required.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-text-primary text-center mb-4">
          Everything You Need
        </h2>
        <p className="text-text-secondary text-center mb-16 max-w-xl mx-auto">
          Professional editing tools that run entirely client-side, keeping your
          media private and your workflow fast.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-bg-raised border border-border-subtle rounded-lg p-6 hover:border-border-default transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-accent-muted flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
