import { Card, CardContent } from "@/components/ui/card"
import { Construction } from "lucide-react"

interface GenericPageProps {
  title: string;
  description: string;
}

export default function GenericPage({ title, description }: GenericPageProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
        <p className="text-zinc-500 mt-1">{description}</p>
      </div>

      <Card className="bg-zinc-950/50 backdrop-blur-xl border-zinc-800/60 shadow-lg flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <CardContent className="flex flex-col items-center justify-center text-center p-12">
          <div className="h-20 w-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
            <Construction className="h-10 w-10 text-zinc-500" />
          </div>
          <h2 className="text-xl font-medium text-white mb-2">Module Under Construction</h2>
          <p className="text-zinc-400 max-w-md">
            The {title} module is currently being connected to Firebase backend services and will be available in the next deployment cycle.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
